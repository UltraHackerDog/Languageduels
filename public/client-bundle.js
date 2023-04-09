(() => {
  // src/main.js
  if (typeof process === "undefined") {
    window.process = {
      env: {
        DEEPL_API_KEY: "2b011319-68ff-9d1a-3a6d-28f56ce99862:fx",
        GOOGLE_API_KEY: "AIzaSyApkFSG3XvZyi2SXUQc3O32lbAXiCsQiCM"
      }
    };
  }
  var directoryPath = "../englishtexts";
  fetch(`${directoryPath}/filelist.json`).then((response) => response.json()).then((fileList) => {
    const directories = Object.keys(fileList);
    const texts = {};
    for (const directory of directories) {
      texts[directory] = Promise.all(fileList[directory].map((file) => fetch(`${directoryPath}/${directory}/${file}`).then((response) => response.text())));
    }
    Promise.all(Object.values(texts)).then((result) => {
      window.texts = {};
      for (let i = 0; i < result.length; i++) {
        const directory = directories[i];
        window.texts[directory] = result[i];
      }
    });
  });
  function englishTextGenerator() {
    document.getElementById("translate-text-field").style.display = "block";
    var englishlevel = document.getElementById("level-selector");
    var englishleveltext = englishlevel.options[englishlevel.selectedIndex].text;
    switch (englishleveltext) {
      case "A1":
        window.X = getRandomItem(window.texts["A1"]);
        break;
      case "A2":
        window.X = getRandomItem(window.texts["A2"]);
        break;
      case "B1":
        window.X = getRandomItem(window.texts["B1"]);
        break;
      case "B2":
        window.X = getRandomItem(window.texts["B2"]);
        break;
      case "C1":
        window.X = getRandomItem(window.texts["C1"]);
        break;
      default:
        return alert("Error");
    }
    console.log("Selected level: ", englishleveltext);
    console.log("Array for selected level: ", window.X);
    var level = window.X;
    var translatefield = document.getElementById("translate-text-field");
    translatefield.innerHTML = level;
    document.getElementById("start-button").style.display = "block";
  }
  function getRandomItem(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }
  function showTranslationField() {
    document.getElementById("label").style.display = "block";
    document.getElementById("translate-input-field").style.display = "block";
    document.getElementById("timer").style.display = "block";
    document.getElementById("submit").style.display = "block";
    const stopwatchDiv = document.getElementById("timer");
    const stopButton = document.getElementById("submit");
    let minutes = 0, seconds = 0;
    let stopwatchInterval;
    function updateStopwatch() {
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          alert("You took too long!");
          clearInterval(stopwatchInterval);
        }
      }
      stopwatchDiv.innerHTML = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    stopwatchInterval = setInterval(updateStopwatch, 1e3);
    stopButton.addEventListener("click", () => {
      clearInterval(stopwatchInterval);
    });
  }
  window.englishTextGenerator = englishTextGenerator;
  window.showTranslationField = showTranslationField;

  // src/comparetranslations.js
  var apiKeyDeepL = process.env.DEEPL_API_KEY;
  var apiKeyGoogle = process.env.GOOGLE_API_KEY;
  async function getDeepLTranslation(text) {
    const url = `http://localhost:3001/translate/deepl`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text
      })
    });
    console.log("DeepL request:", { url, ...requestOptions });
    const data = await response.json();
    if (data && data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    } else {
      throw new Error("Error in DeepL translation.");
    }
  }
  async function getGoogleTranslation(text) {
    const url = `http://localhost:3001/translate/google`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text
      })
    });
    console.log("Google request:", { url, ...requestOptions });
    const data = await response.json();
    if (data && data.translations && data.translations.length > 0) {
      return data.translations[0].translatedText;
    } else {
      throw new Error("Error in Google Cloud Translation.");
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
      console.log("Scoring function started");
      const deeplTranslation = await getDeepLTranslation(text, apiKeyDeepL);
      console.log("DeepL translation:", deeplTranslation);
      const googleTranslation = await getGoogleTranslation(text, apiKeyGoogle);
      console.log("Google translation:", googleTranslation);
      const model = await loadUSEModel();
      const embeddings = await getUSEEmbeddings([userTranslation, deeplTranslation, googleTranslation], model);
      const userEmbedding = embeddings.slice([0, 0], [1, -1]);
      const deeplEmbedding = embeddings.slice([1, 0], [1, -1]);
      const googleEmbedding = embeddings.slice([2, 0], [1, -1]);
      const deeplSimilarity = cosineSimilarity(userEmbedding, deeplEmbedding).dataSync()[0];
      const googleSimilarity = cosineSimilarity(userEmbedding, googleEmbedding).dataSync()[0];
      const averageSimilarity = (deeplSimilarity + googleSimilarity) / 2;
      const score2 = averageSimilarity * 100;
      return score2;
    } catch (error) {
      console.error("Error in scoring function:", error);
      return -1;
    }
  }
  async function compareTranslations() {
    const textField = document.getElementById("translate-text-field");
    const inputField = document.getElementById("translate-input-field");
    const originalText = textField.innerText;
    const userTranslation = inputField.value;
    const accuracyScore = await score(userTranslation, originalText);
    console.log(`Accuracy Score: ${accuracyScore.toFixed(2)} out of 100`);
  }
  window.compareTranslations = compareTranslations;
  window.score = score;
})();
