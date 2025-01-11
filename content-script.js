let utterance = null;
let isSpeaking = false;
let uiInjected = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readAloud") {
    readText(request.text);
  } else if (request.action === "toggleUI") {
    toggleUI();
  }
});

function toggleUI() {
  const container = document.getElementById("readAloudContainer");

  if (!uiInjected || !container) {
    injectUI();
    uiInjected = true;
  } else {
    if (container.style.display === "none" || container.style.display === "") {
      container.style.display = "block";
    } else {
      container.style.display = "none";
    }
  }
}

function injectUI() {
  fetch(chrome.runtime.getURL("ui.html"))
    .then((response) => response.text())
    .then((html) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv.firstChild);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("ui.css");
      document.head.appendChild(link);

      setupControls();
    })
    .catch((err) => console.error("Error injecting UI:", err));
}

function setupControls() {
  const closeBtn = document.getElementById("readAloudCloseBtn");
  const playBtn = document.getElementById("readAloudPlayBtn");
  const pauseBtn = document.getElementById("readAloudPauseBtn");
  const stopBtn = document.getElementById("readAloudStopBtn");
  const rateRange = document.getElementById("rateRange");
  const volumeRange = document.getElementById("volumeRange");
  const rateValueLabel = document.getElementById("rateValueLabel");
  const volumeValueLabel = document.getElementById("volumeValueLabel");

  closeBtn.addEventListener("click", () => {
    const container = document.getElementById("readAloudContainer");
    container.style.display = "none";
  });

  playBtn.addEventListener("click", () => {
    if (!utterance) {
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        readText(selectedText);
      }
    } else {
      if (isSpeaking) {
        speechSynthesis.resume();
      } else {
        speechSynthesis.speak(utterance);
      }
    }
  });

  pauseBtn.addEventListener("click", () => {
    speechSynthesis.pause();
  });

  stopBtn.addEventListener("click", () => {
    speechSynthesis.cancel();
    utterance = null;
    isSpeaking = false;
  });

  rateRange.addEventListener("input", () => {
    if (utterance) {
      utterance.rate = parseFloat(rateRange.value);
    }
    rateValueLabel.textContent = rateRange.value;
  });
  volumeRange.addEventListener("input", () => {
    if (utterance) {
      utterance.volume = parseFloat(volumeRange.value) / 100;
    }
    volumeValueLabel.textContent = volumeRange.value;
  });
}

function readText(text) {
  speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(text);

  const rateRange = document.getElementById("rateRange");
  const volumeRange = document.getElementById("volumeRange");
  if (rateRange) utterance.rate = parseFloat(rateRange.value);
  if (volumeRange) utterance.volume = parseFloat(volumeRange.value);

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

  speechSynthesis.speak(utterance);
}
