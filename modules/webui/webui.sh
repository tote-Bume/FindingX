#!/system/bin/sh
#
# FindingX WebUI 后端
#
# 前端通过 ksu.exec("sh webui.sh <action> [arg]") 调用。
# 文本内容（配置/日志）一律 base64 传输，避免 shell/JSON 双重转义。
#
# action:
#   status               综合状态（守护 + 内核参数 + 模块版本 + state.json）
#   read_main            读主配置 → {"ok":true,"b64":"..."}
#   save_main  <b64>     写主配置
#   save_sf    <b64>     写 SF 配置
#   log       <name>     日志（fxd|sf|fx）末 200 行
#

MODDIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd)
DATA=/data/adb/findingx
if [ -x "$MODDIR/bin/fx.sh" ]; then
    CORE_DIR=$MODDIR
else
    CORE_DIR=/data/adb/modules/findingx
fi
FX="$CORE_DIR/bin/fx.sh"

pid_is() {
    [ -n "$1" ] && [ -r "/proc/$1/cmdline" ] || return 1
    _cmdline=$(tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null)
    case "$_cmdline" in *"/$2"|*"/$2 "*|"$2"|"$2 "*) return 0 ;; esac
    return 1
}

out_ok() { printf '{"ok":true,%s}\n' "$1"; }
json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\r/\\r/g; s/\t/\\t/g'; }
out_err() { printf '{"ok":false,"error":"%s"}\n' "$(json_escape "$1")"; }

# base64 单行输出（兼容 toybox/GNU）
b64() { base64 2>/dev/null | tr -d '\n'; }

# 去掉参数首尾可能残留的引号。
# 有些 WebUI 管理器用 Runtime.exec(String) 执行命令：它按空白切分且不解析引号，
# 我们传的 'findingx.conf' 会原样（含引号）落到 $2，导致 case 不匹配、写入被拒。
# 这里统一剥掉首尾引号，两种执行方式都能工作。
strip_q() {
    s=$1
    s=${s#\'}; s=${s%\'}
    s=${s#\"}; s=${s%\"}
    printf '%s' "$s"
}

action_status() {
    RUNNING=false
    if [ -f "$DATA/fxd.pid" ]; then
        PID=$(cat "$DATA/fxd.pid" 2>/dev/null)
        pid_is "$PID" fxd && RUNNING=true
    fi
    if [ -s "$DATA/state.json" ]; then
        S=$(tr -d '\r\n' < "$DATA/state.json")
        case "$S" in
        \{*\}) ;;
        *) S='{}' ;;
        esac
    else
        S='{}'
    fi
    V=$(grep -E '^version=' "$CORE_DIR/module.prop" | cut -d= -f2-)
    VC=$(grep -E '^versionCode=' "$CORE_DIR/module.prop" | cut -d= -f2-)
    IE=$(cat /sys/module/ifas/parameters/ifas_enable 2>/dev/null | tr -d '\n')
    EGP=$(cat /sys/module/ifas/parameters/enable_gpu_policy 2>/dev/null | tr -d '\n')
    DEVP="false"
    [ -e /proc/perfmgr/perf_ioctl ] && DEVP="true"
    # 环境健康：APK 启动时据此显示「加载是否成功」
    MOD_OK=0; [ -d /data/adb/modules/findingx ] && MOD_OK=1
    BE_OK=0; { [ -f "$MODDIR/webui.sh" ] || [ -f "$MODDIR/bin/webui.sh" ]; } && BE_OK=1
    FXD_OK=0; [ -x "$CORE_DIR/bin/fxd" ] && FXD_OK=1
    IFAS_OK=0; [ -d /sys/module/ifas ] && IFAS_OK=1
    ROOT_OK=0; command -v su >/dev/null 2>&1 && ROOT_OK=1
    SF_EN=$(grep -m1 '^ENABLED=' "$DATA/sf.conf" 2>/dev/null | cut -d= -f2-)
    case "$SF_EN" in 1|true|TRUE) SF_EN=1 ;; *) SF_EN=0 ;; esac
    XTS_OK=0
    XP=$(cat /data/adb/xts/xtsd.pid 2>/dev/null)
    [ -n "$XP" ] && pid_is "$XP" xtsd && XTS_OK=1
    # 内核版本与策略（策略由 customize.sh 在刷入时识别并写入配置）
    KREL=$(cat /proc/sys/kernel/osrelease 2>/dev/null | cut -d. -f1,2)
    [ -z "$KREL" ] && KREL="?"
    KPROF=$(grep -m1 '^KERNEL_PROFILE=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
    [ -z "$KPROF" ] && KPROF="auto"
    [ "$KPROF" = "auto" ] && KPROF="$KREL"
    printf '{"ok":true,"running":%s,"version":"%s","versionCode":"%s","state":%s,"ko":{"ifas_enable":"%s","enable_gpu_policy":"%s","dev":"%s"},"sf":{"enabled":%s},"xts":{"running":%s},"kernel":"%s","kernelProfile":"%s","env":{"module":%s,"backend":%s,"fxd":%s,"ifas":%s,"root":%s}}\n' \
        "$RUNNING" "$(json_escape "$V")" "$(json_escape "$VC")" "$S" "${IE:-?}" "${EGP:-?}" "$DEVP" "$SF_EN" "$XTS_OK" "$(json_escape "$KREL")" "$(json_escape "$KPROF")" "$MOD_OK" "$BE_OK" "$FXD_OK" "$IFAS_OK" "$ROOT_OK"
}

action_read_b64() {
    F="$1"
    if [ -f "$F" ]; then
        printf '{"ok":true,"b64":"%s"}\n' "$(cat "$F" | b64)"
    else
        out_err "文件不存在"
    fi
}

action_save_b64() {
    F="$1"; B="$2"; TMP="$F.tmp.$$"
    [ -n "$B" ] || { out_err "缺少内容"; return; }
    printf '%s' "$B" | base64 -d 2>/dev/null > "$TMP" || { rm -f "$TMP"; out_err "base64 解码失败"; return; }
    [ -s "$TMP" ] || { rm -f "$TMP"; out_err "内容为空，拒绝写入"; return; }
    # 粗校验：至少包含一个 KEY= 行
    grep -q '^[A-Za-z_][A-Za-z0-9_]*=' "$TMP" 2>/dev/null || { rm -f "$TMP"; out_err "内容不像配置文件（无 KEY= 行）"; return; }
    mv "$TMP" "$F"
    chmod 644 "$F"
    notify_reload
    out_ok '"saved":true'
}

# 单键原地写入：保留注释与键序。
# 为什么需要它：整份配置 base64 后命令长度约 4-5KB，部分 WebUI 管理器会截断
# 或破坏长命令，表现为“保存成功但切页/重启后又变回去”。逐键写入把每条命令
# 压到 100 字节内，并在写后回读校验。
# 修复被旧版本写坏的配置：旧前端把值做了 base64 再传，后端按明文写盘，
# 于是文件里留下 `BUSY_HIGH=MzM=` 这类值；fxd 解析失败后会回落到默认值，
# 表现为“改了也不生效”。这里在读取前原地修一次：数字类键的值若不是纯数字，
# 尝试 base64 解码，解出来是纯数字就替换。
repair_conf() {
    F="$1"
    [ -f "$F" ] || return
    TMP="$F.tmp.rp"
    CHANGED=0
    : > "$TMP" 2>/dev/null || return
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
        '#'*|'') printf '%s\n' "$line" >> "$TMP"; continue ;;
        *)
            K=${line%%=*}
            V=${line#*=}
            case "$K" in
            ENABLED|TARGET_FPS|SAMPLE_MS|BUSY_HIGH|BUSY_LOW|RELEASE_CONFIRM|COOLDOWN_MS|TEMP_LIMIT|TEMP_RESUME|TEMP_CEILING|SCAN_MS)
                case "$V" in
                ''|*[!0-9]*)
                    D=$(printf '%s' "$V" | base64 -d 2>/dev/null | tr -d ' \n\r\t')
                    case "$D" in
                    ''|*[!0-9]*) ;;                     # 解不出数字就保持原样
                    *) printf '%s=%s\n' "$K" "$D" >> "$TMP"; CHANGED=1; continue ;;
                    esac
                    ;;
                esac
                ;;
            esac
            printf '%s\n' "$line" >> "$TMP"
            ;;
        esac
    done < "$F"
    if [ "$CHANGED" = "1" ]; then
        mv "$TMP" "$F" 2>/dev/null || { rm -f "$TMP"; return; }
        chmod 644 "$F" 2>/dev/null
    else
        rm -f "$TMP"
    fi
}

action_set_conf() {
    F="$1"; K="$2"; V="$3"
    [ -n "$K" ] || { out_err "缺少键名"; return; }
    case "$K" in
    *[!A-Za-z0-9_]*|'') out_err "非法键名"; return ;;
    esac
    [ -f "$F" ] || { out_err "配置文件不存在"; return; }
    case "$F:$K" in
    *:ENABLED|*:PROFILE|*:APP_PROFILE|*:APP_TARGET_FPS|*:TARGET_FPS|*:FPS_MARGIN|*:HEAVY_FRAME_THRESHOLD_MS|*:LOADING_GUARD_FRAMES|*:FAST_DECAY_FRAME_THRESHOLD|*:FAST_DECAY_PERF_THRESHOLD)
        : ;;
    *)
        # unknown keys are allowed for forward compatibility, but reject obvious cross-file writes
        case "$F" in *sf.conf) case "$K" in SF_*) ;; *) out_err "SF 配置键不属于 sf.conf"; return;; esac;; esac
        ;;
    esac
    case "$V" in
    *'
'*) out_err "值不能含换行"; return ;;
    esac
    TMP="$F.tmp.$$"
    : > "$TMP" 2>/dev/null || { out_err "无法创建临时文件"; return; }
    FOUND=0
    # 只用 shell 内建：while read + case + printf。
    # 不依赖 awk/sed —— Android 的 toybox awk 在部分 ROM 上不支持 ENVIRON，
    # 会让 k/v 变空、替换静默失效（这正是“改了保存不上”的根因之一）。
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
        "$K"=*)
            printf '%s=%s\n' "$K" "$V" >> "$TMP"
            FOUND=1
            ;;
        *)
            printf '%s\n' "$line" >> "$TMP"
            ;;
        esac
    done < "$F"
    [ "$FOUND" = "1" ] || printf '%s=%s\n' "$K" "$V" >> "$TMP"
    [ -s "$TMP" ] || { rm -f "$TMP"; out_err "写入结果为空"; return; }
    mv "$TMP" "$F" 2>/dev/null || { rm -f "$TMP"; out_err "替换失败"; return; }
    chmod 644 "$F" 2>/dev/null
    GOT=""
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
        "$K"=*)
            GOT="${line#"$K"=}"
            break
            ;;
        esac
    done < "$F"
    # 不依赖 sed：配置值只允许安全字符（数字、包名、空格、点、下划线、0x 前缀）。
    # 部分 ROM 的 toybox 没有 sed，之前 ESC 会变空，回读就成了空串，
    # 前端判定“回读不一致”，表现为每次保存都失败。
    notify_reload
    printf '{"ok":true,"name":"%s","value":"%s"}\n' "$(json_escape "$K")" "$(json_escape "$GOT")"
}

# 已安装应用（第三方优先，供“目标应用”二级页勾选）
action_set_app_level() {
    PKG="$1"; LV="$2"
    case "$LV" in
    0|1|2|3|4) ;;
    *) out_err "档位必须是 0-4"; return ;;
    esac
    case "$PKG" in
    *[!A-Za-z0-9._]*|'') out_err "非法包名"; return ;;
    esac
    CUR=$(grep -m1 '^APP_PROFILES=' "$DATA/findingx.conf" 2>/dev/null | cut -d= -f2-)
    NEW=""
    OLDIFS="$IFS"; IFS=','
    for item in $CUR; do
        IFS="$OLDIFS"
        p="${item%%:*}"
        if [ -n "$item" ] && [ "$p" != "$PKG" ]; then
            NEW="${NEW:+$NEW,}$item"
        fi
        IFS=','
    done
    IFS="$OLDIFS"
    if [ "$LV" != "0" ]; then
        NEW="${NEW:+$NEW,}$PKG:$LV"
    fi
    action_set_conf "$DATA/findingx.conf" "APP_PROFILES" "$NEW"
}

action_list_apps() {
    if ! command -v pm >/dev/null 2>&1; then
        out_err "pm 不可用（非 Android 环境？）"
        return
    fi
    OUT='['; FIRST=1
    for p in $(pm list packages -3 2>/dev/null | sed 's/^package://' | sort); do
        case "$p" in
        *[!a-zA-Z0-9._]*|'') continue ;;
        esac
        if [ "$FIRST" = "1" ]; then FIRST=0; else OUT="$OUT,"; fi
        OUT="$OUT\"$p\""
    done
    OUT="$OUT]"
    printf '{"ok":true,"apps":%s}\n' "$OUT"
}

action_log_b64() {
    case "$1" in
    all) _merge_logs; return ;;
    fxd) F="$DATA/log/fxd.log" ;;
    sf) F="$DATA/log/sf.log" ;;
    *) F="$DATA/log/fx.log" ;;
    esac
    if [ -f "$F" ]; then
        printf '{"ok":true,"b64":"%s"}\n' "$(tail -n 200 "$F" | b64)"
    else
        printf '{"ok":true,"b64":""}\n'
    fi
}

# ---- fxd 日志增量快通道（ring 游标流，自 4.23.00 移植）----
# fxd 守护的 logf 同步 append 带 "s<seq> " 前缀的 ring.txt（64KB 砍半守卫）。
# ring [cursor] → {"ok":true,"cursor":N,"b64":"..."}：返回 seq 大于 cursor 的新行
# + 新游标；无 cursor → 兼容模式返回内存环最近 200 条。守护未运行时回退文件。
# 行 seq 随守护重启归零，大游标自动降级全量，语义安全。
action_ring() {
    P=$(cat "$DATA/fxd.pid" 2>/dev/null)
    if pid_is "$P" fxd && [ -x "$FX" ]; then
        # 当前 fx.sh 没有 ring 子命令；直接读取守护写入的日志文件。
        # 若未来 CLI 增加 ring，再由显式能力检测启用游标协议。
        :
    fi
    # 回退：文件尾部（游标语义丢失,前端按全量处理）
    if [ -f "$DATA/log/fxd.log" ]; then
    printf '{"ok":true,"cursor":0,"b64":"%s"}\n' "$(tail -n 200 "$DATA/log/fxd.log" | b64)"
    else
        printf '{"ok":true,"cursor":0,"b64":""}\n'
    fi
}

# 三合一：fxd / sf / fx 各取末 120 行，加来源前缀后拼接
_merge_logs() {
    TMP="$DATA/log/.merge.$$"
    : > "$TMP" 2>/dev/null || { printf '{"ok":true,"b64":""}\n'; return; }
    for pair in "fxd:$DATA/log/fxd.log" "sf:$DATA/log/sf.log" "fx:$DATA/log/fx.log"; do
        tag=${pair%%:*}
        file=${pair#*:}
        [ -f "$file" ] || continue
        tail -n 120 "$file" | sed "s/^/[$tag] /" >> "$TMP"
    done
    printf '{"ok":true,"b64":"%s"}\n' "$(cat "$TMP" | b64)"
    rm -f "$TMP"
}

# ---- 内核参数（ifas.ko 的 37 个 module parameter）----
# 只读接口：一次性返回全部参数，缺节点即不出现（不同 ko 版本参数集不同）
PARAM_DIR=/sys/module/ifas/parameters

# 只拼参数对象本身，供 action_all 复用
params_json() {
    if [ ! -d "$PARAM_DIR" ]; then
        printf '{}'
        return
    fi
    OUT='{'
    FIRST=1
    for p in "$PARAM_DIR"/*; do
        [ -f "$p" ] || continue
        NAME=$(basename "$p")
        case "$NAME" in
        *[!a-z0-9_]*) continue ;;   # 非法名字直接跳过
        esac
        VAL=""
        # sysfs 参数文件通常没有结尾换行，read 会返回 1 但变量已赋值。
        # 之前写成 `read ... || continue` 会把所有参数都丢掉（params 变成空对象）。
        read -r VAL < "$p" 2>/dev/null || true
        VAL=$(printf '%s' "$VAL" | tr -d ' \n\r\t')
        [ -n "$VAL" ] || continue
        case "$VAL" in
        ''|*[!0-9-]*) continue ;;   # 只接受整数（含负号）
        esac
        if [ "$FIRST" = "1" ]; then
            FIRST=0
        else
            OUT="$OUT,"
        fi
        OUT="$OUT\"$NAME\":$VAL"
    done
    OUT="$OUT}"
    printf '%s' "$OUT"
}

# 一次返回配置页需要的全部数据。
# WebView 里的 exec 是同步调用，每多一次就要多卡几百毫秒；
# 原来进入配置页要跑 read_main + read_sf + params 三次，合并后只跑一次。
action_all() {
    repair_conf "$DATA/findingx.conf"
    repair_conf "$DATA/sf.conf"
    M=""
    [ -f "$DATA/findingx.conf" ] && M=$(cat "$DATA/findingx.conf" | b64)
    S=""
    [ -f "$DATA/sf.conf" ] && S=$(cat "$DATA/sf.conf" | b64)
    printf '{"ok":true,"main":"%s","sf":"%s","params":%s}\n' "$M" "$S" "$(params_json)"
}

# 把内核参数的改动记到 kernel_params.conf：重启后由 fxd 重新应用。
# 单值文件，格式 k=v；同一键只保留最后一条。
PARAM_SAVED="$DATA/kernel_params.conf"

save_param() {
    K="$1"; V="$2"
    F="$PARAM_SAVED"
    TMP="$F.tmp.$$"
    : > "$TMP" 2>/dev/null || return
    if [ -f "$F" ]; then
        while IFS= read -r line || [ -n "$line" ]; do
            case "$line" in
            "$K"=*) ;;
            '') ;;
            *) printf '%s\n' "$line" >> "$TMP" ;;
            esac
        done < "$F"
    fi
    printf '%s=%s\n' "$K" "$V" >> "$TMP"
    mv "$TMP" "$F" 2>/dev/null
    chmod 644 "$F" 2>/dev/null
}

action_param_set_many() {
    # 一次 exec 写多个 sysfs 参数：k1=v1,k2=v2,...
    # 逐项校验（名字白名单、值纯数字），失败项单独列出，成功的照常写。
    PAIRS="$1"
    [ -n "$PAIRS" ] || { out_err "缺少参数"; return; }
    OKN=0
    FAILED=""
    OLDIFS="$IFS"
    IFS=','
    for pair in $PAIRS; do
        IFS="$OLDIFS"
        NAME="${pair%%=*}"
        VAL="${pair#*=}"
        IFS=','
        case "$NAME" in
        *[!a-z0-9_]*|'') FAILED="$FAILED $NAME"; continue ;;
        esac
        case "$VAL" in
        -*) case "${VAL#-}" in ''|*[!0-9]*) FAILED="$FAILED $NAME"; continue ;; esac ;;
        *[!0-9]*) FAILED="$FAILED $NAME"; continue ;;
        esac
        P="$PARAM_DIR/$NAME"
        if [ -f "$P" ] && [ -w "$P" ] && printf '%s' "$VAL" > "$P" 2>/dev/null; then
            save_param "$NAME" "$VAL"
            OKN=$((OKN + 1))
        else
            FAILED="$FAILED $NAME"
        fi
    done
    IFS="$OLDIFS"
    FJ=""
    for f in $FAILED; do
        FJ="${FJ:+$FJ,}$f"
    done
    out_ok "\"saved\":$OKN,\"failed\":\"$FJ\""
}

# 保存成功后通知 fxd 立即热重载（SIGUSR1），不等 5s 轮询
notify_reload() {
    [ -f "$DATA/fxd.pid" ] || return 0
    P=$(cat "$DATA/fxd.pid" 2>/dev/null)
    if pid_is "$P" fxd; then kill -USR1 "$P" 2>/dev/null; fi
    return 0
}

# ---- 风扇（/sys/kernel/fan/*，节点来自 cubeserver.jar 逆向）----
FAN_DIR=/sys/kernel/fan

action_fan() {
    EN=""
    LV=""
    SPD=""
    [ -r "$FAN_DIR/fan_enable" ] && EN=$(cat "$FAN_DIR/fan_enable" 2>/dev/null | tr -d ' \n\r')
    [ -r "$FAN_DIR/fan_speed_level" ] && LV=$(cat "$FAN_DIR/fan_speed_level" 2>/dev/null | tr -d ' \n\r')
    [ -r "$FAN_DIR/fan_speed" ] && SPD=$(cat "$FAN_DIR/fan_speed" 2>/dev/null | tr -d ' \n\r')
    if [ -z "$EN" ] && [ -z "$LV" ]; then
        printf '{"ok":true,"supported":false}\n'
        return
    fi
    printf '{"ok":true,"supported":true,"enable":"%s","level":"%s","speed":"%s"}\n' "${EN:-?}" "${LV:-?}" "${SPD:-?}"
}

action_fan_set() {
    EN="$1"
    LV="$2"
    case "$EN" in 0|1) ;; *) out_err "enable 必须是 0/1"; return ;; esac
    case "$LV" in ''|*[!0-9]*) out_err "档位必须是数字"; return ;; esac
    if [ "$LV" -lt 0 ] || [ "$LV" -gt 10 ]; then
        out_err "档位超范围（0-10）"
        return
    fi
    [ -w "$FAN_DIR/fan_enable" ] || { out_err "风扇节点不可写（本机不支持）"; return; }
    printf '%s' "$EN" > "$FAN_DIR/fan_enable" 2>/dev/null || { out_err "写 fan_enable 失败"; return; }
    # 档位写入失败只降级为警告：某些机型 fan_speed_level 只接受特定范围，
    # 但开关本身已经生效，不该把整次操作判为失败。
    WARN=""
    if [ -w "$FAN_DIR/fan_speed_level" ]; then
        if ! printf '%s' "$LV" > "$FAN_DIR/fan_speed_level" 2>/dev/null; then
            WARN="fan_speed_level"
        fi
    fi
    printf '{"ok":true,"enable":"%s","level":"%s","warn":"%s"}\n' "$EN" "$LV" "$WARN"
}

case "$1" in
status) action_status ;;
all) action_all ;;
read_main) repair_conf "$DATA/findingx.conf"; action_read_b64 "$DATA/findingx.conf" ;;
save_main) action_save_b64 "$DATA/findingx.conf" "$(strip_q "$2")" ;;
save_sf) action_save_b64 "$DATA/sf.conf" "$(strip_q "$2")" ;;
set_conf)
    # 参数先剥引号；值用 base64 传，避免空格被 Runtime.exec 切碎
    _F=$(strip_q "$2"); _K=$(strip_q "$3"); _V=$(strip_q "$4")
    case "$_F" in
    findingx.conf|sf.conf)
        # 单值走明文：base64 在部分管理器里会被转义破坏（回读成空串）
        action_set_conf "$DATA/$_F" "$_K" "$_V"
        ;;
    *) out_err "非法配置文件：$_F" ;;
    esac
    ;;
list_apps) action_list_apps ;;
param_set_many) action_param_set_many "$(strip_q "$2")" ;;
fan) action_fan ;;
fan_set) action_fan_set "$(strip_q "$2")" "$(strip_q "$3")" ;;
set_app_level) action_set_app_level "$(strip_q "$2")" "$(strip_q "$3")" ;;
log) action_log_b64 "$(strip_q "$2")" ;;
ring) action_ring "$(strip_q "$2")" ;;
*) out_err "未知 action：$1" ;;
esac
exit 0
