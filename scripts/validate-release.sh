#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBUI_DIR="${WEBUI_DIR:-$ROOT_DIR/modules/webui}"
CORE_DIR="${CORE_DIR:-$ROOT_DIR/modules/core}"

fail() { echo "ERROR: $*" >&2; exit 1; }
need_file() { [ -f "$1" ] || fail "missing file: $1"; }

need_file "$WEBUI_DIR/module.prop"
need_file "$WEBUI_DIR/customize.sh"
need_file "$WEBUI_DIR/webui.sh"
need_file "$WEBUI_DIR/webroot/index.html"
need_file "$WEBUI_DIR/webroot/ui.js"
need_file "$CORE_DIR/module.prop"
need_file "$CORE_DIR/customize.sh"
need_file "$CORE_DIR/service.sh"
need_file "$CORE_DIR/bin/fxd"
need_file "$CORE_DIR/bin/fx-agent"
need_file "$CORE_DIR/config/findingx.conf"

prop() { awk -F= -v key="$1" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$2"; }
WEB_VERSION="$(prop version "$WEBUI_DIR/module.prop")"
CORE_VERSION="$(prop version "$CORE_DIR/module.prop")"
WEB_CODE="$(prop versionCode "$WEBUI_DIR/module.prop")"
CORE_CODE="$(prop versionCode "$CORE_DIR/module.prop")"
[ -n "$WEB_VERSION" ] && [ "$WEB_VERSION" = "$CORE_VERSION" ] || fail "core/WebUI versions differ: $CORE_VERSION / $WEB_VERSION"
[ "$WEB_CODE" = "$CORE_CODE" ] || fail "core/WebUI versionCodes differ: $CORE_CODE / $WEB_CODE"
[[ "$WEB_CODE" =~ ^[0-9]+$ ]] || fail "versionCode is not numeric"

command -v node >/dev/null 2>&1 || fail "node is required"
node --check "$WEBUI_DIR/webroot/ui.js"

for script in \
  "$WEBUI_DIR/customize.sh" "$WEBUI_DIR/webui.sh" \
  "$CORE_DIR/customize.sh" "$CORE_DIR/service.sh" "$CORE_DIR/post-fs-data.sh" \
  "$CORE_DIR/uninstall.sh" "$CORE_DIR/bin/fx.sh" "$CORE_DIR/bin/watchdog.sh" \
  "$CORE_DIR/bin/sf-cpuset.sh"; do
  bash -n "$script"
done

grep -q '^CONF_VERSION=5$' "$CORE_DIR/config/findingx.conf" || fail "default config version is not 5"
grep -q 'APP_TARGET_FPS=' "$CORE_DIR/config/findingx.conf" || fail "APP_TARGET_FPS is missing"
grep -q 'CORE_CODE' "$WEBUI_DIR/customize.sh" || fail "WebUI core version gate is missing"
grep -q 'json_escape' "$WEBUI_DIR/webui.sh" || fail "JSON escaping is missing"
grep -q 'replace(/'"'"'/g' "$WEBUI_DIR/webroot/ui.js" || fail "shell argument escaping is missing"

for archive in "$WEBUI_DIR"/*.zip "$CORE_DIR"/*.zip; do
  [ -e "$archive" ] || continue
  fail "source directory contains an archive: $archive"
done

echo "Validation passed"
echo "version=$CORE_VERSION versionCode=$CORE_CODE"
