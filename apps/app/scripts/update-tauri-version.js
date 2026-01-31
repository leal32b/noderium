import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '../package.json');
const tauriConfigPath = join(__dirname, '../src-tauri/tauri.conf.json');
const cargoTomlPath = join(__dirname, '../src-tauri/Cargo.toml');
const cargoLockPath = join(__dirname, '../src-tauri/Cargo.lock');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const newVersion = packageJson.version;
console.log(`🔄 Syncing version to: ${newVersion}`);

const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
tauriConfig.version = newVersion;
writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2));
console.log('✅ tauri.conf.json updated');

let cargoToml = readFileSync(cargoTomlPath, 'utf-8');
cargoToml = cargoToml.replace(/^version = ".*?"/m, `version = "${newVersion}"`);
writeFileSync(cargoTomlPath, cargoToml);
console.log('✅ Cargo.toml updated');

let cargoLock = readFileSync(cargoLockPath, 'utf-8');
cargoLock = cargoLock.replace(
  /name = "noderium-app"\nversion = "[^"]*"/,
  `name = "noderium-app"\nversion = "${newVersion}"`
);
writeFileSync(cargoLockPath, cargoLock);
console.log('✅ Cargo.lock updated');

