import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
with zipfile.ZipFile(root / 'dist/square-lens@local.shell-extension.zip') as archive:
    assert archive.testzip() is None, 'Corrupt ZIP'
    expected = {'extension.js', 'prefs.js', 'geometry.js', 'metadata.json',
                'schemas/org.gnome.shell.extensions.square-lens.gschema.xml'}
    files = {name for name in archive.namelist() if not name.endswith('/')}
    assert files == expected, f'Unexpected package contents: {files ^ expected}'
    for name in expected:
        assert archive.read(name) == (root / name).read_bytes(), name
    metadata = json.loads(archive.read('metadata.json'))
    assert metadata['version'] == 4
    assert metadata['shell-version'] == ['51']
    assert metadata['uuid'] == 'square-lens@local'
print('Version 4 archive integrity, contents, and source parity passed')
