import * as shell from 'shelljs'

// clean out file
console.log(`Run task ${process.argv[2]}`)
if (process.argv[2] === 'clean') {
  console.log('Remove "out" and "dist" directory')
  shell.rm('-rf', 'out')
  shell.rm('-rf', 'dist')
} else if (process.argv[2] === 'copy') {
  console.log('Copy static assets to "out" directory')
  shell.mkdir('-p', 'out')
  shell.cp('-R', 'src/scripts', 'out/scripts')
} else console.log(`ಠ_ಠ What task is this? task ${process.argv[2]}`)