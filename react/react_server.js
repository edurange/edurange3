import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// this is only used for serving built prod version
// for dev, npm run dev uses vite.config.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// handle other routes with index.html (react build)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 3663;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
