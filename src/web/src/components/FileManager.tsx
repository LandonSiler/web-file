import { useEffect, useRef } from "preact/hooks";
import { DirEnt, FileStore } from "../store/Store";
import { Signal } from "@preact/signals";
import { Button, Card, CardContent, CardHeader, CardMedia, Grid, Paper } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import DriveFileMoveRtlIcon from '@mui/icons-material/DriveFileMoveRtl';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import './FileManager.css';

const currentPathSignal = new Signal<string>("");
const currentDirEntsSignal = new Signal<Array<DirEnt>>([]);

function formSizeString(bytes: number): string {
    if (bytes > 999999999) {
        return `${Math.round(bytes / 10000000) / 100}GB`
    } else if (bytes > 999999) {
        return `${Math.round(bytes / 10000) / 100}MB`
    } else if (bytes > 999) {
        return `${bytes / 100}KB`
    } else {
        return `${bytes}B`
    }
}

function changeDirectory(store: FileStore, newPath: string) {
    updateDirEnts(store, newPath);
}

function getDirectoryUp(current: string) {
    const pathParts = current.split('/');
    if (pathParts.length > 0) {
        pathParts.pop();
        const newPath = pathParts.join('/');
        console.log('Directory up to:', newPath);
        return newPath;
    }
    return current;
}

function updateDirEnts(store: FileStore, internalPath: string) {
    store.ls(internalPath).then(dirEnts => {
        currentPathSignal.value = internalPath;
        currentDirEntsSignal.value = dirEnts.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return b.isDirectory ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
        })
    });
}

function getFiles(): Promise<FileList> {
    const inputId = 'getFiles_Input';
    const existing = document.getElementById(inputId);
    if (existing) existing.remove();
    const input = document.createElement('input');
    input.id = inputId
    input.type = 'file';
    input.multiple = true;

    const ret = new Promise((res, rej) => {
        input.onchange = (e) => {
            res(e.target.files?.[0]);
            input.remove();
        };
    });

    input.click();
    return ret;
}

async function uploadFile(store: FileStore, curPath: string, file: File) {
    if (!(file instanceof File)) return;
    const name = file.name;
    const internalPath = `${curPath}${curPath.endsWith("/") ? '' : '/'}${name}`;
    store.saveFileContent(internalPath, await file.arrayBuffer())
}

export default function FileManager({ store }: { store: FileStore }) {
    const rootRef = useRef(null);
    useEffect(() => {
        updateDirEnts(store, currentPathSignal.value);
        new ResizeObserver(() => {
            const e = (document.body.clientWidth ?? 1000) / 1000;
            rootRef.current.style.setProperty('--widthOffset', 1 - (0.85 ** e))
        }).observe(rootRef.current);
    }, [])
    return (
        <Paper className={'fm_root'} ref={rootRef}>
            <div className={'fm_base'}>
                <div className={'fm_header'}>
                    <div className={'fm_meta'}>
                        <code>{currentPathSignal.value || "/"}</code>
                        <div className={'vertical_divider'} />
                        <div><code>{currentDirEntsSignal.value.length}</code><span> items</span></div>
                    </div>
                    <div className={'fm_control'}>
                        <Button color="inherit" variant="text" title={"upload"} onClick={async () => uploadFile(store, currentPathSignal.value, await getFiles())}><FileUploadIcon /></Button>
                        <Button color="inherit" variant="text" title="cdout" onClick={async () => changeDirectory(store, getDirectoryUp(currentPathSignal.value))}><DriveFileMoveRtlIcon /></Button>
                        <Button color="inherit" variant="text" title="refresh" onClick={async () => updateDirEnts(store, currentPathSignal.value)}><RefreshIcon /></Button>
                    </div>
                </div>
                <Grid container spacing={1} className={'fm_grid_content'}>
                    {currentDirEntsSignal.value.map((dirEnt) => (
                        <Grid key={dirEnt.internalPath} className={'fm_grid_item'} size={{ sm: 4, md: 3, lg: 2, xl: 2, xs: 7, }}>
                            <Button className={'fm_card_container'}>
                                <Card className={'fm_card'} onClick={() => {
                                    if (dirEnt.isDirectory) {
                                        changeDirectory(store, dirEnt.internalPath);
                                    } else {
                                        store.getFileContent(dirEnt.internalPath).then(content => {
                                            alert(`Content of ${dirEnt.name}:\n\n` + content);
                                        });
                                    }
                                }}>
                                    <div className={'fm_card_content'}>
                                        <div className={'fm_file_icon'}>
                                            {dirEnt.isDirectory ? <FolderIcon style={{ fontSize: '4rem' }} /> : <ArticleIcon style={{ fontSize: '4rem' }} />}
                                        </div>
                                        <div className={'fm_file_meta'} >
                                            {dirEnt.name}
                                            {!dirEnt.isDirectory && (
                                                <div className={'fm_file_size'}>
                                                    {formSizeString(dirEnt.size)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Button>
                        </Grid>
                    ))}
                </Grid>

            </div>
        </Paper>
    );
}