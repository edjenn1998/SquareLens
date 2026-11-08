import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SquareLensPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        window._settings = settings;
        const page = new Adw.PreferencesPage({title: 'Square Lens', icon_name: 'edit-find-symbolic'});
        const group = new Adw.PreferencesGroup({
            title: 'Your magnifying lens',
            description: 'Left-click the top-bar icon to toggle. Right-click it for these settings.',
        });
        page.add(group);
        const size = new Adw.SpinRow({title: 'Lens size',
            subtitle: 'Side length in logical pixels (200 or 400 are good starting points)',
            adjustment: new Gtk.Adjustment({lower: 100, upper: 1000, step_increment: 10, page_increment: 100}),
            value: settings.get_int('lens-size'),
        });
        size.connect('notify::value', () => settings.set_int('lens-size', Math.round(size.value)));
        group.add(size);
        const zoom = new Adw.SpinRow({title: 'Magnification', subtitle: '2 means twice the original size',
            digits: 2,
            adjustment: new Gtk.Adjustment({lower: 1.25, upper: 8, step_increment: 0.25, page_increment: 1}),
            value: settings.get_double('zoom-factor'),
        });
        zoom.connect('notify::value', () => settings.set_double('zoom-factor', zoom.value));
        group.add(zoom);
        const shortcut = new Adw.EntryRow({title: 'Toggle shortcut',
            text: settings.get_strv('toggle-shortcut')[0] ?? '', show_apply_button: true});
        shortcut.connect('apply', () => {
            const text = shortcut.text.trim();
            const [valid, key, mods] = Gtk.accelerator_parse(text);
            if (text && (!valid || !Gtk.accelerator_valid(key, mods) || mods === 0)) {
                shortcut.add_css_class('error');
                window.add_toast(new Adw.Toast({title: 'Use a valid shortcut with a modifier, such as <Super><Alt>m'}));
                return;
            }
            shortcut.remove_css_class('error');
            settings.set_strv('toggle-shortcut', text ? [Gtk.accelerator_name(key, mods)] : []);
        });
        group.add(shortcut);
        group.add(new Adw.ActionRow({title: 'Shortcut format',
            subtitle: 'Default: <Super><Alt>m · Clear the field to disable the shortcut.'}));
        group.add(new Adw.ActionRow({title: 'Recovery version',
            subtitle: 'Appearance filters have been removed after reports of GNOME Shell crashes.'}));
        window.add(page);
    }
}
