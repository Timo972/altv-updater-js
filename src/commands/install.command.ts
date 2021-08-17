import { Arguments, Argv, CommandModule } from 'yargs';
import { isAbsolute, relative, join } from 'path';
import {exists, dirAsync, removeAsync } from 'fs-jetpack';
import {yellowBright, blueBright, red, yellow} from 'chalk';
import ora from 'ora';
import { getFiles } from "../helpers/cdn.helpers";
import {checkVersion} from "../helpers/util.helpers";
import { getAssetUrl, getRelease } from "../helpers/github.helpers";
import { downloadFile } from "../helpers/download.helpers";
import {generateServerConfig, generateStartScript} from "../helpers/scaffold";
// import { getConfig } from "../helpers/config.helpers";

export const InstallCommand: CommandModule = {
    command: 'install <branch>',
    aliases: 'i',
    describe: 'Install alt:V Multiplayer server and its modules',
    builder(yargs: Argv): Argv {
        return yargs
            .check((args: Arguments<{ branch: string }>) => {
                if (!isBranchValid(args.branch))
                    throw new Error('Please provide a valid alt:V branch e.g release');
                return true;
            })
            .option('modules', {
                alias: 'm',
                describe: 'Specify modules to download',
                choices: [
                    'js',
                    'javascript',
                    'c#',
                    'cs',
                    'csharp',
                    'go',
                    'as',
                    'angelscript',
                    'py',
                    'python',
                    'voice',
                    'server'
                ],
                type: "array",
                default: ['server','js']
            })
            .positional('directory', {
                alias: [
                    'dir',
                    'd'
                ],
                describe: 'Set relative server path',
                type: "string",
                default: "./"
            })
            .option('others', {
               alias: 'o',
               describe: 'Generate server.cfg and on linux start.sh',
               type: "boolean",
               default: false
            });
    },
    async handler(args: Arguments<{ branch: string, modules: string[], directory: string, others: boolean }>): Promise<void> {
        let { branch, modules, directory, others } = args;
        const os = `${process.arch}_${process.platform}`;
        const moduleAliases = { 'js': 'js-module', 'py': 'python-module', 'c#': 'csharp-module', 'cs': 'csharp-module', 'as': 'angelscript-module', 'go': 'go-module' };

        modules = [...new Set(modules.map(m => Object.keys(moduleAliases).includes(m) ? moduleAliases[m] : m ))]

        if (modules.filter(m => !isModuleValid(m)).length > 0)
            throw new Error(`Please specify only valid modules e.g js-module`);

        if (isAbsolute(directory))
            directory = relative(directory, process.cwd());
        else
            directory = join(process.cwd(), directory);

        if (!exists(directory))
            await dirAsync(directory);

        // const modulesPath = join(directory, 'modules');
        // if (!exists(modulesPath))
        //   await dirAsync(modulesPath);

        // const config = getConfig();
        // config.modules = modules;
        // config.branch = branch;

        const voiceAndServer = modules.includes("server") && modules.includes("voice");

        if (voiceAndServer) {
            console.log(`${yellow('[WARN]')} Server and VoiceServer should not be installed into the same directory`);
            return;
        }

        // TODO check if voice install when server is already there. use .altvrc to check for current installations. add custom property to config for voicePath


        console.log(yellowBright(`Downloading alt:V Server branch ${branch} with modules: ${blueBright(modules.join(", "))} into directory: ${directory}`));

        const files = getFiles(branch, os);

        const moduleDownloadChain = modules.map(module => async () => {
            const spinner = ora(`Checking ${module}`);
            spinner.color = "yellow";
            spinner.start();

            const versionFile = files.find(f => f.type === module && f.name === "update.json");
            const up2date = versionFile !== undefined ? await checkVersion(versionFile, directory) : false;

            if (up2date) {
                spinner.color = 'green';
                spinner.text = `${blueBright(module)} is up to date`;
                spinner.succeed();
            } else {
                spinner.text = `${blueBright(module)} needs update`;
                spinner.succeed();

                const moduleFiles = files.filter(f => f.type === module);
                const isGithubHosted = moduleFiles[0].isGithubRelease === true;

                const [owner, repo, branch] = moduleFiles[0].url.split('/');
                const githubRelease = isGithubHosted ? await getRelease(owner, repo, branch) : null;

                if (typeof githubRelease === "string") {
                    console.log(`${red('[ERROR]')} ${githubRelease}`);
                    return false;
                }

                for (const file of moduleFiles) {
                    if (file.name == null) {
                        console.log(`${red('[ERROR]')} This file is not available for your current platform!`);
                        continue;
                    }

                    const fileDest = join(directory, file.folder, file.name);
                    const fileDestFolder = join(directory, file.folder);

                    const spinner = ora(`Downloading ${yellowBright(file.name)}`);
                    spinner.start();

                    if (isGithubHosted) {
                        file.url = getAssetUrl(githubRelease, file.name)
                        if (file.url == null) {
                            spinner.color = "red";
                            spinner.text = "Could not find file for current platform! Contact the module author.";
                            spinner.fail();
                            continue;
                        }
                    }

                    if (exists(fileDest))
                        await removeAsync(fileDest);

                    if (!exists(fileDestFolder))
                        await dirAsync(fileDestFolder);

                    const downloaded = await downloadFile(file.url, fileDest);
                    if (downloaded) {
                        spinner.text = `Downloaded ${yellowBright(file.name)}`;
                        spinner.succeed();
                    } else {
                        spinner.color = "red";
                        spinner.text = `Failed to download ${file.name}`;
                        spinner.fail();
                    }
                }

            }

            return true;
        });

        let promise = moduleDownloadChain[0]()
        for (let i = 1; i < moduleDownloadChain.length; i++)
            await promise.then(moduleDownloadChain[i])

        if (others) {
            generateServerConfig(directory, modules);
            if (os === "x64_linux")
                await generateStartScript(directory);
        }
    }
}

function isBranchValid(branch): boolean {
    if (typeof branch !== "string")
        return false
    return branch === "release" || branch === "rc" || branch === "dev"
}

function isModuleValid(module): boolean {
    if (typeof module !== "string")
        return false
    return module === "csharp-module" || module === "js-module" || module === "server" || module === "go-module" || module === "angelscript-module" || module === "python-module" || module === "voice"
}