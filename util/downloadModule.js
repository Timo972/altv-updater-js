const fs = require("fs");
const ora = require("ora");
const chalk = require("chalk");
const https = require("https");
const path = require("path");
const { promisify } = require("util");

async function downloadModule(updateFiles, workingDir) {
  const downloadChain = updateFiles.map((file) => () => {
    return new Promise(async (resolve, reject) => {
      const fileDest = path.join(workingDir, file.folder, file.name);
      const fileDestFolder = path.join(workingDir, file.folder);

      const spinner = ora(`Downloading ${chalk.yellowBright(file.name)}`);
      spinner.start();

      if (fs.existsSync(fileDest)) await promisify(fs.unlink)(fileDest);

      if (!fs.existsSync(fileDestFolder))
        await promisify(fs.mkdir)(fileDestFolder);

      https
        .get(file.url, (resp) => {
          const writeStream = fs.createWriteStream(fileDest);

          resp.pipe(writeStream);

          resp.on("error", (e) => {
            spinner.color = "red";
            spinner.text = `Failed to download ${file.name}`;
            spinner.stop();
            reject(e);
          });

          writeStream.on("error", (e) => {
            spinner.color = "red";
            spinner.text = `Failed to download ${file.name}`;
            spinner.fail();
            reject(e);
          });

          writeStream.on("finish", () => {
            //console.log(`[DOWNLOADED]: ${file.name}`)
            spinner.text = `Downloaded ${chalk.yellowBright(file.name)}`;
            spinner.succeed();
            resolve();
          });
        })
        .on("abort", () => {
          spinner.color = "yellow";
          spinner.text = `Aborted download of ${file.name}`;
          spinner.warn();
          reject();
        })
        .on("error", (e) => (e) => {
          spinner.color = "red";
          spinner.text = `Failed to download ${file.name}`;
          spinner.fail();
          reject(e);
        });
    });
  });

  let download = downloadChain[0]();
  for (let i = 1; i < downloadChain.length; i++)
    await download
      .then(downloadChain[i])
      .catch((e) =>
        console.log(
          `${chalk.red("[ERROR]")} could not download file ${file.name}: ${e}`
        )
      );

  return;
}

module.exports = {
  downloadModule,
};
