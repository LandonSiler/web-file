import { statSync, readdirSync, readFileSync, existsSync, writeFileSync, Dirent, Dir } from "fs";
import path from "path";

interface ExposableDirent {
    name: string;
    isDirectory: boolean;
    internalPath: string;
    size: number;
}

interface FileStore {
    ls(internalPath?: string): string[];
    lsF(internalPath: string): ExposableDirent[];
    getFilePath(internalPath: string): string;
    getFile(internalPath: string): string;
    putFile(internalPath: string, data: Buffer): void;
    isFile(internalPath: string): boolean;
    isDirectory(internalPath: string): boolean;
}

export class FSStore implements FileStore {
    constructor(private _storeFolder: string) {
        if (!this._storeFolder) {
            throw new Error('Base path must be provided for FSStore.');
        }
        if (statSync(this._storeFolder).isDirectory() === false) {
            throw new Error(`The provided base path: "${this._storeFolder}" is not a valid directory.`);
        }
    }
    private _fullPathInternal(subPath: string): string {
        const normalizedFileName = path.normalize(subPath).replace(/^(\.\.[\/\\])+/, '');
        if (normalizedFileName !== subPath || normalizedFileName.includes('..')) {
            throw new Error('Invalid file path.');
        }
        return path.join(this._storeFolder, subPath);
    }
    private _isFile(fullPath: string): boolean {
        return existsSync(fullPath) && statSync(fullPath).isFile();
    }
    private _isDirectory(fullPath: string): boolean {
        return existsSync(fullPath) && statSync(fullPath).isDirectory();
    }
    ls(internalPath?: string): string[] {
        return readdirSync(internalPath
            ? this._fullPathInternal(internalPath)
            : this._storeFolder
        );
    }
    lsF(internalPath: string): ExposableDirent[] {
        const target = this._fullPathInternal(internalPath);
        return readdirSync(target, { withFileTypes: true }).map(entry => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            internalPath: path.join(internalPath, entry.name),
            size: entry.isDirectory() ? 0 : statSync(path.join(target, entry.name)).size
        }));
    }
    getFilePath(internalPath: string): string {
        return this._fullPathInternal(internalPath);
    }
    getFile(internalPath: string): string {
        return readFileSync(this._fullPathInternal(internalPath), { encoding: 'utf-8' });
    }
    putFile(internalPath: string, data: Buffer): void {
        const target = this._fullPathInternal(internalPath);
        if (this._isFile(target)) {
            throw new Error(`File "${internalPath}" already exists in store.`);
        }
        return writeFileSync(target, data, { encoding: 'utf-8' });
    }
    isFile(internalPath: string): boolean {
        return this._isFile(this._fullPathInternal(internalPath));
    }
    isDirectory(internalPath: string): boolean {
        return this._isDirectory(this._fullPathInternal(internalPath));
    }
}