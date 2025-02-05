import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.static('web'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});