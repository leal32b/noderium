const fs = require('fs')
const path = require('path')

const packageJson = require('../package.json')
const tauriConfigPath = path.join(__dirname, '../src-tauri/tauri.conf.json')
const cargoTomlPath = path.join(__dirname, '../src-tauri/Cargo.toml')

const newVersion = packageJson.version

const tauriConfig = require(tauriConfigPath)
tauriConfig.version = newVersion
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2))

let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8')
cargoToml = cargoToml.replace(/^version = ".*?"/m, `version = "${newVersion}"`)
fs.writeFileSync(cargoTomlPath, cargoToml)

console.log(`✅ Version synced to: ${newVersion}`)
