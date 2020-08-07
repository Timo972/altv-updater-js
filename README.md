# afterlife-updater ood
 ## requirements
  - linux / windows os
  - nodejs
  - lodash.isequal package
 ## how-to-use
  ```
    // installing the installers needed packages
    npm i
    // notice the installer needs the package.json and node_modules
  ```
 ## cli
   ```
    // normal installing
    node install.js

    // installing + generating "others"
    node install.js --others

    // installing in another relative directory
    node install.js --dir altv-server
    // ^ will generate a folder with the server inside

    // uninstalling
    node install.js --uninstall
   ```
