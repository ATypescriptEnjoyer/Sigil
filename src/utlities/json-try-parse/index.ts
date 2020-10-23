export const tryParseJson = (value: string) => {
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
}