# altv-srv - CLI Installer/Updater for alt:V Multiplayer Server
## requirements
  - linux / windows os
  - nodejs

## how-to-install
  ```css
    // installing the installer and its needed packages
    npm i -g altv-srv
    // notice the installer needs the .altvrc if its generating it -> DONT DELETE
  ```
## cli usage
  ```css
    altv-srv [--options]
  ```
## options
 - ``--branch [branch]`` selects the servers update channel
 - ``--others`` generates server.cfg, start.sh (only on linux), resources folder, cache folder
 - ``--uninstall`` deletes cache, serverfiles, ect.
 - ``--dir [my-altv-server-folder]`` installs the altv server into specified folder

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
## bugs
 - no known bugs

If you notice something you think its not intended feel free to open an issue