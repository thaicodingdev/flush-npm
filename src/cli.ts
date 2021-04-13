#!/usr/bin/env node

import execa from 'execa'
import {existsSync} from 'fs'
import ora from 'ora'
import path from 'path'

const cwd = process.cwd()
const isNpmPackage = existsSync(path.join(cwd, 'package.json'))
if (isNpmPackage) main()
else console.log('Not an npm package')

async function main() {
  const hasNodeModules = existsSync(path.join(cwd, 'node_modules'))
  const spinner = ora('Removing node_modules')
  spinner.start()
  if (hasNodeModules) {
    try {
      await execa('rm', ['-rf', 'node_modules'])
      spinner.succeed()
    } catch (error) {
      spinner.stop()
      console.error(error.message)
    }
  } else {
    spinner.info('no node_modules')
  }

  const hasPagkageLockJson = existsSync(path.join(cwd, 'package-lock.json'))
  spinner.text = 'Removing package-lock.json'
  spinner.start()
  if (hasPagkageLockJson) {
    try {
      await execa('rm', ['package-lock.json'])
      spinner.succeed()
    } catch (error) {
      spinner.info('no package-lock.json')
    }
  } else {
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
