#!/usr/bin/env node

import execa from 'execa'
import fs from 'fs'
import ora from 'ora'
import path from 'path'

const cwd = process.cwd()
const packageJsonPath = path.join(cwd, 'package.json')
const isNpmPackage = fs.existsSync(packageJsonPath)
if (isNpmPackage) main()
else console.log('Not an npm package')

async function main() {
  const spinner = ora('Removing node_modules')
  spinner.start()
  try {
    await execa('rm', ['-rf', 'node_modules'])
    spinner.succeed()
  } catch (error) {
    spinner.stop()
    console.error(error.message)
  }

  spinner.text = 'Removing package-lock.json'
  spinner.start()
  try {
    await execa('rm', ['package-lock.json'])
    spinner.succeed()
  } catch (error) {
    spinner.info('no package-lock.json')
  }

  spinner.text = 'Installing dependencies'
  spinner.start()
  try {
    await execa('npm', ['install'])
    spinner.succeed()
  } catch (error) {
    spinner.stopAndPersist(error.message)
  }
}
