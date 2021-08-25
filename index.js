const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const ytdl = require("ytdl-core");
let window;

if (!fs.existsSync("Music")) {
  fs.mkdirSync("Music");
}

app.on("ready", () => {
  window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    maximizable: false,
    minimizable: false,
    resizable: false,
  });

  window.loadFile("./views/index.html");
});

ipcMain.on("links", async (event, arg) => {
  let links = arg.split("\n");
  let promises = [];
  for (let i = 0; i < links.length; i++) {
    promises.push(download(links[i], event));
  }
  let asd = await Promise.all(promises);
  event.reply("linkreply", "ok");
});

function download(link, event) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(link).then((info) => {
      let videoTitle = info.player_response.videoDetails.title;
      videoTitle = videoTitle.replace(/\/|\\|:|\*|\?|\"|\<|\>|\|/g, "");
      let as = fs.createWriteStream("./Music/" + videoTitle + ".mp3");
      ytdl
        .downloadFromInfo(info, { filter: "audioonly" })
        .pipe(as)
        .on("close", () => {
          event.reply("downloadcount", "increase");
          resolve("close");
        })
        .on("error", (err) => {
          reject(new Error(err));
        });
    });
  });
}
