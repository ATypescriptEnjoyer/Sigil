import { generateShell } from "../utlities";
import { LeagueDetails } from "./LeagueApiInterfaces";

const getLeaguePid = async (): Promise<number> => {
    const shell = generateShell();
    shell.addCommand("(Get-Process -Name:'LeagueClientUx').Id");
    try {
        return parseInt(await shell.invoke());
    }
    catch (err) {
        return 0;
    }
}

export const getLeagueDetails = async (): Promise<LeagueDetails> => {
    const pid = await getLeaguePid();
    if (pid === 0)
        return null;
    const shell = generateShell();
    shell.addCommand(`(Get-WmiObject Win32_Process -Filter "ProcessId = ${pid}" | Select-Object CommandLine).CommandLine`);
    try {
        const shellResponse = await shell.invoke();
        return shellResponse.split(`" "`).slice(1).reduce((prev, curr) => {
            const currSplit = curr.split("=");
            const k = currSplit[0].substr(2);
            return { ...prev, [k]: currSplit[1] };
        }, {} as LeagueDetails)
    }
    catch (err) {
        return null;
    }
}