const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(cors({
    origin: '*'
  }));

const apiProxyTarget = process.env.REACT_APP_API_URL || 'http://localhost:5000';
app.use('/api', createProxyMiddleware({
  target: apiProxyTarget, 
  changeOrigin: true,
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
