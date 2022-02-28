export type IFile = {
  url: string;
  folder: string;
  type: string;
  name: string;
  isGithubRelease?: boolean;
};

export function getFiles(branch: string, os: string): IFile[] {
  return [
    //go-module
    {
      url: `shockdev04/altv-go-module/${branch}/${os}`,
      folder: `./modules`,
      type: "go-module",
      name: os == "x64_linux" ? "libgo-module.so" : "go-module.dll",
      isGithubRelease: true,
    },
    //angelscript-module
    {
      url: `LeonMrBonnie/altv-angelscript-module/${branch}/${os}`,
      folder: `./modules`,
      type: "angelscript-module",
      name: os == "x64_linux" ? null : "angelscript-module.dll",
      isGithubRelease: true,
    },
    //js-module
    {
      url: `https://cdn.altv.mp/js-module/${branch}/${os}/update.json`,
      folder: `./modules/js-module`,
      name: `update.json`,
      type: "js-module",
    },
    {
      url: `https://cdn.altv.mp/js-module/${branch}/${os}/modules/js-module/${
        os == "x64_linux" ? `libjs-module.so` : `js-module.dll`
      }`,
      folder: `./modules/js-module`,
      name: os == "x64_linux" ? `libjs-module.so` : `js-module.dll`,
      type: "js-module",
    },
    {
      url: `https://cdn.altv.mp/js-module/${branch}/${os}/modules/js-module/${
        os == "x64_linux"
          ? `libnode.so.${branch == "dev" ? "83" : "72"}`
          : `libnode.dll`
      }`,
      folder: `./modules/js-module`,
      name:
        os == "x64_linux"
          ? `libnode.so.${branch == "dev" ? "83" : "72"}`
          : `libnode.dll`,
      type: "js-module",
    },
    //coreclr-module
    {
      url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/update.json`,
      folder: `./modules/csharp-module`,
      name: `update.json`,
      type: "csharp-module",
    },
    {
      url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/modules/${
        os == "x64_linux" ? `libcsharp-module.so` : `csharp-module.dll`
      }`,
      folder: `./modules/csharp-module`,
      name: os == "x64_linux" ? `libcsharp-module.so` : `csharp-module.dll`,
      type: "csharp-module",
    },
    {
      url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/AltV.Net.Host.runtimeconfig.json`,
      folder: `./`,
      name: `AltV.Net.Host.runtimeconfig.json`,
      type: "csharp-module",
    },
    {
      url: `https://cdn.altv.mp/coreclr-module/${branch}/${os}/${
        os == "x64_linux" ? `AltV.Net.Host.dll` : `AltV.Net.Host.dll`
      }`,
      folder: `./`,
      name: os == "x64_linux" ? `AltV.Net.Host.dll` : `AltV.Net.Host.dll`,
      type: "csharp-module",
    },
    //data
    {
      url: `https://cdn.altv.mp/data/${branch}/vehmodels.bin`,
      folder: `./data`,
      name: `vehmodels.bin`,
      type: "data",
    },
    {
      url: `https://cdn.altv.mp/data/${branch}/vehmods.bin`,
      folder: `./data`,
      name: `vehmods.bin`,
      type: "data",
    },
    {
      url: `https://cdn.altv.mp/data/${branch}/clothes.bin`,
      folder: `./data`,
      name: `clothes.bin`,
      type: "data",
    },
    {
      url: `https://cdn.altv.mp/data/${branch}/update.json`,
      folder: `./data`,
      name: `update.json`,
      type: "data",
    },
    //server
    {
      url: `https://cdn.altv.mp/server/${branch}/${os}/update.json`,
      folder: `./`,
      name: `update.json`,
      type: "server",
    },
    {
      url: `https://cdn.altv.mp/server/${branch}/${os}/${
        os == "x64_linux" ? `altv-server` : `altv-server.exe`
      }`,
      folder: `./`,
      name: os == "x64_linux" ? `altv-server` : `altv-server.exe`,
      type: "server",
    },
    // voice
    {
      url: `https://cdn.altv.mp/voice-server/${branch}/${os}/${
        os == "x64_linux" ? `altv-voice-server` : `altv-voice-server.exe`
      }`,
      folder: `./`,
      name: os == "x64_linux" ? `altv-voice-server` : `altv-voice-server.exe`,
      type: "voice",
    },
    {
      url: `https://cdn.altv.mp/voice-server/${branch}/${os}/update.json`,
      folder: `./`,
      name: "update.json",
      type: "voice",
    },
    // bytecode
    {
      type: "js-bytecode-module",
      url: `https://cdn.altv.mp/js-bytecode-module/${branch}/${os}/${
        os === "x64_linux"
          ? "libjs-bytecode-module.so"
          : "js-bytecode-module.dll"
      }`,
      folder: `./modules/js-bytecode-module`,
      name:
        os === "x64_linux"
          ? "libjs-bytecode-module.so"
          : "js-bytecode-module.dll",
    },
    {
      type: "js-bytecode-module",
      url: `https://cdn.altv.mp/js-bytecode-module/${branch}/${os}/update.json`,
      folder: `./modules/js-bytecode-module`,
      name: "update.json",
    },
  ];
}
