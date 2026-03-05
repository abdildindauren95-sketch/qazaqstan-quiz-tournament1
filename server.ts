import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists and is valid JSON
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: [], questions: [] }));
} else {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    JSON.parse(content);
  } catch (e) {
    console.error('Data file corrupted, resetting...');
    fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: [], questions: [] }));
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all requests
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/data', (req, res) => {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: 'Failed to read data' });
    }
  });

  app.post('/api/data', (req, res) => {
    try {
      const { categories, questions } = req.body;
      const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      
      const newData = {
        categories: [...currentData.categories, ...(categories || [])],
        questions: [...currentData.questions, ...(questions || [])]
      };
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  app.put('/api/data', (req, res) => {
    try {
      const { categories, questions } = req.body;
      const newData = {
        categories: categories || [],
        questions: questions || []
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update data' });
    }
  });

  app.delete('/api/data', (req, res) => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: [], questions: [] }));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to reset data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
