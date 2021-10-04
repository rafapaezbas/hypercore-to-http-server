#!/usr/bin/env node
process.title = 'hypercore-to-http-server'

const subcommand = require('subcommand')
const lib = require('../index.js')

const commands = [
  {
    name: 'export',
    command: async (args) => {
      const key = await lib.readFromFs(args.input, args.storage)
      console.log("Hyperbee public key: " + key.toString('hex'))
    },
    options: [
      {
        name: 'storage',
        abbr: 's'
      },
      {
        name: 'input',
        abbr: 'i'
      }
    ]
  },
  {
    name: 'import',
    command: async (args) => {
      lib.writeToFs(args.key, args.storage, args.output)
      if(args.port){
        lib.startServer(args.output, args.port)
      }
    },
    options: [
      {
        name: 'key',
        abbr: 'k'
      },
      {
        name: 'storage',
        abbr: 's'
      },
      {
        name: 'output',
        abbr: 'o'
      },
      {
        name: 'port',
        abbr: 'p'
      }
    ]
  }
]


const args = process.argv.slice(2)
const match = subcommand(commands)
const matched = match(args)
if (!matched) {
  process.exit(0)
}
