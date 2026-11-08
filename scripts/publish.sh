#!/usr/bin/env bash
# Run in a normal terminal with GitHub network access. Creates a public repo.
set -euo pipefail
cd "$(dirname "$0")/.."
repo=edjenn1998/SquareLens
gh auth status
./scripts/build.sh
if [[ -n "$(git status --porcelain)" ]]; then
    echo 'Commit or remove pending changes before publishing.' >&2
    exit 1
fi
if ! gh repo view "$repo" >/dev/null 2>&1; then
    gh repo create "$repo" --public --description 'A square pointer-following magnifier for GNOME Shell 51' --source=. --remote=origin
fi
if [[ "$(gh repo view "$repo" --json isPrivate --jq .isPrivate)" != false ]]; then
    echo 'Existing repository is private; refusing to change its visibility.' >&2
    exit 1
fi
git push "https://github.com/$repo.git" HEAD:main
gh release create v4 dist/square-lens@local.shell-extension.zip dist/SHA256SUMS --repo "$repo" --target "$(git rev-parse HEAD)" --title 'Square Lens v4' --notes-file docs/RELEASE-v4.md
