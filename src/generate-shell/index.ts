import Shell from "node-powershell";

export default () => new Shell({ executionPolicy: "Bypass", noProfile: true });