import execa from 'execa'
import Fsify from 'fsify'
import {stdout} from 'test-console'

import {main} from './cli'

const rootDir = process.cwd()
const testDir = 'test_npm_package'
const fsify = Fsify({
  persistent: false,
})

describe('flush-npm', () => {
  beforeEach(async () => {
    await cleanupTestDir()
  })

  afterAll(async () => {
    await cleanupTestDir()
  })

  test('exits if not an npm package', () => {
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [],
      },
    ]

    return fsify(structure)
      .then(structure => structure[0].name)
      .then(path => {
        const output = stdout
          .inspectSync(async () => await main(path))
          .toString()
        expect(/Not an npm package/.test(output)).toBe(true)
      })
  })

  // test('does not run `rm -rf node_modules` if no node_modules', () => {
  //   const structure = [
  //     {
  //       type: Fsify.DIRECTORY,
  //       name: testDir,
  //       contents: [
  //         {
  //           type: Fsify.FILE,
  //           name: 'package.json',
  //           contents: JSON.stringify({
  //             name: 'my-awesome-package',
  //             version: '1.0.0',
  //           }),
  //         },
  //       ],
  //     },
  //   ]

  //   return fsify(structure)
  //     .then(structure => structure[0].name)
  //     .then(async path => {
  //       const {stderr} = await execa.command(`${process.cwd()}/cli.js`, {
  //         cwd: path,
  //       })
  //       expect(stderr).toContain('no node_modules')
  //     })
  // })
})

async function cleanupTestDir() {
  return execa.command(`rm -rf ${rootDir}/${testDir}`)
}
