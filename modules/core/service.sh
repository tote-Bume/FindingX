#!/system/bin/sh
MODDIR=${0%/*}
DATA=/data/adb/findingx
LOG="$DATA/log/fx.log"

mkdir -p "$DATA/log" 2>/dev/null

log() {
    printf '%s %s\n' "$(date '+%m-%d %H:%M:%S' 2>/dev/null)" "$*" >>"$LOG" 2>/dev/null
}
pid_is() {
    [ -n "$1" ] && [ -r "/proc/$1/cmdline" ] || return 1
    _cmdline=$(tr '\0' ' ' <"/proc/$1/cmdline" 2>/dev/null)
    case "$_cmdline" in
        *"/$2"|*"/$2 "*|"$2"|"$2 "*) return 0 ;;
    esac
    return 1
}
[ -f "$DATA/findingx.conf" ] || cp "$MODDIR/config/findingx.conf" "$DATA/findingx.conf" 2>/dev/null
if [ -f "$DATA/fxd.pid" ]; then
    OLDPID=$(cat "$DATA/fxd.pid" 2>/dev/null)
    if pid_is "$OLDPID" fxd; then
        log "终止残留 fxd：$OLDPID"
        kill -TERM "$OLDPID" 2>/dev/null
        sleep 1
        kill -KILL "$OLDPID" 2>/dev/null
    elif [ -n "$OLDPID" ]; then
        log "pidfile 陈旧（pid=$OLDPID 不是 fxd），仅清理，不发送信号"
    fi
    rm -f "$DATA/fxd.pid"
fi

log "=== service start ==="
SIDELOAD=$(grep -m1 '^SIDELOAD=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
[ -z "$SIDELOAD" ] && SIDELOAD=0

if [ "$SIDELOAD" != "1" ]; then
    log "SIDELOAD=0，跳过侧载（模块不再内置 ko；需要时把对应内核版本的 ifas.ko 放到 bin/ 再设 SIDELOAD=1）"
elif [ ! -d /sys/module/ifas ]; then
    if [ -f "$MODDIR/bin/ifas.ko" ]; then
        if insmod "$MODDIR/bin/ifas.ko" 2>/dev/null; then
            log "侧载 ifas.ko 成功"
        elif insmod -f "$MODDIR/bin/ifas.ko" 2>/dev/null; then
            log "侧载 ifas.ko 成功（强制模式）"
        else
            log "! 侧载 ifas.ko 失败（签名/vermagic 限制），IFAS 通道不可用"
        fi
    else
        log "! 未找到 bin/ifas.ko（请按内核版本自行放入），跳过侧载"
    fi
else
    log "ifas.ko 已由系统加载，跳过侧载"
fi
ENABLED=$(grep -m1 '^ENABLED=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
[ -z "$ENABLED" ] && ENABLED=1

if [ "$ENABLED" = "1" ]; then
    if [ ! -x "$MODDIR/bin/fxd" ]; then
        log "! 缺少 fxd 二进制：$MODDIR/bin/fxd"
    else
        nohup "$MODDIR/bin/fxd" run >/dev/null 2>&1 &
        NEWPID=$!
        echo "$NEWPID" > "$DATA/fxd.pid"
        log "fxd 已启动 pid=$NEWPID"
        sleep 2
        if kill -0 "$NEWPID" 2>/dev/null; then
            log "fxd 存活确认 pid=$NEWPID"
        else
            log "! fxd 启动后 2s 内退出，查看 $DATA/log/fxd.log"
        fi
    fi
else
    log "ENABLED=0，跳过 fxd"
fi

THREAD_DAEMON=$(grep -m1 '^THREAD_DAEMON=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
[ -z "$THREAD_DAEMON" ] && THREAD_DAEMON=1
if [ -d /data/adb/modules/xts ]; then
    log "检测到独立 XTS 模块，跳过内置 xtsd"
elif [ "$THREAD_DAEMON" = "1" ] && [ -x "$MODDIR/bin/xtsd" ]; then
    mkdir -p /data/adb/xts/log
    [ -f /data/adb/xts/xts.conf ] || cp "$MODDIR/config/xts.conf" /data/adb/xts/xts.conf 2>/dev/null
    XOLD=$(cat /data/adb/xts/xtsd.pid 2>/dev/null)
    if pid_is "$XOLD" xtsd; then
        log "xtsd 已在运行 pid=$XOLD"
    else
        if [ -x "$MODDIR/bin/xtsd" ]; then
            "$MODDIR/bin/xtsd" stop >/dev/null 2>&1
        fi
        nohup "$MODDIR/bin/xtsd" run >>/data/adb/xts/log/xtsd.log 2>&1 &
        XPID=$!
        echo "$XPID" > /data/adb/xts/xtsd.pid
        sleep 1
        if pid_is "$XPID" xtsd; then
            log "xtsd 已启动 pid=$XPID"
        else
            log "! xtsd 启动失败，见 /data/adb/xts/log/xtsd.log"
        fi
    fi
fi

AGENT_ENABLE=$(grep -m1 '^AGENT_ENABLE=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
[ -z "$AGENT_ENABLE" ] && AGENT_ENABLE=1
if [ "$AGENT_ENABLE" = "1" ] && [ -x "$MODDIR/bin/fx-agent" ]; then
    AOLD=$(cat "$DATA/agent.pid" 2>/dev/null)
    if pid_is "$AOLD" fx-agent; then
        log "fx-agent 已在运行 pid=$AOLD"
    else
        rm -f "$DATA/agent.stop"
        nohup "$MODDIR/bin/fx-agent" run >>"$DATA/log/agent.log" 2>&1 &
        APID=$!
        echo "$APID" > "$DATA/agent.pid"
        sleep 1
        if pid_is "$APID" fx-agent; then
            log "fx-agent 已启动 pid=$APID"
        else
            log "! fx-agent 启动失败，见 $DATA/log/agent.log"
        fi
    fi
fi

if [ -x "$MODDIR/bin/sf-cpuset.sh" ]; then
    nohup "$MODDIR/bin/sf-cpuset.sh" >/dev/null 2>&1 &
fi

if [ -x "$MODDIR/bin/watchdog.sh" ]; then
    WOLD=$(cat "$DATA/watchdog.pid" 2>/dev/null)
    if pid_is "$WOLD" watchdog.sh; then
        log "watchdog 已在运行 pid=$WOLD，不重复启动"
    else
        nohup "$MODDIR/bin/watchdog.sh" >/dev/null 2>&1 &
        log "watchdog 已启动 pid=$!"
    fi
else
    log "! 缺少 watchdog.sh，软重启后不会自动恢复"
fi

log "=== service done ==="
exit 0
