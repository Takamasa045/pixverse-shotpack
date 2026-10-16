import { cpSync, readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(fileURLToPath(new URL('..', import.meta.url))),
  source = join(root, 'production-core');
const targetIndex = process.argv.indexOf('--target');
const target = resolve(
  targetIndex >= 0
    ? process.argv[targetIndex + 1]
    : join(root, '../pixverse-character-pipeline/production-core'),
);
function files(dir) {
  return readdirSync(dir).flatMap((n) =>
    statSync(join(dir, n)).isDirectory() ? files(join(dir, n)) : [join(dir, n)],
  );
}
const list = files(source).filter((f) => !f.endsWith('VENDOR.json'));
const hashes = Object.fromEntries(
  list.map((f) => [
    relative(source, f),
    createHash('sha256').update(readFileSync(f)).digest('hex'),
  ]),
);
if (process.argv.includes('--check')) {
  for (const f of list) {
    const to = join(target, relative(source, f));
    if (!existsSync(to) || !readFileSync(f).equals(readFileSync(to)))
      throw new Error(`core drift: ${relative(source, f)}`);
  }
  for (const f of files(target))
    if (!f.endsWith('VENDOR.json') && !existsSync(join(source, relative(target, f))))
      throw new Error(`extra vendored core file: ${relative(target, f)}`);
  console.log(`shared core matches (${list.length} files)`);
} else {
  cpSync(source, target, { recursive: true });
  writeFileSync(
    join(target, 'VENDOR.json'),
    JSON.stringify(
      {
        canonical_repository: 'Takamasa045/pixverse-shotpack',
        directory: 'production-core',
        schema: 'production.v1',
        files: hashes,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`synced ${list.length} files`);
}
