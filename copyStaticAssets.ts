import * as shell from 'shelljs'

shell.mkdir('-p', 'out')
shell.cp('-R', 'src/resrc', 'out/resrc')