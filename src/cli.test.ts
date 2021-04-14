import del from 'del'
import {existsSync} from 'fs'
import Fsify from 'fsify'
import {
  mockConsoleLog,
  mockProcessExit,
  mockProcessStderr
} from 'jest-mock-process'
import ora from 'ora'

import {exportFunctions, main, spinner} from './cli'

const rootDir = process.cwd()
const testDir = 'test_npm_package'
const fsify = Fsify({
  persistent: false,
})

describe('flush-npm', () => {
  mockConsoleLog()
  mockProcessStderr()

  const mockSpinner = jest.spyOn(spinner, 'info')

  afterEach(async () => {
    await cleanupTestDir()
    mockSpinner.mockReset()
  })

  it('exits if not an npm package', async () => {
    const mockExit = mockProcessExit()
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)
    expect(mockExit).toHaveBeenCalledWith(126)

    mockExit.mockRestore()
  })

  it('skips node_modules removal if no node_modules', async () => {
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'test-app',
              version: '1.0.0',
              dependencies: {
                'is-number': '7.0.0',
              },
            }),
          },
        ],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)
    expect(mockSpinner).toHaveBeenCalledWith('no node_modules')
  })

  it('removes node_modules if node_modules exists', async () => {
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'test-app',
              version: '1.0.0',
              dependencies: {
                'is-number': '7.0.0',
              },
            }),
          },
          {
            type: Fsify.DIRECTORY,
            name: 'node_modules',
            contents: [],
          },
        ],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)
    const msgs = mockSpinner.mock.calls.map(item => item[0])
    expect(msgs.includes('no node_modules')).toBe(false)
  })

  it('skips package-lock.json removal if no package-lock.json', async () => {
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'test-app',
              version: '1.0.0',
              dependencies: {
                'is-number': '7.0.0',
              },
            }),
          },
        ],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)
    expect(mockSpinner).toHaveBeenCalledWith('no package-lock.json')
  })

  it('removes package-lock.json if package-lock.json exists', async () => {
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'test-app',
              version: '1.0.0',
              dependencies: {
                'is-number': '7.0.0',
              },
            }),
          },
          {
            type: Fsify.FILE,
            name: 'package-lock.json',
            contents: 'data',
          },
        ],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)
    const msgs = mockSpinner.mock.calls.map(item => item[0])
    expect(msgs.includes('no package-lock.json')).toBe(false)
  })

  it('installs dependencies', async () => {
    const dependency = 'is-number'
    const dependencyVersion = '7.0.0'
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'test-app',
              version: '1.0.0',
              dependencies: {
                [dependency]: dependencyVersion,
              },
            }),
          },
        ],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)
    console.log(`${packageDir}/node_modules/${dependency}`)
    const hasDependency = existsSync(`${packageDir}/node_modules/${dependency}`)
    expect(hasDependency).toBe(true)
  })

  it('shows error msg when npm install throws Error', async () => {
    const errorMsg = 'cannot install deps'
    const mockInstallDeps = jest
      .spyOn(exportFunctions, 'installDeps')
      .mockImplementation(() => {
        return new Promise((resolve, reject) => reject(new Error(errorMsg)))
      })
    const mockSpinnerStop = jest.spyOn(spinner, 'stopAndPersist')

    const dependency = 'is-number'
    const dependencyVersion = '7.0.0'
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'test-app',
              version: '1.0.0',
              dependencies: {
                [dependency]: dependencyVersion,
              },
            }),
          },
        ],
      },
    ]

    const packageDir = await fsify(structure)
      .then(structure => structure[0].name)
      .then(path => path)

    await main(packageDir)

    const msg = mockSpinnerStop.mock.calls.map(item => item[0])[0].text
    expect(msg).toBe(errorMsg)
    mockInstallDeps.mockRestore()
    mockSpinnerStop.mockRestore()
  })
})

async function cleanupTestDir() {
  await del([`${rootDir}/${testDir}`])
}
