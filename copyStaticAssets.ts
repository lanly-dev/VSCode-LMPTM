import * as shell from 'shelljs'

shell.mkdir('-p', 'out')
shell.cp('-R', 'src/scripts', 'out/scripts')