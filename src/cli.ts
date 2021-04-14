#!/usr/bin/env node

import execa from 'execa'
import {existsSync} from 'fs'
import ora from 'ora'
import path from 'path'

main()
async function main(rootDir?: string): Promise<void> {
  const cwd = rootDir || process.cwd()
  const isNpmPackage = existsSync(path.join(cwd, 'package.json'))
  if (!isNpmPackage) {
    console.log('Not an npm package')
    return
  }

  const nodeModulesPath = path.join(cwd, 'node_modules')
  const hasNodeModules = existsSync(nodeModulesPath)
  const spinner = ora('Removing node_modules')
  spinner.start()
  if (hasNodeModules) {
    try {
      await execa.command(`rm -rf ${nodeModulesPath.toString()}`)
      spinner.succeed()
    } catch (error) {
      spinner.stop()
      console.error(error.message)
    }
  } else {
    spinner.info('no node_modules')
  }

  const packageLockPath = path.join(cwd, 'package-lock.json')
  const hasPagkageLockJson = existsSync(packageLockPath)
  spinner.text = 'Removing package-lock.json'
  spinner.start()
  if (hasPagkageLockJson) {
    try {
      await execa.command(`rm ${packageLockPath.toString()}`)
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
    await execa.command(`cd ${cwd}`)
    await execa.command('npm install')
    spinner.succeed()
  } catch (error) {
    spinner.stopAndPersist(error.message)
  }
}

export {main}
