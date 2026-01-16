/**
 * Checks if response has expected content type.
 * @param response The response to check.
 * @param expectedContentType The expected content type.
 */
export function responseHasContentType(response: Response, expectedContentType: string): boolean {
    if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('Content-Type');
    return contentType !== null && contentType.includes(expectedContentType);
}

/**
 * Gets JSON from response, validating status and content type.
 * @param response The response to parse.
 */
export function getResponseJson(response: Response): Promise<any> {
    if (!responseHasContentType(response, 'application/json')) {
        throw new Error('Response is not JSON.');
    }
    return response.json();
}

/**
 * Gets plain text from response, validating status and content type.
 * @param response The response to parse.
 */
export function getResponseText(response: Response): Promise<string> {
    if (!responseHasContentType(response, 'text/plain')) {
        throw new Error('Response is not plain text.');
    }
    return response.text();
}

/**
 * Gets response as plain text without content type validation.
 * @param response The response to parse.
 */
export function getResponseAsText(response: Response): Promise<string> {
    return response.text();
}