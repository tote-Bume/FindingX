#!/system/bin/sh
MODDIR=${0%/*}
if [ ! -f "$MODDIR/bin/fxd" ]; then
    MODDIR=/data/adb/modules/findingx
fi
DATA=/data/adb/findingx
pid_is() {
    [ -n "$1" ] && [ -r "/proc/$1/cmdline" ] || return 1
    _cmdline=$(tr '\0' ' ' <"/proc/$1/cmdline" 2>/dev/null)
    case "$_cmdline" in
        *"$2"*) return 0 ;;
    esac
    return 1
}
if [ -f "$DATA/watchdog.pid" ]; then
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
fi
if [ -f "$DATA/agent.pid" ]; then
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
fi

if [ ! -d /data/adb/modules/xts ] && [ -x "$MODDIR/bin/xtsd" ] && [ -f /data/adb/xts/xtsd.pid ]; then
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
fi

if [ -f "$DATA/fxd.pid" ]; then
    PID=$(cat "$DATA/fxd.pid" 2>/dev/null)
    if pid_is "$PID" fxd; then
        kill -TERM "$PID" 2>/dev/null

        i=0
        while [ $i -lt 10 ] && kill -0 "$PID" 2>/dev/null; do
            sleep 1
            i=$((i + 1))
        done
        kill -KILL "$PID" 2>/dev/null
    fi
    rm -f "$DATA/fxd.pid"
fi
if [ -x "$MODDIR/bin/fxd" ]; then
    "$MODDIR/bin/fxd" recover >/dev/null 2>&1
fi
if command -v resetprop >/dev/null 2>&1; then
    for p in debug.sf.enable_gl_backpressure \
             debug.sf.enable_predictive_backpressure \
             debug.sf.enable_layer_caching \
             debug.sf.enable_frame_rate_override \
             debug.sf.frame_rate_multiple_threshold \
             debug.sf.set_idle_timer_ms \
             debug.sf.latch_unsignaled; do
        resetprop --delete "$p" 2>/dev/null
    done
fi

[ -d /data/adb/modules/xts ] || rm -rf /data/adb/xts

rm -rf "$DATA"

rm -f /data/adb/findingx/watchdog.state /data/adb/findingx/watchdog.log
exit 0
