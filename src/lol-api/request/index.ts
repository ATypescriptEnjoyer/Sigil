import fetch from "electron-fetch";
import { ApiError } from "../LeagueApiInterfaces";
import log from "electron-log";

export default async (
  hostname: string,
  port: number,
  auth: string,
  endpoint: string,
  method = "GET",
  payload: string = null
): Promise<{ response?: never | null; error?: ApiError }> => {
  let headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`riot:${auth}`).toString("base64")}`,
  };
  if (payload) {
    headers = { ...headers, ["Content-Type"]: "application/json" };
  }
  try {
    const reqEndpoint = `https://${hostname}:${port}${
      endpoint.startsWith("/") ? "" : "/"
    }${endpoint}`;
    log.info(`Hitting API at: ${reqEndpoint}`);
    const data = await fetch(reqEndpoint, {
      headers,
      method,
      body: payload,
    }).then((val) => val.json());
    if (data.errorCode) {
      log.error(data);
      return { response: null, error: data };
    }
    return { response: data, error: null };
  } catch (error) {
    log.error(error);
    return { response: null, error };
  }
};
