# Square Lens v4

First public release for GNOME Shell 51. A square magnifier follows your pointer,
with click-through input, adjustable size (100–1000 pixels) and zoom (1.25×–8×).
Toggle with the top-bar icon or Super+Alt+M; right-click for preferences.
Uses the working direct desktop-clone path, with no appearance filters.

## Install

Download `square-lens@local.shell-extension.zip` from the assets below. Open a
terminal in its folder and run:

```sh
gnome-extensions install ./square-lens@local.shell-extension.zip
```

Save your work, log out and back in, then run:

```sh
gnome-extensions enable square-lens@local
```

For updates, disable first and use `install --force`, then log out and back in
before enabling. See the README for full usage and removal instructions.

Download `SHA256SUMS` alongside the ZIP and run `sha256sum -c SHA256SUMS`
to verify download integrity.

Validation: 432 geometry cases, 507 mock lifecycle assertions, strict schema
compilation, archive integrity and source parity. Basic desktop operation was
confirmed by the original user on GNOME Shell 51.1. Extended runtime stability,
lock/unlock, and display scaling remain incompletely validated.
