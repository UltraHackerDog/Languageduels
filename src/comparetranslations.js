const apiKeyDeepL = process.env.DEEPL_API_KEY;
const apiKeyGoogle = process.env.GOOGLE_API_KEY;

  
async function getDeepLTranslation(text) {
  const url = `http://localhost:3001/translate/deepl`;

  console.log('getDeepLTranslation: URL:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
    }),
  });
  
  console.log('DeepL request:', { url, ...requestOptions });


  const data = await response.json();

  if (data && data.translations && data.translations.length > 0) {
    return data.translations[0].text;
  } else {
    throw new Error('Error in DeepL translation.');
  }
}

async function getGoogleTranslation(text) {
  const url = `http://localhost:3001/translate/google`;

  console.log('getGoogleTranslation: URL:', url);


  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
    }),
  });
  console.log('Google request:', { url, ...requestOptions });


  const data = await response.json();

  if (data && data.translations && data.translations.length > 0) {
    return data.translations[0].translatedText;
  } else {
    throw new Error('Error in Google Cloud Translation.');
  }
}
    async function loadUSEModel() {
        const model = await use.load();
        return model;
      }
      
      async function getUSEEmbeddings(texts, model) {
        const embeddings = await model.embed(texts);
        return embeddings;
      }
      
      function cosineSimilarity(a, b) {
        const dotProduct = a.dot(b);
        const normA = a.norm();
        const normB = b.norm();
        return dotProduct.div(normA.mul(normB));
      }
      
      async function score(userTranslation, text) {
        try {
          console.log('Scoring function started');
      
          let deeplTranslation;
          try {
            deeplTranslation = await getDeepLTranslation(text, apiKeyDeepL);
            console.log('score: deeplTranslation:', deeplTranslation);
          } catch (deeplError) {
            console.error('Error in DeepL translation:', deeplError);
          }

          let googleTranslation;
          try {
            googleTranslation = await getGoogleTranslation(text, apiKeyGoogle);
            console.log('score: googleTranslation:', googleTranslation);
          } catch (googleError) {
            console.error('Error in Google Cloud Translation:', googleError);
          }

          // Check if both translations failed
          if (!deeplTranslation && !googleTranslation) {
            throw new Error('Both translation services failed.');
          }

          const model = await loadUSEModel();
          const embeddings = await getUSEEmbeddings([userTranslation, deeplTranslation, googleTranslation], model);
      
          const userEmbedding = embeddings.slice([0, 0], [1, -1]);
          const deeplEmbedding = embeddings.slice([1, 0], [1, -1]);
          const googleEmbedding = embeddings.slice([2, 0], [1, -1]);
      
          const deeplSimilarity = cosineSimilarity(userEmbedding, deeplEmbedding).dataSync()[0];
          const googleSimilarity = cosineSimilarity(userEmbedding, googleEmbedding).dataSync()[0];

          // Calculate the average similarity score
          const averageSimilarity = (deeplSimilarity + googleSimilarity) / 2;
          const score = averageSimilarity * 100;
      
          return score;
        } catch (error) {
          console.error('Error in scoring function:', error);
          return -1;
        }
      }
      
      async function compareTranslations() {
        const textField = document.getElementById("translate-text-field");
        const inputField = document.getElementById("translate-input-field");
        
        const originalText = textField.innerText;
        const userTranslation = inputField.value;
      
        
        console.log('compareTranslations: originalText:', originalText);
        console.log('compareTranslations: userTranslation:', userTranslation);

        const accuracyScore = await score(userTranslation, originalText);
      
        // Display the accuracy score
        console.log(`Accuracy Score: ${accuracyScore.toFixed(2)} out of 100`);
      }
      
      window.compareTranslations = compareTranslations;
      window.score = score;