require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');
const helmet = require('helmet');

const app = express();
app.use(express.json());

const cors = require('cors');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.post('/translate/deepl', async (req, res) => {
  const { text } = req.body;
  const apiKey = DEEPL_API_KEY;

  try {
    const response = await axios.post(
      `https://api-free.deepl.com/v2/translate?auth_key=${DEEPL_API_KEY}&text=${encodeURIComponent(text)}&target_lang=${targetLanguage}`,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/translate/google', async (req, res) => {
  const { text } = req.body;
  const apiKey = GOOGLE_API_KEY;

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        q: text,
        target: 'en',
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });

  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'localhost', 'http:'],
        imgSrc: ["'self'", 'localhost', 'http:', 'data:'],
        scriptSrc: ["'self'", 'localhost', 'http:', "'unsafe-inline'"],
        styleSrc: ["'self'", 'localhost', 'http:', "'unsafe-inline'"],
      },
    })
  );
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static('public'));

  app.use('/englishtexts', express.static(path.join(__dirname, 'englishtexts')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

