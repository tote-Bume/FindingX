#!/system/bin/sh
DATA=/data/adb/findingx
CFG="$DATA/sf.conf"
LOG="$DATA/log/fx.log"

log() {
    printf '%s %s\n' "$(date '+%m-%d %H:%M:%S' 2>/dev/null)" "$*" >>"$LOG" 2>/dev/null
}

[ -f "$CFG" ] || exit 0

EN=$(grep -m1 '^ENABLED=' "$CFG" 2>/dev/null | cut -d= -f2-)
[ "$EN" = "1" ] || exit 0

BOOST=$(grep -m1 '^SF_BOOST_CPUSET=' "$CFG" 2>/dev/null | cut -d= -f2-)
[ -z "$BOOST" ] && BOOST=1
[ "$BOOST" = "1" ] || exit 0

GROUP=$(grep -m1 '^SF_CPUSET_GROUP=' "$CFG" 2>/dev/null | cut -d= -f2-)
[ -z "$GROUP" ] && GROUP=top-app

DIR="/dev/cpuset/$GROUP"
[ -d "$DIR" ] || exit 0

i=0
while [ $i -lt 12 ]; do
    N=0
    for P in $(pidof surfaceflinger 2>/dev/null); do
        if echo "$P" >"$DIR/tasks" 2>/dev/null; then
            N=$((N + 1))
        fi
    done
    if [ "$N" -gt 0 ]; then
        log "sf cpuset: $N -> $GROUP"
    fi
    sleep 5
    i=$((i + 1))
done
exit 0
