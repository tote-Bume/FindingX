#!/system/bin/sh
ui_print "- FindingX-WebUI补全计划 0.0.5"
CORE=/data/adb/modules/findingx
[ -d "$CORE" ] || abort "请先安装 FindingX 核心模块"
[ -x "$CORE/bin/fx-agent" ] || abort "核心模块 fx-agent 不可用"
CORE_CODE=$(grep -m1 '^versionCode=' "$CORE/module.prop" 2>/dev/null | cut -d= -f2-)
case "$CORE_CODE" in *[!0-9]*|'') abort "无法读取 FindingX 核心版本" ;; esac
[ "$CORE_CODE" -ge 5 ] || abort "此 WebUI 需要 FindingX 核心 0.0.5 或更高版本"
[ -f "$MODPATH/webroot/index.html" ] || abort "WebUI 文件缺失"
set_perm_recursive "$MODPATH" 0 0 0755 0644
set_perm "$MODPATH/customize.sh" 0 0 0755
set_perm "$MODPATH/webui.sh" 0 0 0755
ui_print "- WebUI 将通过核心模块状态接口读取数据"
