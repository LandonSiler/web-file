
/**
 * Interface representing a directory entry (file or folder).
 */
export interface DirEnt {
    name: string;
    isDirectory: boolean;
    internalPath: string;
    size: number;
}

/**
 * Interface for a file store.
 */
export interface FileStore {
    ls(internalPath?: string): Promise<DirEnt[]>;
    getFileContent(internalPath: string): Promise<string>;
    saveFileContent(internalPath: string, data: ArrayBuffer): Promise<void>;
}