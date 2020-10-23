import "./index.css";

const ipcRenderer = require('electron').ipcRenderer;

document.getElementById('importBtn').addEventListener('click', _ => {
    ipcRenderer.send('import-click');
});

ipcRenderer.on('button-state', (evt, state) => {
    console.log(state);
    const btn = document.getElementById('importBtn');
    if (state === "disabled") {
        btn.setAttribute("disabled", "disabled");
    }
    else {
        btn.removeAttribute("disabled");
    }
});

