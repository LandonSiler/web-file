import { DirEnt } from "../store/Store";


/**
 * Gets directory entries from input (often fetched JSON).
 * @param input The input to validate and parse.
 */
export function getDirEnt(input: any): DirEnt[] {
    if (!Array.isArray(input)) {
        throw new Error('Invalid input: expected an array.');
    }
    if (input.length === 0) return [];
    const validEntries: DirEnt[] = [];
    for (const entry of input) {
        if (
            typeof entry.name === 'string' &&
            typeof entry.isDirectory === 'boolean' &&
            typeof entry.internalPath === 'string' &&
            typeof entry.size === 'number'
        ) {
            validEntries.push(entry);
        }
    }
    return validEntries;
}