// import * as shell from 'shelljs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const shell = require('shelljs')

console.log(`Run task ${process.argv[2]}`)
if (process.argv[2] === 'clean') {
  console.log('Remove "dist" directory')
  shell.rm('-rf', 'dist')
} else if (process.argv[2] === 'copy') { // for Launch Extension ts-watch
  console.log('Copy static assets to "dist" directories')
  shell.mkdir('-p', 'dist')
  shell.cp('-R', 'src/inject', 'dist/inject')
} else console.log(`ಠ_ಠ What task is this? task ${process.argv[2]}`)
