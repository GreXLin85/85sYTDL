const { app, BrowserWindow, ipcMain } = require("electron")
const fs = require('fs');
const ytdl = require('ytdl-core');
let window

if (!fs.existsSync("Music")) {
    fs.mkdirSync("Music")
}

app.on("ready", () => {
    window = new BrowserWindow({ webPreferences: { nodeIntegration: true }, maximizable: false, minimizable: false, resizable: false })


    window.loadFile("./views/index.html")
})

ipcMain.on('link', (event, arg) => {
    ytdl.getInfo(arg).then(info => {
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
        let videoTitle = info.player_response.videoDetails.title
        videoTitle = videoTitle.replace(/\/|\\|:|\*|\?|\"|\<|\>|\|/g, '');
        let as = fs.createWriteStream("./Music/" + videoTitle + ".mp3")
        ytdl.downloadFromInfo(info, { filter: 'audioonly' }).pipe(as)
            .on("close", () => {
                event.reply('linkreply', 'ok')
            }).on("error", () => {
                event.reply('linkreply', 'error')
            }).on("drain", () => {
                event.reply('progress', as.bytesWritten)
            }).on("open", () => {
                event.reply("started", audioFormats[0].contentLength)
            })
    })
})
