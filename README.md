# altv-srv - an alt:V Multiplayer Server installer / updater
## Requirements
  - node >= 12

## how-to-install
```css
// installing the installer and its needed packages
npm i -g altv-srv
// notice the installer needs the .altvrc if its generating it -> DONT DELETE
```
## Advantages
- Minimal dependencies
- Pretty console prints
- C#-Module support

## CLI-usage
```css
altv-srv [--options]
```
## Options
 - ``--branch [branch]`` selects the servers update channel
 - ``--others`` generates server.cfg, start.sh (only on linux), resources folder, cache folder
 - ``--uninstall`` deletes cache, serverfiles, ect.
 - ``--dir [my-altv-server-folder]`` installs the altv server into specified folder
 - ``--csharp`` flag downloads the csharp module
 - ``--js`` flag downloads the js module

## script usage
```js
const altServer = require("altv-srv");

const altServerDir = "./";

async function downloadAltVServer() {

  await altServer.download(altServerDir, "release", ["server", "js-module", "csharp-module"])
  .catch(e => console.log(`could not download server: ${e}`));

  await altServer.generateOthers(altServerDir);

}

async function uninstallAltVServer() {

  await altServer.remove(altServerDir).catch(e => console.log(`could not delete server: ${e}`));

}
  ```
## Bugs
 - no known bugs

If you notice something you think its not intended feel free to open an issue