import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {lensGeometry} from './geometry.js';

export default class SquareLens extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._button = new PanelMenu.Button(0.0, 'Toggle Square Lens', true);
        this._button.add_child(new St.Icon({
            icon_name: 'edit-find-symbolic', style_class: 'system-status-icon',
        }));
        this._button.connect('button-press-event', (_actor, event) => {
            if (event.get_button() === 3)
                this.openPreferences();
            else if (event.get_button() === 1)
                this._toggle();
            return Clutter.EVENT_STOP;
        });
        this._button.connect('key-press-event', (_actor, event) => {
            if ([Clutter.KEY_Return, Clutter.KEY_space].includes(event.get_key_symbol())) {
                this._toggle();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
        Main.panel.addToStatusArea(this.uuid, this._button);
        Main.wm.addKeybinding('toggle-shortcut', this._settings,
            Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._toggle());
        this._settingsId = this._settings.connect('changed', (_settings, key) => {
            if (key === 'lens-size' || key === 'zoom-factor')
                this._update();
        });
        this._sessionId = Main.sessionMode.connect('updated', () => this._hide());
    }

    _toggle() {
        if (this._lens) {
            this._hide();
            return;
        }
        if (Main.sessionMode.isLocked)
            return;
        try {
            this._show();
        } catch (error) {
            this._hide();
            console.error('Square Lens failed to open', error);
            Main.notify('Square Lens', 'The lens could not open. Check the GNOME Shell log for details.');
        }
    }

    _show() {
        this._lens = new Clutter.Actor({clip_to_allocation: true, reactive: false});
        this._clone = new Clutter.Clone({source: Main.uiGroup});
        this._lens.add_child(this._clone);
        this._border = new St.Widget({
            reactive: false,
            style: 'border: 2px solid #99c1f1; background-color: transparent;',
        });
        this._lens.add_child(this._border);
        // A stage sibling of uiGroup avoids recursively magnifying the lens.
        global.stage.add_child(this._lens);
        Shell.util_set_hidden_from_pick(this._lens, true);
        global.compositor.disable_unredirect();
        this._unredirectDisabled = true;
        this._button.add_style_pseudo_class('active');
        this._update();
        this._timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
            this._update();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _update() {
        if (!this._lens)
            return;
        const [x, y] = global.get_pointer();
        const monitor = Main.layoutManager.findMonitorForPoint(x, y);
        if (!monitor) {
            this._lens.hide();
            return;
        }
        this._lens.show();
        const zoom = this._settings.get_double('zoom-factor');
        const g = lensGeometry(x, y, monitor, this._settings.get_int('lens-size'), zoom);
        this._lens.set_position(g.left, g.top);
        this._lens.set_size(g.size, g.size);
        this._clone.set_scale(zoom, zoom);
        this._clone.set_position(g.cloneX, g.cloneY);
        this._border.set_size(g.size, g.size);
    }

    _hide() {
        if (this._timer) {
            GLib.source_remove(this._timer);
            this._timer = 0;
        }
        if (this._lens) {
            this._lens.destroy();
            this._lens = null;
            this._clone = null;
            this._border = null;
        }
        if (this._unredirectDisabled) {
            global.compositor.enable_unredirect();
            this._unredirectDisabled = false;
        }
        this._button?.remove_style_pseudo_class('active');
    }

    disable() {
        this._hide();
        Main.wm.removeKeybinding('toggle-shortcut');
        if (this._sessionId)
            Main.sessionMode.disconnect(this._sessionId);
        if (this._settingsId)
            this._settings.disconnect(this._settingsId);
        this._sessionId = this._settingsId = 0;
        this._button?.destroy();
        this._button = null;
        this._settings = null;
    }
}
