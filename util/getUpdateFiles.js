function getUpdateFiles(os, branch) {
    return [
        //js-module
        {
            url: `https://cdn.altv.mp/js-module/${branch}/${os}/update.json`,
            folder: `./modules/js-module`,
            name: `update.json`,
            type: 'js-module'
        },
        {
            url: `https://cdn.altv.mp/js-module/${branch}/${os}/modules/js-module/${os == "x64_linux" ? `libjs-module.so` : `js-module.dll`}`,
            folder: `./modules/js-module`,
            name: os == "x64_linux" ? `js-module.so` : `js-module.dll`,
            type: 'js-module'
        },
        {
            url: `https://cdn.altv.mp/js-module/${branch}/${os}/modules/js-module/${os == "x64_linux" ? `libnode.so.72` : `libnode.dll`}`,
            folder: `./modules/js-module`,
            name: os == "x64_linux" ? `libnode.so.72` : `libnode.dll`,
            type: 'js-module'
        },
        //coreclr-module
        {
            url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/update.json`,
            folder: `./modules/csharp-module`,
            name: `update.json`,
            type: 'csharp-module'
        },
        {
            url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/modules/${os == "x64_linux" ? `libcsharp-module.so` : `csharp-module.dll`}`,
            folder: `./modules/csharp-module`,
            name: os == "x64_linux" ? `libcsharp-module.so` : `csharp-module.dll`,
            type: 'csharp-module'
        },
        {
            url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/AltV.Net.Host.runtimeconfig.json`,
            folder: `./`,
            name: `AltV.Net.Host.runtimeconfig.json`,
            type: 'csharp-module'
        },
        {
            url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/${os == "x64_linux" ? `AltV.Net.Host.dll` : `AltV.Net.Host.dll`}`,
            folder: `./`,
            name: os == "x64_linux" ? `AltV.Net.Host.dll` : `AltV.Net.Host.dll`,
            type: 'csharp-module'
        },
        //server
        {
            url: `https://cdn.altv.mp/server/${branch}/${os}/data/vehmodels.bin`,
            folder: `./data`,
            name: `vehmodels.bin`,
            type: 'server'
        },
        {
            url: `https://cdn.altv.mp/server/${branch}/${os}/data/vehmods.bin`,
            folder: `./data`,
            name: `vehmods.bin`,
            type: 'server'
        },
        {
            url: `https://cdn.altv.mp/server/${branch}/${os}/update.json`,
            folder: `./`,
            name: `update.json`,
            type: 'server'
        },
        {
            url: `https://cdn.altv.mp/server/${branch}/${os}/${os == "x64_linux" ? `altv-server` : `altv-server.exe`}`,
            folder: `./`,
            name: os == "x64_linux" ? `altv-server` : `altv-server.exe`,
            type: 'server'
        }
    ]
}

module.exports = {
    getUpdateFiles
}