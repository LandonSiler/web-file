import { getResponseAsText, getResponseJson, getResponseText } from "./Response";

/**
 * Fetches JSON from the given input.
 * @param input Parameters for the fetch function.
 */
export async function fetchJSON(...input: Parameters<typeof fetch>): Promise<any> {
    return await getResponseJson(await fetch(...input))
}

/**
 * Fetches plain text from the given input.
 * @param input Parameters for the fetch function.
 */
export async function fetchText(...input: Parameters<typeof fetch>): Promise<string> {
    return await getResponseText(await fetch(...input));
}

/**
 * Fetches response as plain text without content type validation.
 * @param input Parameters for the fetch function.
 */
export async function fetchAsText(...input: Parameters<typeof fetch>): Promise<string> {
    return await getResponseAsText(await fetch(...input));
}