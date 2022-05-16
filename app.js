const { app, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");
const { ipcMain } = require("electron");
const fs = require("fs");
const { print } = require("pdf-to-printer");

let mainWindow;

ipcMain.on("print-pdf", (event, arg) => {
  // Filename and path for temp.pdf
  const reportName = `${Date.now()}${Math.random()}.pdf`;
  const reportsDirPath =
    process.platform === "darwin"
      ? `${app.getPath("home")}/Library/Logs/BBX/Reports`
      : `${app.getPath("home")}/AppData/Roaming/BBX/Reports`;
  const reportsFilePath = `${reportsDirPath}/${reportName}`;

  // Local function for deleting temp pdf
  function clean() {
    // Check temp file after printing
    fs.access(reportsFilePath, fs.constants.F_OK, (err) => {
      if (!!err) {
        console.log(err);
      } else {
        // Delete temp file
        fs.unlink(reportsFilePath, (err) => {
          console.log(err);
        });
      }
    });
  }

  // Local function for saving pdf and sending to printer
  function saveThenPrint() {
    // Save as temp.pdf
    fs.writeFile(reportsFilePath, arg.buffer, "binary", (err) => {
      console.log(reportName, err);

      // Silent print PDF with default printer
      print(reportsFilePath, { copies: parseInt(arg.copies ?? 1) }).then(
        (res) => {
          console.log(res);
          clean();
        },
        (rej) => {
          console.log(rej);
          clean();
        }
      );
    });
  }

  // Check if "Reports" dir exists
  fs.access(reportsDirPath, fs.constants.F_OK, (err) => {
    if (!!err) {
      // Creating dir
      fs.mkdir(reportsDirPath, (err) => {
        // Dir cannot be created
        if (!!err) {
          console.log(err);
        } else {
          saveThenPrint();
        }
      });
    } else {
      saveThenPrint();
    }
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      webviewTag: true,
      plugins: true,
      preload: path.join(app.getAppPath(), "ipc_handler.js"),
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "/dist/bbx-ui/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Open the devtools
  // mainWindow.webContents.openDevTools();

  mainWindow.once("ready-to-show", () => {
    mainWindow.setMinimumSize(1366, 768);
    mainWindow.maximize();
  });

  mainWindow.webContents.on("frame-created", (event, details) => {
    console.log("===================");
    console.log(event);
    console.log(details);
    console.log("===================");
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});
