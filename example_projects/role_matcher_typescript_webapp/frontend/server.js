const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Serve static files from the Next.js build directory
app.use(express.static(path.join(__dirname, 'out')));

// API proxy middleware - forward API requests to backend
app.use('/tasks', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `${BACKEND_URL}${req.url}`;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ success: false, error: 'Proxy error' });
  }
});

app.use('/analytics', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `${BACKEND_URL}${req.url}`;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ success: false, error: 'Proxy error' });
  }
});

app.use('/audit', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `${BACKEND_URL}${req.url}`;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ success: false, error: 'Proxy error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend server is running' });
});

// Serve Next.js pages - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`Proxying API requests to: ${BACKEND_URL}`);
});
