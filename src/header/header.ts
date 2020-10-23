import "./header.css";

import { Titlebar, Color } from 'custom-electron-titlebar';
import icon from "../images/icon.ico";

window.addEventListener('DOMContentLoaded', () => {
    new Titlebar({
      backgroundColor: Color.fromHex('#0b0b23'),
      icon,
      menu: null,
    });
});


