#!/usr/bin/env node
import del from 'del'
import {existsSync} from 'fs'
import npmRun from 'npm-run'
import ora from 'ora'
import path from 'path'

const spinner = ora('Removing node_modules')

const exportFunctions = {
  installDeps,
}

// It calls the function only if executed through the command line
if (require.main === module) {
  const pathArg = process.argv.slice(2, 3)[0]
  if (pathArg) console.log(`flush-npm in ${pathArg}`)
  main(pathArg)
}

async function main(rootDir?: string): Promise<undefined> {
  const cwd = rootDir || process.cwd()
  const isNpmPackage = existsSync(path.join(cwd, 'package.json'))
  if (!isNpmPackage) {
    console.log('Not an npm package')
    return process.exit(126)
  }

  const nodeModulesPath = path.join(cwd, 'node_modules')
  const hasNodeModules = existsSync(nodeModulesPath)
  spinner.start()
  if (hasNodeModules) {
    await del([nodeModulesPath])
    spinner.succeed()
  } else {
    spinner.info('no node_modules')
  }

  const packageLockPath = path.join(cwd, 'package-lock.json')
  const hasPagkageLockJson = existsSync(packageLockPath)
  spinner.text = 'Removing package-lock.json'
  spinner.start()
  if (hasPagkageLockJson) {
    await del([packageLockPath])
    spinner.succeed()
  } else {
    spinner.info('no package-lock.json')
  }

  spinner.text = 'Installing dependencies'
  spinner.start()
  try {
    await exportFunctions.installDeps(cwd)
    spinner.succeed()
    return
  } catch (error) {
    spinner.stopAndPersist({text: error.message})
    return
  }
}

function installDeps(rootDir: string): Promise<Error | undefined> {
  return new Promise((resolve, reject) => {
    npmRun.exec('npm install', {cwd: rootDir}, err => {
      if (err) reject(err)

      resolve(undefined)
    })
  })
}

export {main, spinner, exportFunctions}
