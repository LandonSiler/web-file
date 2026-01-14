import { statSync, readdirSync, readFileSync, existsSync, writeFileSync } from "fs";
import path from "path";

interface FileStore {
    ls(...opts: Parameters<typeof readdirSync> extends [any, ...infer X] ? X : never): string[];
    lsFiles(): string[];
    getFilePath(name: string): string;
    getFile(name: string): string;
    putFile(name: string, data: string): void;
    isFile(name: string): boolean;
    isDirectory(name: string): boolean;
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
    private _fullPathInternal(name: string): string {
        return path.join(this._storeFolder, name);
    }
    ls(...opts: Parameters<typeof readdirSync> extends [any, ...infer X] ? X : never): string[] {
        return readdirSync(this._storeFolder, ...opts).map(f => f.name.toString());
    }
    lsFiles(): string[] {
        return this.ls().filter(f => this.isFile(f));
    }
    getFilePath(name: string): string {
        return this._fullPathInternal(name);
    }
    getFile(name: string): string {
        return readFileSync(this._fullPathInternal(name), { encoding: 'utf-8' });
    }
    putFile(name: string, data: string): void {
        const target = this._fullPathInternal(name);
        if (existsSync(target)) {
            throw new Error(`File with name "${name}" already exists in store.`);
        }
        return writeFileSync(target, data, { encoding: 'utf-8' });
    }
    isFile(name: string): boolean {
        const target = this._fullPathInternal(name);
        return existsSync(target) && statSync(target).isFile();
    }
    isDirectory(name: string): boolean {
        const target = this._fullPathInternal(name);
        return existsSync(target) && statSync(target).isDirectory();
    }
}