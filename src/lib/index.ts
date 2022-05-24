import { getAssetUrl, getRelease } from "../helpers/github.helpers"
import { getFiles } from "../helpers/cdn.helpers"
import { checkVersion } from "../helpers/util.helpers"
import { join } from "path"
import { dirAsync, exists, removeAsync } from "fs-jetpack"
import { downloadFile } from "helpers/download.helpers"

export const hardRegistry = [
  "server.cfg",
  "server.log",
  "crashdumps",
  "cache",
  "resources",
  "start.sh",
]

export const install = async (
  installDir: string,
  branch: string,
  modules: string[],
  os = `${process.arch}_${process.platform}`
) => {
  const files = getFiles(branch, os as never)

  const createModuleDownload = async (mod: string): Promise<boolean> => {
    const versionFile = files.find(
      (f) => f.type === mod && f.name === "update.json"
    )
    const up2date =
      versionFile !== undefined
        ? await checkVersion(versionFile, installDir)
        : false

    if (up2date) return true

    const moduleFiles = files.filter((f) => f.type === mod)
    const isGithubHosted = moduleFiles[0].isGithubRelease === true

    const [owner, repo, branch] = moduleFiles[0].url.split("/")
    const githubRelease = isGithubHosted
      ? await getRelease(owner, repo, branch)
      : null

    if (typeof githubRelease === "string") return false

    for (const file of moduleFiles) {
      if (file.name == null) continue

      const fileDest = join(installDir, file.folder, file.name)
      const fileDestFolder = join(installDir, file.folder)

      if (isGithubHosted) {
        file.url = getAssetUrl(githubRelease, file.name)
        if (file.url == null) continue
      }

      if (exists(fileDest)) await removeAsync(fileDest)

      if (!exists(fileDestFolder)) await dirAsync(fileDestFolder)

      await downloadFile(file.url, fileDest)
    }

    return true
  }

  const moduleDownloadChain = modules.map((mod) => createModuleDownload(mod))

  await Promise.all(moduleDownloadChain)
}

export const remove = async (
  dir: string,
  hard = false,
  os = `${process.arch}_${process.platform}`
) => {
  for (const branch of ["release", "rc", "dev"]) {
    const files = getFiles(branch, os as never)

    for (const file of files) {
      if (!file || !file.folder || !file.name) continue

      const fileDest = join(dir, file.folder, file.name)
      const fileDestFolder = join(dir, file.folder)

      if (!exists(fileDestFolder)) continue

      if (file.folder !== "./" && exists(fileDestFolder))
        await removeAsync(fileDestFolder)
      else if (exists(fileDest)) await removeAsync(fileDest)
    }
  }

  if (hard) {
    for (const fileOrFolder of hardRegistry) {
      const path = join(dir, fileOrFolder)

      if (exists(path)) {
        await removeAsync(path)
      }
    }
  }
}
