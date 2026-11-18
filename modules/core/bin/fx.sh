#!/system/bin/sh
MODDIR=${0%/*}
[ -d "$MODDIR" ] || MODDIR=/data/adb/modules/findingx
DATA=/data/adb/findingx
LOG="$DATA/log"

die() { echo "错误: $*"; exit 1; }
pid_is() {
    [ -n "$1" ] && [ -r "/proc/$1/cmdline" ] || return 1
    _cmdline=$(tr '\0' ' ' <"/proc/$1/cmdline" 2>/dev/null)
    case "$_cmdline" in
        *"/$2"|*"/$2 "*|"$2"|"$2 "*) return 0 ;;
    esac
    return 1
}
stop_watchdog() {
    [ -f "$DATA/watchdog.pid" ] || return 0
    WP=$(cat "$DATA/watchdog.pid" 2>/dev/null)
    if pid_is "$WP" watchdog.sh; then
        kill -TERM "$WP" 2>/dev/null
        i=0
        while [ $i -lt 5 ] && kill -0 "$WP" 2>/dev/null; do
            sleep 1
            i=$((i + 1))
        done
        kill -KILL "$WP" 2>/dev/null
    fi
    rm -f "$DATA/watchdog.pid"
}

ensure_watchdog() {
    [ -x "$MODDIR/bin/watchdog.sh" ] || return 0
    if pid_is "$(cat "$DATA/watchdog.pid" 2>/dev/null)" watchdog.sh; then
        return 0
    fi
    nohup "$MODDIR/bin/watchdog.sh" >/dev/null 2>&1 &
}

stop_agent() {
    [ -f "$DATA/agent.pid" ] || return 0
    AP=$(cat "$DATA/agent.pid" 2>/dev/null)
    if pid_is "$AP" fx-agent; then
        : > "$DATA/agent.stop"
        i=0
        while [ $i -lt 5 ] && kill -0 "$AP" 2>/dev/null; do
            sleep 1
            i=$((i + 1))
        done
        kill -TERM "$AP" 2>/dev/null
        sleep 1
        kill -KILL "$AP" 2>/dev/null
    fi
    rm -f "$DATA/agent.pid" "$DATA/agent.stop"
}

stop_xtsd() {
    [ -d /data/adb/modules/xts ] && return 0
    [ -x "$MODDIR/bin/xtsd" ] || return 0
    [ -f /data/adb/xts/xtsd.pid ] || return 0
    XP=$(cat /data/adb/xts/xtsd.pid 2>/dev/null)
    if pid_is "$XP" xtsd; then
        if ! "$MODDIR/bin/xtsd" stop >/dev/null 2>&1; then
            i=0
            while [ $i -lt 12 ] && kill -0 "$XP" 2>/dev/null; do
                sleep 1
                i=$((i + 1))
            done
            kill -TERM "$XP" 2>/dev/null
            sleep 1
            kill -KILL "$XP" 2>/dev/null
        fi
    fi
    rm -f /data/adb/xts/xtsd.pid
}

start_xtsd_agent() {
    mkdir -p "$LOG"
    THREAD_DAEMON=$(grep -m1 '^THREAD_DAEMON=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
    [ -z "$THREAD_DAEMON" ] && THREAD_DAEMON=1
    if [ "$THREAD_DAEMON" = "1" ] && [ -x "$MODDIR/bin/xtsd" ] && [ ! -d /data/adb/modules/xts ]; then
        mkdir -p /data/adb/xts/log
        [ -f /data/adb/xts/xts.conf ] || cp "$MODDIR/config/xts.conf" /data/adb/xts/xts.conf 2>/dev/null
        XP=$(cat /data/adb/xts/xtsd.pid 2>/dev/null)
        if ! pid_is "$XP" xtsd; then
            nohup "$MODDIR/bin/xtsd" run >>/data/adb/xts/log/xtsd.log 2>&1 &
            echo $! > /data/adb/xts/xtsd.pid
        fi
    fi
    AGENT_ENABLE=$(grep -m1 '^AGENT_ENABLE=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
    [ -z "$AGENT_ENABLE" ] && AGENT_ENABLE=1
    if [ "$AGENT_ENABLE" = "1" ] && [ -x "$MODDIR/bin/fx-agent" ]; then
        AP=$(cat "$DATA/agent.pid" 2>/dev/null)
        if ! pid_is "$AP" fx-agent; then
            rm -f "$DATA/agent.stop"
            nohup "$MODDIR/bin/fx-agent" run >>"$LOG/agent.log" 2>&1 &
            echo $! > "$DATA/agent.pid"
        fi
    fi
}

cmd_status() {
    echo "===== fxd ====="
    "$MODDIR/bin/fxd" status
    if [ -x "$MODDIR/bin/xtsd" ]; then
        echo "===== xtsd ====="
        "$MODDIR/bin/xtsd" status
    fi
    if [ -x "$MODDIR/bin/fx-agent" ]; then
        echo "===== agent ====="
        "$MODDIR/bin/fx-agent" status
    fi
}

cmd_start() {
    NEED=0
    if [ -f "$DATA/fxd.pid" ]; then
        PID=$(cat "$DATA/fxd.pid" 2>/dev/null)
        if pid_is "$PID" fxd; then
            :
        else
            rm -f "$DATA/fxd.pid"
            NEED=1
        fi
    else
        NEED=1
    fi
    if [ "$NEED" = "1" ]; then
        sh "$MODDIR/service.sh" >/dev/null 2>&1
    else
        ensure_watchdog
        start_xtsd_agent
    fi
    PID=$(cat "$DATA/fxd.pid" 2>/dev/null)
    if pid_is "$PID" fxd; then
        echo "fxd 运行中 pid=$PID"
    else
        echo "fxd 未启动（ENABLED=0 或缺少 fxd），见 $LOG/fx.log"
    fi
}

cmd_stop() {
    stop_watchdog
    stop_agent
    stop_xtsd
    if [ ! -f "$DATA/fxd.pid" ]; then
        echo "fxd 未运行"
        exit 0
    fi
    PID=$(cat "$DATA/fxd.pid" 2>/dev/null)
    if ! pid_is "$PID" fxd; then
        rm -f "$DATA/fxd.pid"
        echo "fxd 未运行（已清理陈旧 pidfile：$PID）"
        exit 0
    fi
    kill -TERM "$PID" 2>/dev/null || die "无法终止进程：$PID"
    i=0
    while [ $i -lt 10 ] && kill -0 "$PID" 2>/dev/null; do
        sleep 1
        i=$((i + 1))
    done
    kill -KILL "$PID" 2>/dev/null
    rm -f "$DATA/fxd.pid"
    echo "fxd 已停止（内核参数已还原，见 $LOG/fxd.log）"
}

cmd_log() {
    for f in fx.log fxd.log sf.log; do
        [ -f "$LOG/$f" ] || continue
        echo "===== $f（末 60 行）====="
        tail -n 60 "$LOG/$f"
    done
    if [ -f /data/adb/xts/log/xtsd.log ]; then
        echo "===== xtsd.log（末 60 行）====="
        tail -n 60 /data/adb/xts/log/xtsd.log
    fi
    if [ -f "$LOG/agent.log" ]; then
        echo "===== agent.log（末 60 行）====="
        tail -n 60 "$LOG/agent.log"
    fi
}

cmd_param() {
    P=/sys/module/ifas/parameters
    if [ -z "$2" ]; then
        ls "$P" 2>/dev/null | while read -r k; do
            printf '%s=%s\n' "$k" "$(cat "$P/$k" 2>/dev/null)"
        done
        return
    fi
    case "$2" in
        *=*) echo "仅支持查看：fx.sh param 或 fx.sh param <name>" ;;
        *) cat "$P/$2" 2>/dev/null || echo "无此参数：$2" ;;
    esac
}

cmd_recover() {
    "$MODDIR/bin/fxd" recover
}

case "$1" in
status) cmd_status "$@" ;;
start) cmd_start ;;
stop) cmd_stop ;;
log) cmd_log ;;
param) cmd_param "$@" ;;
recover) cmd_recover ;;
version)
    grep -E '^(version|versionCode)=' "$MODDIR/module.prop"
    "$MODDIR/bin/fxd" version
    [ -x "$MODDIR/bin/xtsd" ] && "$MODDIR/bin/xtsd" version
    [ -x "$MODDIR/bin/fx-agent" ] && "$MODDIR/bin/fx-agent" version
    ;;
"") die "用法：fx.sh status|start|stop|log|param|recover|version" ;;
*) die "未知命令：$1" ;;
esac
exit 0
