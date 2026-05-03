import { spawn } from 'node:child_process';

const testScript = process.argv[2];

if (!testScript) {
  console.error('Usage: node reports/scripts/run-cucumber-allure.mjs <npm-script-name>');
  process.exit(1);
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

const cleanExitCode = await run('npm', ['run', 'allure:clean']);
if (cleanExitCode !== 0) {
  process.exit(cleanExitCode);
}

const testExitCode = await run('npm', ['run', testScript]);
const generateExitCode = await run('npm', ['run', 'allure:generate']);

if (generateExitCode === 0) {
  await run('npm', ['run', 'allure:open']);
}

process.exit(testExitCode !== 0 ? testExitCode : generateExitCode);
