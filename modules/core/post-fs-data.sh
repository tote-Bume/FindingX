#!/system/bin/sh
MODDIR=${0%/*}
DATA=/data/adb/findingx
CFG="$DATA/sf.conf"
[ -f "$CFG" ] || CFG="$MODDIR/config/sf.conf"
LOG="$DATA/log/sf.log"

mkdir -p "$DATA/log" 2>/dev/null

log() {
    printf '%s %s\n' "$(date '+%m-%d %H:%M:%S' 2>/dev/null)" "$*" >>"$LOG" 2>/dev/null
}

cfg_get() {
    _k="$1"
    _d="$2"
    _v=$(grep -m1 "^${_k}=" "$CFG" 2>/dev/null | cut -d= -f2-)
    if [ -z "$_v" ]; then
        echo "$_d"
    else
        echo "$_v"
    fi
}

setprop2() {
    if command -v resetprop >/dev/null 2>&1; then
        resetprop "$1" "$2" 2>/dev/null && log "  resetprop $1=$2" && return 0
    fi
    setprop "$1" "$2" 2>/dev/null && log "  setprop $1=$2" && return 0
    log "  FAILED $1=$2"
    return 1
}

log "=== sf start ==="

if [ ! -f "$CFG" ]; then
    log "missing $CFG"
    exit 0
fi

if [ "$(cfg_get ENABLED 0)" != "1" ]; then
    log "ENABLED != 1"
    exit 0
fi

if [ "$(cfg_get SF_GL_BACKPRESSURE 1)" = "1" ]; then
    setprop2 debug.sf.enable_gl_backpressure 1
fi

if [ "$(cfg_get SF_PREDICTIVE_BACKPRESSURE 1)" = "1" ]; then
    setprop2 debug.sf.enable_predictive_backpressure 1
fi

if [ "$(cfg_get SF_LAYER_CACHING 1)" = "1" ]; then
    setprop2 debug.sf.enable_layer_caching 1
fi

if [ "$(cfg_get SF_FRAME_RATE_OVERRIDE 1)" = "1" ]; then
    setprop2 debug.sf.enable_frame_rate_override 1
fi

THRESH=$(cfg_get SF_FRAME_RATE_MULTIPLE_THRESHOLD "")
if [ -n "$THRESH" ] && [ "$THRESH" != "0" ]; then
    setprop2 debug.sf.frame_rate_multiple_threshold "$THRESH"
fi

IDLE=$(cfg_get SF_IDLE_TIMER_MS 0)
if [ -n "$IDLE" ] && [ "$IDLE" != "0" ]; then
    setprop2 debug.sf.set_idle_timer_ms "$IDLE"
fi

if [ "$(cfg_get SF_LATCH_UNSIGNALED 0)" = "1" ]; then
    log "latch_unsignaled enabled"
    setprop2 debug.sf.latch_unsignaled 1
fi

log "=== sf done ==="
exit 0
