console.log("Script is loaded")

let utterance = null;
let isSpeaking = false;

(function init() {
  injectUI();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readAloud") {
      readText(request.text);
      console.log("Script is loaded")
    }
  });
})();

function injectUI() {
  fetch(chrome.runtime.getURL("ui.html"))
    .then(response => response.text())
    .then(html => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv.firstChild);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("ui.css");
      document.head.appendChild(link);

      setupControls();
    });
}

function setupControls() {
  const closeBtn = document.getElementById("readAloudCloseBtn");
  const playBtn = document.getElementById("readAloudPlayBtn");
  const pauseBtn = document.getElementById("readAloudPauseBtn");
  const stopBtn = document.getElementById("readAloudStopBtn");
  const rateRange = document.getElementById("rateRange");
  const volumeRange = document.getElementById("volumeRange");

  closeBtn.addEventListener("click", () => {
    const container = document.getElementById("readAloudContainer");
    container.style.display = "none";
  });

  // Play: If we have a current utterance, resume or speak
  playBtn.addEventListener("click", () => {
    if (!utterance) {
      // If no utterance is set, read any selected text
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        readText(selectedText);
      }
    } else {
      if (isSpeaking) {
        // If it's paused, resume
        speechSynthesis.resume();
      } else {
        // If it's a new utterance
        speechSynthesis.speak(utterance);
      }
    }
  });

  // Pause
  pauseBtn.addEventListener("click", () => {
    speechSynthesis.pause();
  });

  // Stop
  stopBtn.addEventListener("click", () => {
    speechSynthesis.cancel();
    utterance = null;
    isSpeaking = false;
  });

  // Update rate and volume on input changes
  rateRange.addEventListener("input", () => {
    if (utterance) {
      utterance.rate = parseFloat(rateRange.value);
    }
  });
  volumeRange.addEventListener("input", () => {
    if (utterance) {
      utterance.volume = parseFloat(volumeRange.value);
    }
  });
}

function readText(text) {
  // Cancel any ongoing speech
  speechSynthesis.cancel();

  // Create a new utterance
  utterance = new SpeechSynthesisUtterance(text);

  // Set initial rate and volume from the UI
  const rateRange = document.getElementById("rateRange");
  const volumeRange = document.getElementById("volumeRange");
  utterance.rate = parseFloat(rateRange.value);
  utterance.volume = parseFloat(volumeRange.value);

  utterance.onstart = () => {
    isSpeaking = true;
  };
  utterance.onend = () => {
    isSpeaking = false;
    utterance = null;
  };
  utterance.onerror = (e) => {
    console.error("SpeechSynthesisUtterance.onerror", e);
  };

  // Speak
  speechSynthesis.speak(utterance);
}
