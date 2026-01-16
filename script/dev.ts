import dotenv from 'dotenv';
import { exec, execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
dotenv.config();

const PUBLIC_FOLDER_PATH = path.resolve(process.cwd(), process.env.PUBLIC_FOLDER_RELATIVE_PATH) || process.env.PUBLIC_FOLDER_ABSOLUTE_PATH;

if (PUBLIC_FOLDER_PATH === undefined) {
    throw new Error('PUBLIC_FOLDER_RELATIVE_PATH or PUBLIC_FOLDER_ABSOLUTE_PATH environment variable must be set.');
}

if (existsSync(PUBLIC_FOLDER_PATH) === false || statSync(PUBLIC_FOLDER_PATH).isDirectory() === false) {
    throw new Error(`The provided public folder path: "${PUBLIC_FOLDER_PATH}" is not a valid directory.`);
}

console.log(`Using PUBLIC_FOLDER_PATH: ${PUBLIC_FOLDER_PATH}`);

execSync('pnpm dev:dev', {
    stdio: 'inherit',
    env: {
        ...process.env,
        PUBLIC_FOLDER_PATH,
    },
});

console.log('Development environment setup complete.');
