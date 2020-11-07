import "./index.css";

const ipcRenderer = require('electron').ipcRenderer;

document.getElementById('importBtn').addEventListener('click', _ => {
    ipcRenderer.send('import-click');
});

document.getElementById('flashposf').addEventListener('change', _ => {
    ipcRenderer.send('flash-position-set', "F");
})

document.getElementById('flashposd').addEventListener('change', _ => {
    ipcRenderer.send('flash-position-set', "D");
})

ipcRenderer.on('flash-position-get', (evt, pos) => {
    if(pos === "F") {
        (<HTMLInputElement>document.getElementById('flashposf')).checked = true;
    }
    else {
        (<HTMLInputElement>document.getElementById('flashposd')).checked = true;
    }
});

ipcRenderer.on('button-state', (evt, state) => {
    const btn = document.getElementById('importBtn');
    if (state === "disabled") {
        btn.setAttribute("disabled", "disabled");
    }
    else {
        btn.removeAttribute("disabled");
    }
});

