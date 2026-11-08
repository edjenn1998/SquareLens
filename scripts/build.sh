#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
glib-compile-schemas --strict schemas
gjs -m tests/geometry.js
gjs -m tests/lifecycle.js
mkdir -p dist
gnome-extensions pack --force --out-dir=dist --extra-source=geometry.js
python3 scripts/check-package.py
(cd dist && sha256sum square-lens@local.shell-extension.zip > SHA256SUMS)
