const Hypercore = require('hypercore-x')
const Hyperswarm = require('hyperswarm')
const Hyperbee = require('hyperbee')
const TreeReader = require('./lib/tree-reader')

const ram = require('random-access-memory')

const util = require('util')
const fs = require('fs')
const path = require('path')
const http = require('http')

const swarm = new Hyperswarm()

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)


exports.readFromFs = async (input, storage) => {

    const core = storage ? new Hypercore(storage) : new Hypercore(ram)
    const bee = new Hyperbee(core, {
        valueEncoding: 'binary',
        keyEncoding: 'utf-8'
    })

    const beeFolders = bee.sub('folders')
    const beeFiles = bee.sub('files')

    const treeReader = new TreeReader(input)
    const tree = await treeReader.read()

    await core.ready()
    await bee.ready()

    swarm.join(core.discoveryKey)
    swarm.on('connection', connection => {
        core.replicate(connection)
    })

    const dirToBee = async (subtree) => {
        await beeFolders.put(subtree.path)
        subtree.files.forEach(async (file) => {
            await beeFiles.put(file.path, file.data)
        })
        subtree.folders.forEach(async (folder) => {
            dirToBee(folder)
        })
    }

    await dirToBee(tree)
    return core.key
}

exports.writeToFs = async (pk, storage, output) => {

    const core = storage ? new Hypercore(storage,Buffer.from(pk,'hex')) : new Hypercore(ram, Buffer.from(pk,'hex'))
    const bee = new Hyperbee(core, {
        valueEncoding: 'binary',
        keyEncoding: 'utf-8'
    })

    const beeFolders = bee.sub('folders')
    const beeFiles = bee.sub('files')

    await core.ready()
    await bee.ready()

    swarm.join(core.discoveryKey)
    swarm.on('connection', connection => {
        core.replicate(connection)
    })

    await swarm.flush()

    for await (const { key } of beeFolders.createReadStream()) {
        fs.mkdirSync(path.join(output, key), { recursive: true })
    }

    for await (const { key, value } of beeFiles.createReadStream()) {
        writeFile(path.join(output, key), value)
    }
}

exports.startServer = (folder, port) => {
    http.createServer( async (req, res) => {
        try{
            const data = await readFile(path.join('./', folder, req.url))
            res.writeHead(200)
            res.end(data)
        }catch(err){
            res.writeHead(404)
            res.end(JSON.stringify(err))
            return
        }
    }).listen(port)
    console.log("Listening on " + port)
}
