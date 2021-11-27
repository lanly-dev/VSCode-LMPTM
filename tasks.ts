import * as shell from 'shelljs'

// clean out file
console.log(`Run task ${process.argv[2]}`)
if (process.argv[2] === 'clean') {
  console.log('Remove "out" and "dist" directory')
  shell.rm('-rf', 'out')
  shell.rm('-rf', 'dist')
} else if (process.argv[2] === 'copy') { // for Launch Extension ts-watch
  console.log('Copy static assets to "out" directories')
  shell.mkdir('-p', 'out')
  shell.cp('-R', 'src/inject', 'out/inject')
} else console.log(`ಠ_ಠ What task is this? task ${process.argv[2]}`)