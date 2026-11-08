// Pure JavaScript Shell doubles: no compositor, D-Bus, or desktop settings access.
import GLib from 'gi://GLib';
import {lensGeometry} from '../geometry.js';

const [, bytes] = GLib.file_get_contents(GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', 'extension.js']));
const source = new TextDecoder().decode(bytes)
    .replace(/^import .*;\n/gm, '')
    .replace('export default class SquareLens', 'class SquareLens');
let checks = 0;
function check(value, message) {
    if (!value) throw new Error(message);
    checks++;
}
let failure = '';
class Actor {
    constructor(properties = {}) { Object.assign(this, properties); this.children = []; }
    add_child(child) { this.children.push(child); }
    connect() { return 1; }
    destroy() { this.destroyed = true; }
    hide() { this.visible = false; }
    show() { this.visible = true; }
    set_position() { if (failure === 'update') throw new Error('injected update failure'); }
    set_size() {}
    set_scale() {}
    add_style_pseudo_class() {}
    remove_style_pseudo_class() {}
}
const callbacks = new Map();
const settings = {
    connect(_name, callback) { this.changed = callback; return 1; },
    disconnect() { this.disconnected = true; },
    get_double() { return 2; }, get_int() { return 400; },
};
const timers = new Map();
let timerId = 0, disabled = 0, restored = 0, notices = 0;
const stage = new Actor();
const uiGroup = new Actor();
let monitor = {x: 0, y: 0, width: 1920, height: 1080};
const Main = {
    uiGroup, panel: {addToStatusArea() {}},
    wm: {addKeybinding() {}, removeKeybinding() {}},
    sessionMode: {isLocked: false,
        connect(name, callback) { callbacks.set(name, callback); return 1; },
        disconnect() { callbacks.clear(); }},
    layoutManager: {findMonitorForPoint() { return monitor; }},
    notify() { notices++; },
};
const shellGlobal = {stage, get_pointer() { return [500, 500]; }, compositor: {
    disable_unredirect() { disabled++; }, enable_unredirect() { restored++; },
}};
const FakeGLib = {PRIORITY_DEFAULT: 0, SOURCE_CONTINUE: true,
    timeout_add(_priority, _interval, callback) { timers.set(++timerId, callback); return timerId; },
    source_remove(id) { timers.delete(id); },
};
const SquareLens = new Function('Clutter', 'GLib', 'Meta', 'Shell', 'St',
    'Extension', 'Main', 'PanelMenu', 'lensGeometry', 'global', 'console',
    `${source}\nreturn SquareLens;`)(
    {Actor, Clone: Actor}, FakeGLib, {KeyBindingFlags: {NONE: 0}},
    {ActionMode: {NORMAL: 1, OVERVIEW: 2}, util_set_hidden_from_pick() {
        if (failure === 'pick') throw new Error('injected pick failure');
    }}, {Icon: Actor, Widget: Actor}, class {getSettings() { return settings; }},
    Main, {Button: Actor}, lensGeometry, shellGlobal, {error() {}});
const lens = new SquareLens();
lens.enable();
Main.sessionMode.isLocked = true;
lens._toggle();
check(!lens._lens && disabled === 0, 'Locked session opened lens');
Main.sessionMode.isLocked = false;
for (let i = 0; i < 100; i++) {
    lens._toggle();
    check(lens._clone.source === uiGroup && stage.children.includes(lens._lens), 'Invalid clone topology');
    check(timers.size === 1, 'Missing or duplicate timer');
    settings.changed(settings, 'lens-size');
    settings.changed(settings, 'zoom-factor');
    monitor = null;
    [...timers.values()][0]();
    check(lens._lens.visible === false, 'Lens visible without monitor');
    monitor = {x: 0, y: 0, width: 1920, height: 1080};
    [...timers.values()][0]();
    check(lens._lens.visible === true, 'Lens did not return to monitor');
    lens._toggle();
    lens._hide();
    check(!lens._lens && timers.size === 0 && disabled === restored, 'Hide leaked resources');
}
for (const point of ['pick', 'update']) {
    failure = point;
    lens._toggle();
    check(!lens._lens && timers.size === 0 && disabled === restored, 'Opening error leaked resources');
}
failure = '';
check(notices === 2, 'Opening failures did not notify');
lens._toggle();
callbacks.get('updated')();
check(!lens._lens && timers.size === 0 && disabled === restored, 'Session update leaked resources');
lens._toggle();
lens.disable();
check(!lens._settings && !lens._button && settings.disconnected && callbacks.size === 0,
    'Disable did not disconnect resources');
check(timers.size === 0 && disabled === restored, 'Disable leaked timer or unredirect');
print(`${checks} lifecycle assertions passed (mock Shell only)`);
