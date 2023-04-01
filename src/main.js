if (typeof process === 'undefined') {
  window.process = {
    env: {
      DEEPL_API_KEY : "2b011319-68ff-9d1a-3a6d-28f56ce99862:fx",
      GOOGLE_API_KEY : "AIzaSyApkFSG3XvZyi2SXUQc3O32lbAXiCsQiCM"
    },
  };
}

const directoryPath = '../englishtexts';

fetch(`${directoryPath}/filelist.json`)
  .then(response => response.json())
  .then(fileList => {
    const directories = Object.keys(fileList);

    const texts = {};
    for (const directory of directories) {
      texts[directory] = Promise.all(fileList[directory].map(file => fetch(`${directoryPath}/${directory}/${file}`)
        .then(response => response.text())));
    }

    Promise.all(Object.values(texts)).then(result => {
      window.texts = {};
      for (let i = 0; i < result.length; i++) {
        const directory = directories[i];
        window.texts[directory] = result[i];
      }
    });
  });

function englishTextGenerator(){
    document.getElementById("translate-text-field").style.display="block";
    var englishlevel = document.getElementById("level-selector");
    var englishleveltext = englishlevel.options[englishlevel.selectedIndex].text;
    switch (englishleveltext){
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
    document.getElementById("start-button").style.display="block";
}

function getRandomItem(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

function showTranslationField(){
    document.getElementById("label").style.display="block";
    document.getElementById("translate-input-field").style.display="block";
    document.getElementById("timer").style.display="block";
    document.getElementById("submit").style.display="block";
  
    // Get the div element for the stopwatch and the button
    const stopwatchDiv = document.getElementById('timer');
    const stopButton = document.getElementById('submit');
  
    // Initialize the stopwatch variables
    let minutes = 0, seconds = 0;
    let stopwatchInterval;
  
    // Update the stopwatch every second
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
      stopwatchDiv.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    // Start the stopwatch interval
    stopwatchInterval = setInterval(updateStopwatch, 1000);
  
    // Stop the stopwatch when the button is pressed
    stopButton.addEventListener('click', () => {
      clearInterval(stopwatchInterval);
    });
}
window.englishTextGenerator = englishTextGenerator;
window.showTranslationField = showTranslationField;

