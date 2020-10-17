import fetch from 'electron-fetch'
import { ApiError } from '../LeagueApiInterfaces';

export default async (hostname: string, port: number, auth: string, endpoint: string, method: string = "GET", payload: string = null): Promise<{ response?: any, error?: ApiError }> => {
    let headers: HeadersInit = {
        "Accept": "application/json",
        "Authorization": `Basic ${Buffer.from(`riot:${auth}`).toString("base64")}`
    };
    if (payload) {
        headers = { ...headers, ["Content-Type"]: "application/json" };
    }
    try {
        const data = await fetch(`https://${hostname}:${port}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`, {
            headers,
            method,
            body: payload
        }).then(val => val.json());
        if (data.errorCode) {
            return { response: null, error: data };
        }
        return { response: data, error: null };
    }
    catch (error) {
        return { response: null, error }
    }
}