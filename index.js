const exec = require('child_process').exec
const fs = require('fs')
const async = require('async')
const path = require('path')
const mkdirp = require('mkdirp')

let dir = process.argv[2]
let targetDir = process.argv[3]

if (!dir || !targetDir) {
  console.log('dir or target dir not defined')
  process.exit()
}

function getFiles(path) {
  let defer = Promise.defer()
  fs.readdir(path, (err, data) => {
    if (err) return defer.reject(err)
    defer.resolve(data)
  })
  return defer.promise
}

function getOrientCommand(num) {
  return [
      '',
      '',
      '-flop',
      '-rotate 180',
      '-flip',
      '-flip -rotate 90',
      '-rotate 90',
      '-flop -rotate 90',
      '-rotate 270',
    ][num]
}

function getExif(path) {
  let defer = Promise.defer()
  let cmd = `exiftool -n -j "${path}"`
  exec(cmd, (e, so, se) => {
    defer.resolve(se > 0 ? 0 : JSON.parse(so)[0])
  })
  return defer.promise
}

getFiles(dir).then((data) => {
  console.log(data.length + ' files found')
  if (data.length == 0) {
    console.log('nothing to do')
    process.exit()
  }
  mkdirp(targetDir, (err) => {
    processFile(data[0], () => null)
  })
})

function processFile(f, cb) {
  console.log('processing ' + f)
  let fullPath = path.join(dir, f)
  let previewPath = path.join(targetDir, f.replace('.CR2', '.jpg'))
  getExif(fullPath).then((r) => {
    let orient = r.Orientation
    cmd = `exiftool -b -PreviewImage "${fullPath}" > "${previewPath}" || rm -f "${previewPath}"`
    exec(cmd, (e, so, se) => {
      if (orient == 1)
        return cb(null)
      let cmd = `gm mogrify ${getOrientCommand(orient)} "${previewPath}" || rm -f "${previewPath}"`
      exec(cmd, () => cb(null))
    })
  })
}
