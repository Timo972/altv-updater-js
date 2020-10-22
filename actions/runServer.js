const spawn = require('child_process').spawn

function runServer(dir = "./") {
    return console.log('Running the server from the updater is currently not supported')
    console.log('Starting server ...')
    if (fs.existsSync(this.os === 'x64_win32' ? `${workingDir}\\altv - server.exe` : `${workingDir}start.sh`)) {
        const server = exec(this.os === 'x64_win32' ? `${workingDir}\\altv - server.exe` : `${workingDir}start.sh`, (error, stdout, stderr) => {
            if (error) console.error(error)
            if (stdout) console.log(stdout)
            if (stderr) console.log(stderr)
        })
        console.log(`Running Server with PID: ${server.pid} `)
        server.on('close', (code, signal) => process.exit(code))
        server.on('disconnect', () => process.exit(0))
        server.on('error', (err) => console.error(err))
        server.on('exit', (code, signal) => process.exit(code))
        server.on('message', (msg) => console.log(msg))
    }
    else {
        console.log('Cannot run server - if you are on linux you need to generate "others" with option --others')
        process.exit(0)
    }
}

module.exports = {
    runServer
}