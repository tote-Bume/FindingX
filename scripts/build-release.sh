#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBUI_DIR="${WEBUI_DIR:-$ROOT_DIR/modules/webui}"
CORE_DIR="${CORE_DIR:-$ROOT_DIR/modules/core}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/dist}"

"$ROOT_DIR/scripts/validate-release.sh"
python3 "$ROOT_DIR/scripts/build_release.py" \
  --webui "$WEBUI_DIR" \
  --core "$CORE_DIR" \
  --out "$OUT_DIR"
