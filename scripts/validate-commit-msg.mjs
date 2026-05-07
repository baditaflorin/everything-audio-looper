import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('commit-msg hook requires the commit message file path.');
  process.exit(1);
}

const message = readFileSync(file, 'utf8').trim();
const firstLine = message.split(/\r?\n/, 1)[0] ?? '';
const conventional =
  /^(feat|fix|docs|chore|refactor|test|ops|data|build|ci|perf|style)(\([a-z0-9-]+\))?!?: .{1,120}$/.test(
    firstLine
  );

if (!conventional) {
  console.error(`Commit message must use Conventional Commits. Got: ${firstLine}`);
  process.exit(1);
}
