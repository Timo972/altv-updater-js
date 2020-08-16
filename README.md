# altv-updater
## requirements
  - linux / windows os
  - nodejs + npm

## how-to-use
  ```
    // installing the installers needed packages
    npm i -g altv-server-updater
    // notice the installer needs the altv.json if its generating it -> DONT DELETE
  ```
## cli usage
  ```
    altv-srv [--options]
  ```
## options
 - ```--branch [branch]``` selects the servers update channel
 - ```--others``` generates server.cfg, start.sh (only on linux), resources folder, cache folder
 - ```--uninstall``` deletes cache, serverfiles, ect.
 - ```--dir [my-altv-server-folder]``` installs the altv server into specified folder
 
## bugs
 - sometimes it takes really long to download smth