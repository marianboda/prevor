const exec = require('child_process').exec
const fs = require('fs')

function getFiles(path) {
  let defer = Promise.defer()
  fs.readdir(path, (err, data) => {
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
