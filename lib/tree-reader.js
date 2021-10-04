const fs = require('fs')
const path = require('path')
const util = require('util')

const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const readFile = util.promisify(fs.readFile)

module.exports = class TreeReader {
    constructor(dir){
        this.dir = dir
    }

    async read(dir = this.dir, relativePath = '/') {
        const folder = {}
        folder.path = relativePath
        folder.files = []
        folder.folders = []
        const files = await readdir(dir)
        for (const file of files){
            if((await lstat(path.join(dir,file))).isFile()){
                const data = await readFile(path.join(dir,file))
                folder.files.push({name : file, data : data, path : path.join(relativePath, file) })
            }else{
                folder.folders.push(await this.read(path.join(dir, file), path.join(relativePath, file)))
            }
        }
        return folder
    }
}
