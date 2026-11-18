#!/system/bin/sh

DATA=/data/adb/findingx
SELF_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd)
MODDIR=$(cd "$SELF_DIR/.." 2>/dev/null && pwd)
if [ -z "$MODDIR" ] || [ ! -f "$MODDIR/bin/fxd" ]; then
    MODDIR=/data/adb/modules/findingx
fi
FXD="$MODDIR/bin/fxd"
XTSD="$MODDIR/bin/xtsd"
AGENT="$MODDIR/bin/fx-agent"
CONF="$DATA/findingx.conf"
PIDF="$DATA/fxd.pid"
WATCH_PID="$DATA/watchdog.pid"
STATE="$DATA/watchdog.state"

POLL=15
BACKOFF_MAX=300

pid_is() {
    [ -n "$1" ] && [ -r "/proc/$1/cmdline" ] || return 1
    _cmdline=$(tr '\0' ' ' <"/proc/$1/cmdline" 2>/dev/null)
    case "$_cmdline" in
        *"/$2"|*"/$2 "*|"$2"|"$2 "*) return 0 ;;
    esac
    return 1
}

st_get() {
    _rec=$(grep "^$1 " "$STATE" 2>/dev/null | tail -n1)
    _f=$(echo "$_rec" | awk '{print $2}')
    _t=$(echo "$_rec" | awk '{print $3}')
    echo "${_f:-0} ${_t:-0}"
}

st_put() {
    touch "$STATE" 2>/dev/null
    grep -v "^$1 " "$STATE" 2>/dev/null > "$STATE.tmp" 2>/dev/null
    echo "$1 $2 $3" >> "$STATE.tmp"
    mv "$STATE.tmp" "$STATE"
}

may_restart() {
    NAME=$1
    NOW=$(date +%s)
    set -- $(st_get "$NAME")
    FAILS=$1
    NEXT_OK=$2
    if [ "$NOW" -lt "$NEXT_OK" ] 2>/dev/null; then
        return 1
    fi
    FAILS=$((FAILS + 1))

    D=$POLL
    I=1
    while [ $I -lt $FAILS ]; do
        D=$((D * 2))
        [ $D -gt $BACKOFF_MAX ] && D=$BACKOFF_MAX
        I=$((I + 1))
    done
    st_put "$NAME" "$FAILS" "$((NOW + D))"

    WLOG="$DATA/log/watchdog.log"
    if [ -f "$WLOG" ]; then
        WSIZE=$(wc -c < "$WLOG" 2>/dev/null)
        if [ -n "$WSIZE" ] && [ "$WSIZE" -gt 65536 ] 2>/dev/null; then
            HALF=$((WSIZE / 2))
            tail -c "$HALF" "$WLOG" > "$WLOG.tmp" 2>/dev/null && mv "$WLOG.tmp" "$WLOG"
        fi
    fi

    if [ "$FAILS" -ge 4 ] 2>/dev/null; then
        echo "$(date '+%m-%d %H:%M:%S') watchdog: [ALERT] $NAME 连续 $FAILS 次崩溃(顶格退避)，疑似系统级故障，休眠 10 分钟后重试" >> "$WLOG" 2>/dev/null
        sleep 600
    fi
    echo "$(date '+%m-%d %H:%M:%S') watchdog: $NAME 重启（第 $FAILS 次，退避 ${D}s）" >> "$WLOG" 2>/dev/null
    return 0
}

mark_alive() {
    NAME=$1
    set -- $(st_get "$NAME")
    if [ "$2" != "0" ] || [ "$1" != "0" ]; then
        st_put "$NAME" 0 0
    fi
}

if [ -f "$WATCH_PID" ]; then
    OLDW=$(cat "$WATCH_PID" 2>/dev/null)
    if [ -n "$OLDW" ] && [ "$OLDW" != "$$" ] && pid_is "$OLDW" watchdog.sh; then
        exit 0
    fi
fi

echo $$ > "$WATCH_PID" 2>/dev/null

while :; do
    sleep $POLL

    if [ ! -f "$CONF" ]; then
        continue
    fi

    P=$(cat "$PIDF" 2>/dev/null)
    if pid_is "$P" fxd; then
        mark_alive fxd
    else
        EN=$(grep -m1 '^ENABLED=' "$CONF" 2>/dev/null | cut -d= -f2-)
        if [ "$EN" = "1" ] && [ -x "$FXD" ] && may_restart fxd; then
            nohup "$FXD" run >/dev/null 2>&1 &
            echo $! > "$PIDF"
        fi
    fi

    THREAD_DAEMON=$(grep -m1 '^THREAD_DAEMON=' "$CONF" 2>/dev/null | cut -d= -f2-)
    [ -z "$THREAD_DAEMON" ] && THREAD_DAEMON=1
    if [ "$THREAD_DAEMON" = "1" ] && [ -x "$XTSD" ] && [ ! -d /data/adb/modules/xts ]; then
        XPIDF=/data/adb/xts/xtsd.pid
        XP=$(cat "$XPIDF" 2>/dev/null)
        if pid_is "$XP" xtsd; then
            mark_alive xtsd
        elif may_restart xtsd; then
            mkdir -p /data/adb/xts/log
            [ -f /data/adb/xts/xts.conf ] || cp "$MODDIR/config/xts.conf" /data/adb/xts/xts.conf 2>/dev/null
            nohup "$XTSD" run >>/data/adb/xts/log/xtsd.log 2>&1 &
            echo $! > "$XPIDF"
        fi
    fi

    AGENT_ENABLE=$(grep -m1 '^AGENT_ENABLE=' "$CONF" 2>/dev/null | cut -d= -f2-)
    [ -z "$AGENT_ENABLE" ] && AGENT_ENABLE=1
    if [ "$AGENT_ENABLE" = "1" ] && [ -x "$AGENT" ]; then
        APIDF="$DATA/agent.pid"
        AP=$(cat "$APIDF" 2>/dev/null)
        if pid_is "$AP" fx-agent; then
            mark_alive agent
        elif may_restart agent; then
            rm -f "$DATA/agent.stop"
            nohup "$AGENT" run >>"$DATA/log/agent.log" 2>&1 &
            echo $! > "$APIDF"
        fi
    fi
done
