import {lensGeometry} from '../geometry.js';

let checks = 0;
for (const monitor of [
    {x: 0, y: 0, width: 1920, height: 1080},
    {x: 1920, y: 200, width: 1280, height: 720},
    {x: -1280, y: 0, width: 1280, height: 720},
]) {
    for (const requested of [200, 400, 1000]) {
        for (const zoom of [1.25, 2, 8]) {
            for (const dx of [0, 1, monitor.width / 2, monitor.width - 1]) {
                for (const dy of [0, 1, monitor.height / 2, monitor.height - 1]) {
                    const x = monitor.x + dx;
                    const y = monitor.y + dy;
                    const g = lensGeometry(x, y, monitor, requested, zoom);
                    if (g.left < monitor.x || g.top < monitor.y ||
                        g.left + g.size > monitor.x + monitor.width ||
                        g.top + g.size > monitor.y + monitor.height)
                        throw new Error('Lens escaped its monitor');
                    if (Math.abs(g.left + g.cloneX + x * zoom - x) > 0.001 ||
                        Math.abs(g.top + g.cloneY + y * zoom - y) > 0.001)
                        throw new Error('Magnified target moved away from the pointer');
                    checks++;
                }
            }
        }
    }
}
print(`${checks} geometry cases passed`);
