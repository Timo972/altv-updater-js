# altv-srv -- alt:V Multiplayer Server installer / updater

---
## how-to-install
```bash
# installing the installer and its needed packages
npm i -g altv-srv
```
---
## Advantages
- fast
- pretty console prints
- c#-Module support
- go-module support (unfinished)
- angelscript-module support
- python-module support (once it's finished)
- js-module support
- js-bytecode-module support
- altv-voice-server support
- only update if outdated
---
## CLI-usage
```bash
Usage: altv-srv <cmd> [options]

Commands:
altv-srv install <branch>  Install alt:V Multiplayer server and its modules   [aliases: i]
altv-srv delete            Delete the alt:V Multiplayer server and its files  [aliases: d]

Options:
--version  Show version number                                                [boolean]
-h, --help     Show help                                                      [boolean]

```

## Example
```bash
# Install full server (server + data) & js + js-bytecode module
altv-srv install release -d ./my-server -m server data js js-bytecode
### Notice:
# To be able to run the server you have to at least install server & data
```

### Install options
```bash
altv-srv install <branch>

Install alt:V Multiplayer server and its modules

Positionals:
  directory, dir, d  Set relative server path                   [string] [default: "./"]

Options:
      --version  Show version number                            [boolean]
  -h, --help     Show help                                      [boolean]
  -m, --modules  Specify modules to download
         [array] [choices: "js", "javascript", "c#", "cs", 
                           "csharp", "go", "as", "angelscript", 
                           "py", "python", "voice", "server",
                           "jsb", "js-bytecode", "bytecode"] 
                           [default: ["server","js"]]
  -o, --others   Generate server.cfg and on linux start.sh      [boolean] [default: false]

```

### Delete options
```bash
altv-srv delete

Delete the alt:V Multiplayer server and its files

Positionals:
  directory, dir, d  Set relative server path        [string] [default: "./"]

Options:
      --version  Show version number                 [boolean]
  -h, --help     Show help                           [boolean]
      --hard     Remove server.cfg, logs, resources  [boolean] [default: false]
```
---
## script usage
Not supported currently

---

### If you notice something you think its not intended feel free to open an issue
