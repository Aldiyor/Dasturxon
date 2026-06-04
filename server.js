require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/book', require('./api/book'));
app.get('/api/reservation/:ref', require('./api/getReservation'));
app.post('/api/cancel', require('./api/cancel'));

app.get('/bron', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bron.html')));
app.get('/bekor', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bekor.html')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
