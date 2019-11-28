const cli = require("child_process");
const fs = require("fs");
const path = require('path');

const branch = "beta";
const os = "x64_linux"; //'x64_linux';
let altServerName = undefined;
if (os == "x64_linux") {
  altServerName = "altv-server";
} else {
  altServerName = "altv-server.exe";
}
let moduleUpdated = false;
let serverFilesUpdated = false;
let resourceUpdated = false;
const updateFiles = [
  {
    url: "https://cdn.altv.mp/server/beta/x64_linux/update-info.json",
    folder: "./",
    name: "update-info.json",
    file: "altv-server1"
  },
  {
    url: "https://cdn.altv.mp/server/beta/x64_linux/update.json",
    folder: "./",
    name: "update.json",
    file: "altv-server2"
  },
  {
    url: "https://cdn.altv.mp/node-module/beta/x64_linux/update.json",
    folder: "./modules/",
    name: "update.json",
    file: "node-module"
  }
];
const moduleFiles = [
  {
    url:
      "https://cdn.altv.mp/node-module/" + branch + "/" + os + "/libnode.so.72",
    folder: "./"
  },
  {
    url: "https://cdn.altv.mp/node-module/" + branch + "/" + os + "/modules/libnode-module.so",
    folder: "./modules"
  }
];
const filesToUpdate = [
  {
    url:
      "https://cdn.altv.mp/server/" + branch + "/" + os + "/" + altServerName,
    folder: "./"
  },
  {
    url:
      "https://cdn.altv.mp/server/" + branch + "/" + os + "/data/vehmodels.bin",
    folder: "./data/"
  },
  {
    url:
      "https://cdn.altv.mp/server/" + branch + "/" + os + "/data/vehmods.bin",
    folder: "./data/"
  }
];

const mkdir = (path, cb)=>{
    cli.exec(`mkdir ${path}`, (err, stdout, stderr)=>{
        cb(err, stdout, stderr);
    });
}

const wget = (config, cb)=>{
    if(!fs.existsSync(path.join(__dirname, config.dest))){
        console.log('folder does not exist!')
        mkdir(path.join(__dirname,config.dest), (err, stdout, stderr)=>{
            if(err ||stderr){
                console.error(err + stderr);
            }
            console.log(stdout);
            cli.exec(`cd ${config.dest} && wget ${config.url}`, (err, stdout, stderr)=>{
                if(stderr){
                    console.error(stderr);
                }
                cb(err, stdout);
            });
        });
    }else{
        cli.exec(`cd ${config.dest} && wget ${config.url}`, (err, stdout, stderr)=>{
            if(stderr){
                console.error(stderr);
            }
            cb(err, stdout);
        });
    }
}

const debug = (err, stdout, stderr) => {
  if (err) {
    console.log(err);
  }
  if (stderr) {
    console.log(stderr);
  }
  console.log(stdout);
};

const updateResources = () => {
  cli.exec(
    "git clone https://github.com/Timo972/afterliferp-dev.git",
    (err, stdout, stderr) => {
      debug(err, stdout, stderr);
      if (os == "x64_linux") {
        cli.exec("mv afterliferp-dev/* ./resources/*", (err, stdout, stderr) => {
          debug(err, stdout, stderr);
          process.exit();
        });
      } else {
        cli.exec(`move ${path.normalize(__dirname+'\\afterlife-dev')} ${path.normalize(__dirname+'\\resources')}`, (err, stdout, stderr) => {
          debug(err, stdout, stderr);
          process.exit();
        });
      }
    }
  );
};

const compareVersions = updaterVersion => {
  let currentVersion = fs.existsSync("./resources/afterlife-" + updaterVersion);
  if (!currentVersion) {
    updateResources();
    console.log("has to update");
  } else {
    console.log("executing start.sh");
    if (os == "x64_linux") {
      cli.exec("./start.sh", (err, stdout, stderr) => {
        debug(err, stdout, stderr);
        console.log("executed start.sh");
        process.exit();
      });
    } else {
      cli.exec("./altv-server.exe", (err, stdout, stderr) => {
        debug(err, stdout, stderr);
        process.exit();
      });
    }
  }
};

const checkVersion = () => {
  wget(
    {
      url: "https://afterlife-rp.de/version/info.json",
      dest: "./",
      dry: true
    },
    function(err, data) {
      let info = JSON.parse(fs.readFileSync("./info.json", "utf8"));
      console.log(info);
      compareVersions(info.version);
    }
  );
};

const altVUpdate = type => {
  if (type == "node-module") {
    let done = 0;
    moduleFiles.forEach(file => {
      wget(
        {
          url: file.url,
          dest: file.folder,
          dry: true
        },
        (err, data) => {
          if (err) return console.error(err);
          console.log('Downloaded: ' + JSON.stringify(data));
          done++;
        }
      );
    });
    console.log("Downloading: node-module");
    let moduleDone = setInterval(() => {
      if (done == moduleFiles.length) {
        console.log("Downloaded: node-module");
        moduleUpdated = true;
        clearInterval(moduleDone);
      }
    }, 1000);
  }else if(type == 'altv-server2'){
    let done = 0;
    filesToUpdate.forEach(file => {
        wget(
          {
            url: file.url,
            dest: file.folder,
            dry: true
          },
          (err, data) => {
            if (err) return console.error(err);
            console.log('Downloaded: ' + JSON.stringify(data));
            done++;
          }
        );
      });
      console.log('Downloading: server-files');
    let altvServerDone = setInterval(()=>{
        if(done == filesToUpdate.length){
            console.log('Downloaded: server-files');
            serverFilesUpdated = true;
            clearInterval(altvServerDone);
        }
    }, 1000);
  }
};

const altVersionCompare = (type, newVersion, oldVersion) => {
  if (type == "node-module") {
    if (
      newVersion.latestBuildNumber != oldVersion.latestBuildNumber ||
      newVersion.hashList["modules/libnode-module.so"] !=
        oldVersion.hashList["modules/libnode-module.so"] ||
      newVersion.hashList["libnode.so.72"] !=
        oldVersion.hashList["libnode.so.72"]
    ) {
        altVUpdate(type);
    }else{
        moduleUpdated = true;
    }
  } else if (type == "altv-server2") {
    if (newVersion.latestBuildNumber != oldVersion.latestBuildNumber) {
        altVUpdate(type);
    }else{
        serverFilesUpdated = true;
    }
  }
};

const checkAltV = () => {
  updateFiles.forEach(update => {
    if(!fs.existsSync(update.folder+update.name)){
        altVUpdate(update.file);
        return;
    }
    let oldVersion = JSON.parse(
      fs.readFileSync(update.folder + update.name, "utf8")
    );
    wget(
      {
        url: update.url,
        dest: update.folder,
        dry: true
      },
      (err, data) => {
        if (err) return console.error(err);
        let newVersion = JSON.parse(
          fs.readFileSync(update.folder + update.name, "utf8")
        );
        altVersionCompare(update.file, newVersion, oldVersion);
      }
    );
  });
};

let serverUpdated = setInterval(()=>{
    if(moduleUpdated && serverFilesUpdated){
        checkVersion();
    } 
}, 1000);

checkAltV();