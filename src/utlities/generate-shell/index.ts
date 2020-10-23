import Shell from "node-powershell";

export const generateShell = () => new Shell({ executionPolicy: "Bypass", noProfile: true });