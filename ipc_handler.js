try {
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
} catch (exp) {
  // If this error occurs, it's because the current build is not for Electron, therefore "require is not defined".
  if (!(exp instanceof ReferenceError)) {
    console.log(exp);
  }
}
