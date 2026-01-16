import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { FSStore } from './store';
import { whenError } from './util';

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;
const publicFolderPath = process.env.PUBLIC_FOLDER_PATH;

if (!publicFolderPath || !existsSync(publicFolderPath)) {
    throw new Error('PUBLIC_FOLDER_PATH environment variable is not set or does not represent a valid directory.');
}


console.log(`Server running in ${isDev ? 'development' : 'production'} mode.`);

const app = express();
const store = new FSStore(publicFolderPath);

app.use(cors());
app.use(express.json({ limit: '1000mb' }));
app.use(express.raw({
    limit: '1000mb',
    type: '*/*'
}));
app.use('/api/file', express.static(publicFolderPath));


if (!isDev) {
    const webEntryFile = process.env.WEB_ENTRY_FILE;
    if (!webEntryFile) {
        throw new Error('WEB_ENTRY_FILE environment variable is not set.');
    }
    app.get('/', (req, res) => {
        if (!existsSync(webEntryFile)) {
            res.send('Unable to process request. File not found.')
            return;
        };
        res.sendFile(webEntryFile);
    });
} else {
    app.get('/', (req, res) => {
        res.redirect('http://localhost:5173');
    });
}

app.post('/api/files/{*internalPath}', (req, res) => {
    const internalPath = req.params.internalPath;
    whenError(() => {
        const data = req.body;
        store.putFile(internalPath.join('/'), data);
        res.json({ success: true });
    }, (err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to save file', details: "Reference console if server admin." });
    });
});

app.get('/api/files/{*internalPath}', (req, res) => {
    const internalPath = req.params.internalPath;
    whenError(() => {
        const files = store.lsF(internalPath ? internalPath.join('/') : '/');
        res.json(files);
    }, (err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to list files', details: "Likely not a valid directory." });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 