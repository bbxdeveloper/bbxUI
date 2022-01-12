const { ipcRenderer } = require("electron");

// Listen for the event.
document.addEventListener(
  "print-pdf",
  function (e) {
    console.log(ipcRenderer);
    console.log("Sending PDF to Electron for printing...");
    console.log("Data: ", e.detail);
    ipcRenderer.send("print-pdf", e.detail);
    console.log("PDF sent to Electron.");
  },
  false
);
