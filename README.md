# Square Lens

A square magnifier that follows your pointer on **GNOME Shell 51**.

- Lens size: 100–1000 logical pixels (default: 300).
- Magnification: 1.25×–8× (default: 2×).
- Click-through lens; the pointer stays at its normal size.
- Toggle with the top-bar icon or **Super+Alt+M**. Super is usually the Windows key.
- Right-click the icon for size, zoom, and shortcut preferences.

## Install

1. Check your Shell version with `gnome-shell --version`. This build supports **51** only.
2. Open [Releases](https://github.com/edjenn1998/SquareLens/releases/latest).
3. Under **Assets**, download **square-lens@local.shell-extension.zip**, rather than either “Source code” archive.
4. Open a terminal in your download folder and run:

   ```sh
   gnome-extensions install ./square-lens@local.shell-extension.zip
   ```

5. Save your work, **log out, and log back in** so GNOME discovers the extension.
6. Enable it:

   ```sh
   gnome-extensions enable square-lens@local
   ```

You can also enable it in GNOME's **Extensions** application. Ensure the main
extensions switch is on. If `gnome-extensions` is missing, install your distribution's
GNOME Shell extension tools first. Other desktop environments are unsupported.

## Preferences

Right-click the top-bar icon or run:

```sh
gnome-extensions prefs square-lens@local
```

Shortcuts use GTK notation, such as `<Super><Alt>m`. Apply after editing;
clear the entry and apply to disable the shortcut.

## Update

Download the latest extension ZIP, then run from its folder:

```sh
gnome-extensions disable square-lens@local
gnome-extensions install --force ./square-lens@local.shell-extension.zip
```

Save your work, log out and back in, then enable it again. Your preferences are retained.

## Remove

```sh
gnome-extensions disable square-lens@local
gnome-extensions uninstall square-lens@local
```

Log out and back in to unload it completely.

## Troubleshooting and status

If the icon is missing, confirm GNOME Shell 51, log out and back in after installation,
and check `gnome-extensions info square-lens@local`. If the shortcut does nothing,
try the icon and check for shortcut conflicts.

Version 4 is the first public release. The original user confirmed basic desktop
operation on GNOME Shell 51.1. Geometry and mock lifecycle checks pass; extended
runtime stability, lock/unlock, and display scaling remain incompletely validated.
Report issues with your Shell version and reproduction steps through
[GitHub Issues](https://github.com/edjenn1998/SquareLens/issues). Review logs for
private information before sharing.

Earlier private builds experimented with filters and caused reported session crashes.
Version 4 removes that rendering path. Sharpening, tint, and grayscale are unavailable;
old stored filter preferences are ignored.

## Build from source

Requires `gjs`, `glib-compile-schemas`, `gnome-extensions`, and Python 3:

```sh
./scripts/build.sh
```

The ZIP and `SHA256SUMS` are written to `dist/`. Tests and packaging do not install
the extension or change desktop settings. Lifecycle tests use Shell doubles and
cannot validate actual compositor behavior.

Licensed under GPL-2.0-or-later; see [LICENSE](LICENSE).
