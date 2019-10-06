import * as shell from 'shelljs'

// clean out file
console.log(`Run task ${process.argv[2]}`)
if (process.argv[2] === 'clean') {
  console.log('Remove "out" directory')
  shell.rm('-rf', 'out')
} else if (process.argv[2] === 'copy') {
  console.log('Copy static assets')
  shell.mkdir('-p', 'out')
  shell.cp('-R', 'src/scripts', 'out/scripts')
} else console.log(`ಠ_ಠ What task is this? task ${process.argv[2]}`)