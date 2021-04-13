import execa from 'execa'
import Fsify from 'fsify'

const fsify = Fsify({
  persistent: false,
})

const testDir = 'test_npm_package'

describe('flush-npm', () => {
  beforeEach(async () => {
    await execa.command(`rm -rf ${testDir}`)
  })

  afterAll(async () => {
    await execa.command(`rm -rf ${testDir}`)
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
      .then(async path => {
        const {stdout} = await execa.command(`${process.cwd()}/cli.js`, {
          cwd: path,
        })
        expect(stdout).toBe('Not an npm package')
      })
  })

  test('does not run `rm` if no node_modules', () => {
    const structure = [
      {
        type: Fsify.DIRECTORY,
        name: testDir,
        contents: [
          {
            type: Fsify.FILE,
            name: 'package.json',
            contents: JSON.stringify({
              name: 'my-awesome-package',
              version: '1.0.0',
            }),
          },
        ],
      },
    ]

    return fsify(structure)
      .then(structure => structure[0].name)
      .then(async path => {
        const {stderr} = await execa.command(`${process.cwd()}/cli.js`, {
          cwd: path,
        })
        expect(stderr).toContain('no node_modules')
      })
  })
})
