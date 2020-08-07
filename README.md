# altv-updater
 ## requirements
  - linux / windows os
  - nodejs + npm
  - lodash.isequal package
 ## how-to-use
  ```
    // installing the installers needed packages
    npm i
    // notice the installer needs the package.json and node_modules
  ```
 ## cli usage
  ```
    node install.js --options
  ```
 ## options
 - ```--others``` generates server.cfg, start.sh (only on linux), resources folder, cache folder
 - ```--uninstall``` deletes cache, serverfiles, ect.
 - ```--dir my-alt-server``` installs the altv server into specified folder
 ## bugs
 - sometimes it freezes (idk why) or maybe it takes really long to download smth