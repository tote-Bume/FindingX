#!/system/bin/sh
SKIPUNZIP=0

ui_print "****************************************"
ui_print " Finding XS, Achieving Success"
ui_print " IFAS + SF 双引擎"
ui_print "****************************************"
ARCH=$(getprop ro.product.cpu.abi)
if [ "$ARCH" != "arm64-v8a" ]; then
    ui_print "! 当前架构：$ARCH"
    ui_print "! 仅支持 arm64-v8a，安装中止"
    abort
fi
ui_print "- 架构检查通过：arm64-v8a"
if [ -e /proc/perfmgr/perf_ioctl ]; then
    ui_print "- 检测到 /proc/perfmgr/perf_ioctl：IFAS 通道可用"
else
    ui_print "! 未找到 /proc/perfmgr/perf_ioctl"
    ui_print "! IFAS 引擎将空转（SF 引擎不受影响）"
fi

NPARAM=$(ls /sys/module/ifas/parameters 2>/dev/null | wc -l | tr -d ' ')
if [ -n "$NPARAM" ] && [ "$NPARAM" -gt 0 ]; then
    ui_print "- ifas.ko 参数节点：$NPARAM 个"
else
    ui_print "! /sys/module/ifas/parameters 不可读，参数校准跳过"
fi
if [ -f "$MODPATH/bin/ifas.ko" ]; then
    ui_print "- 检测到 bin/ifas.ko（系统未加载时可开机侧载）"
else
    ui_print "- 未内置 ifas.ko（需要侧载时按内核版本自行放入 bin/）"
fi
DATA=/data/adb/findingx
XTS_CONF=/data/adb/xts/xts.conf
mkdir -p "$DATA/log" "$DATA/backup"
chmod 755 "$DATA"

CONF_VERSION=5

conf_version() {
    _v=$(grep -m1 '^CONF_VERSION=' "$1" 2>/dev/null | cut -d= -f2-)
    [ -n "$_v" ] && printf '%s' "$_v" || printf '0'
}

migrate_conf() {
    F="$1"; KIND="$2"
    V=$(conf_version "$F")
    [ "$V" -ge "$CONF_VERSION" ] 2>/dev/null && return 0
    _KVS=""
    if [ "$KIND" = "findingx" ]; then
        if [ "$V" -lt 2 ]; then
            _KVS="$_KVS TARGET_FPS=0 FPS_TIERS=60,90,120,144,165,185,240"
        fi
        if [ "$V" -lt 3 ]; then
            _KVS="$_KVS GPU_GUARD=1 GPU_CV_THRESHOLD=35 GPU_BUSY_HIGH=70 GPU_BOOST_MIN_PCT=60 GPU_DAMP_MAX_PCT=85 GPU_HOLD_MS=30000 GPU_CONFIRM=8"
        fi
        if [ "$V" -lt 4 ]; then
            _KVS="$_KVS SCENE_AUTO=1 SCENE_GAME_PKGS= SCENE_BROWSE_PKGS= TOUCH_BOOST=1 TB_WINDOW_MS=200 TB_MIN_EVENTS=10 TB_HOLD_MS=1000 TB_BOOST_PCT=85"
        fi
        if [ "$V" -lt 5 ]; then
            _KVS="$_KVS APP_TARGET_FPS="
        fi
    elif [ "$KIND" = "sf" ]; then
        if [ "$V" -lt 2 ]; then
            _KVS="$_KVS ENABLED=1 SF_GL_BACKPRESSURE=1 SF_PREDICTIVE_BACKPRESSURE=1 SF_LAYER_CACHING=0 SF_FRAME_RATE_OVERRIDE=1 SF_FRAME_RATE_MULTIPLE_THRESHOLD=0 SF_IDLE_TIMER_MS=0 SF_LATCH_UNSIGNALED=0 SF_BOOST_CPUSET=1 SF_CPUSET_GROUP=top-app"
        fi
    elif [ "$KIND" = "xts" ]; then
        if [ "$V" -lt 3 ]; then
            _KVS="$_KVS ENABLED=1 PROFILE=balanced SCAN_MS=1000 TARGET_APPS= AFFINITY_MODE=1 UCLAMP_MODE=0 FOREGROUND_ONLY=1 THREAD_CPUSET= LOG_LEVEL=1"
        fi
    fi
    if [ -n "$_KVS" ]; then
        for kv in $_KVS; do
            _k=${kv%%=*}
            grep -q "^${_k}=" "$F" 2>/dev/null || printf '%s\n' "$kv" >> "$F"
        done
    fi
    TMP="$F.cv.$$"
    grep -v '^CONF_VERSION=' "$F" > "$TMP" 2>/dev/null || : > "$TMP"
    printf 'CONF_VERSION=%s\n' "$CONF_VERSION" >> "$TMP"
    mv "$TMP" "$F"
    chmod 644 "$F"
}
if [ ! -f "$DATA/findingx.conf" ]; then
    cp "$MODPATH/config/findingx.conf" "$DATA/findingx.conf"
    ui_print "- 已安装默认主配置（$DATA/findingx.conf）"
else
    migrate_conf "$DATA/findingx.conf" findingx
    ui_print "- 已有主配置，已应用迁移（CONF_VERSION=$(conf_version "$DATA/findingx.conf")）"
fi
if [ ! -f "$DATA/sf.conf" ]; then
    cp "$MODPATH/config/sf.conf" "$DATA/sf.conf"
    ui_print "- 已安装默认 SF 配置（$DATA/sf.conf）"
else
    migrate_conf "$DATA/sf.conf" sf
    ui_print "- 已有 SF 配置，已应用迁移（CONF_VERSION=$(conf_version "$DATA/sf.conf")）"
fi
if [ ! -f "$XTS_CONF" ]; then
    mkdir -p /data/adb/xts
    cp "$MODPATH/config/xts.conf" "$XTS_CONF"
    ui_print "- 已安装默认 XTS 配置（$XTS_CONF）"
else
    migrate_conf "$XTS_CONF" xts
    ui_print "- 已有 XTS 配置，已应用迁移（CONF_VERSION=$(conf_version "$XTS_CONF")）"
fi
KREL=$(uname -r 2>/dev/null)
[ -z "$KREL" ] && KREL=$(cat /proc/sys/kernel/osrelease 2>/dev/null)
KMAJ=$(printf '%s' "$KREL" | cut -d. -f1)
KMIN=$(printf '%s' "$KREL" | cut -d. -f2)
KPROFILE="$KMAJ.$KMIN"
case "$KPROFILE" in
    6.6)
        ui_print "- 内核 $KREL -> 策略 6.6（36 参数；SF 通道仍会尝试，失败自动降级）"
        ;;
    6.12)
        ui_print "- 内核 $KREL -> 策略 6.12（37 参数；SF 通道仍会尝试，失败自动降级）"
        ;;
    6.18)
        ui_print "- 内核 $KREL -> 策略 6.18（52 参数，含 SF 通道 0x4040672d）"
        ;;
    *)
        ui_print "- 内核 $KREL -> 未识别，按旧 ABI 运行（SF 通道仍会尝试，失败自动降级）"
        KPROFILE="auto"
        ;;
esac
if [ -f "$DATA/findingx.conf" ]; then
    KPTMP="$DATA/findingx.conf.kp.$$"
    KPFOUND=0
    while IFS= read -r kpline || [ -n "$kpline" ]; do
        case "$kpline" in
            KERNEL_PROFILE=*)
                printf 'KERNEL_PROFILE=%s\n' "$KPROFILE"
                KPFOUND=1
                ;;
            *)
                printf '%s\n' "$kpline"
                ;;
        esac
    done < "$DATA/findingx.conf" > "$KPTMP"
    if [ "$KPFOUND" = "0" ]; then
        printf '\nKERNEL_PROFILE=%s\n' "$KPROFILE" >> "$KPTMP"
    fi
    mv "$KPTMP" "$DATA/findingx.conf"
    ui_print "- 已写入 KERNEL_PROFILE=$KPROFILE"
fi
set_perm_recursive "$MODPATH" 0 0 0755 0644
set_perm "$MODPATH/bin/fxd" 0 0 0755
set_perm "$MODPATH/bin/fx.sh" 0 0 0755
set_perm "$MODPATH/bin/watchdog.sh" 0 0 0755
set_perm "$MODPATH/bin/xtsd" 0 0 0755
set_perm "$MODPATH/bin/fx-agent" 0 0 0755
set_perm "$MODPATH/bin/sf-cpuset.sh" 0 0 0755
set_perm "$MODPATH/post-fs-data.sh" 0 0 0755
set_perm "$MODPATH/service.sh" 0 0 0755
set_perm "$MODPATH/uninstall.sh" 0 0 0755

ui_print "- 安装完成：重启后生效"
ui_print "  IFAS 引擎：开机由 service.sh 拉起 fxd 守护"
ui_print "  SF  引擎：post-fs-data 写 debug.sf.*，旧内核由 sf_compat 接管"
ui_print "  控制：编辑 /data/adb/findingx/findingx.conf 或使用 bin/fx.sh"
ui_print "****************************************"
