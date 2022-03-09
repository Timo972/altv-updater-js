#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from "yargs/helpers"
import {InstallCommand} from "./commands/install.command"
import {DeleteCommand} from "./commands/delete.command"

const program = yargs(hideBin(process.argv))
  .scriptName('altv-srv')
  .usage('Usage: $0 <cmd> [options]')
  .detectLocale(false)
  .demandCommand()
  .wrap(120)

program.command(InstallCommand)
program.command(DeleteCommand)
//program.command();

program
  .help('h')
  .alias('h', 'help')
  .fail(() => program.showHelp())
  .argv