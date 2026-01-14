import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { FSStore } from './store';

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;
const publicFolderPath = process.env.PUBLIC_FOLDER_PATH;

if (!publicFolderPath || !existsSync(publicFolderPath)) {
    throw new Error('PUBLIC_FOLDER_PATH environment variable is not set or does not represent a valid directory.');
}


console.log(`Server running in ${isDev ? 'development' : 'production'} mode.`);

const app = express();
const store = new FSStore(publicFolderPath);

app.use(express.static(publicFolderPath));
app.use(cors());
app.use(express.json());


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

app.post('/api/file', (req, res) => {
    const requestData = req.body;
    console.log('Received data:', requestData);
    res.json({ message: 'Data received successfully', receivedData: requestData });
});

app.get('/api/file/{:name}', (req, res) => {
    const fileName = req.params.name;
    if (!fileName) {
        res.status(400).json({ error: 'File name parameter is missing' });
        return;
    }
    const exists = store.isFile(fileName);
    if (!exists) {
        res.status(404).json({ error: `File with name: ${fileName} not found` });
        return;
    };
    res.sendFile(store.getFilePath(fileName));
});

app.get('/api/files', (req, res) => {
    const files = store.ls({ withFileTypes: true });
    res.json(files);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 