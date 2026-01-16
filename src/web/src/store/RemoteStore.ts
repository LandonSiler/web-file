import { fetchAsText, fetchJSON, fetchText } from "../util/Fetch";
import { getDirEnt } from "../util/Parser";
import { DirEnt, FileStore } from "./Store";

export class RemoteFileStore implements FileStore {
    constructor(private _endpoint: string) {
        if (!this._endpoint) {
            throw new Error('Endpoint must be provided for RemoteFileStore.');
        }
    }

    private _lsEndpoint(internalPath?: string): string {
        return internalPath
            ? `${this._endpoint}/api/files/${encodeURIComponent(internalPath)}`
            : `${this._endpoint}/api/files/`;
    }

    private _getFileContentEndpoint(internalPath: string): string {
        return `${this._endpoint}/api/file/${encodeURIComponent(internalPath)}`;
    }

    private _saveFileContentEndpoint(internalPath: string): string {
        return `${this._endpoint}/api/files/${encodeURIComponent(internalPath)}`;
    }

    async ls(internalPath?: string): Promise<DirEnt[]> {
        try {
            return getDirEnt(
                await fetchJSON(
                    this._lsEndpoint(internalPath)
                )
            );
        } catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }

    async getFileContent(internalPath: string): Promise<string> {
        return await fetchAsText(
            this._getFileContentEndpoint(internalPath)
        );
    }

    async saveFileContent(internalPath: string, data: ArrayBuffer): Promise<void> {
        const response = await fetch(
            this._saveFileContentEndpoint(internalPath),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                body: data
            });
        if (!response.ok) {
            throw new Error(`Failed to save file content: ${response.statusText}`);
        }
    }
}