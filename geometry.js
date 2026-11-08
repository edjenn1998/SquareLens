// Coordinates are GNOME logical pixels, including on scaled displays.
export function lensGeometry(x, y, monitor, requestedSize, zoom) {
    const size = Math.min(requestedSize, monitor.width, monitor.height);
    const left = Math.round(Math.max(monitor.x,
        Math.min(x - size / 2, monitor.x + monitor.width - size)));
    const top = Math.round(Math.max(monitor.y,
        Math.min(y - size / 2, monitor.y + monitor.height - size)));
    // Keep the real cursor over the same magnified point near screen edges.
    return {size, left, top,
        cloneX: (x - left) - x * zoom,
        cloneY: (y - top) - y * zoom};
}
