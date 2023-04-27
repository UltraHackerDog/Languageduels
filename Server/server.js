require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const {Translate} = require('@google-cloud/translate').v2;

const app = express();
app.use(express.json());

const cors = require('cors');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const apiUrl = 'https://api-free.deepl.com/v2/translate';

app.post('/translate/deepl', async (req, res) => {
    const text = req.body.text;
    const targetLang = req.body.target;
    
    try {
        const response = await axios.post(apiUrl, {
            auth_key: DEEPL_API_KEY,
            text: text,
            target_lang: targetLang,
        });
        
        const translation = response.data.translations[0].text;
        
        res.json({ translation });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

const translate = new Translate({
    projectId: 'tidal-pathway-381014',
    keyFilename: '../google-cloud-creditials.json',
});

app.post('/translate/google', async (req, res) => {
    const text = req.body.text;
    const target = req.body.target;
    
    try {
        const [translation] = await translate.translate(text, target);
        res.json({ translation });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3001;
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

