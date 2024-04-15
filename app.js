const audioContext = new AudioContext();
let oscillators = [];
let gainNodes = [];

// Set up event listeners for both input fields to handle the 'Enter' keypress
document
  .getElementById("ratioInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      startPlaying();
    }
  });

document
  .getElementById("baseFrequencyInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      startPlaying();
    }
  });

function startPlaying() {
  stopPlaying(); // Ensure to stop current playing tones

  const ratioInput = document.getElementById("ratioInput").value;
  const initialVolume = document.getElementById("volumeControl").value;
  const baseFrequency = Number(
    document.getElementById("baseFrequencyInput").value
  );
  const ratios = ratioInput.split(":").map(Number);

  if (ratios.length !== 2 || isNaN(ratios[0]) || isNaN(ratios[1])) {
    alert("Please enter a valid ratio, e.g., 3:2");
    return;
  }

  const frequencyOne = baseFrequency;
  const frequencyTwo = baseFrequency * (ratios[0] / ratios[1]);

  playTone(frequencyOne, initialVolume);
  playTone(frequencyTwo, initialVolume);
}

// Function to unlock audio context on iOS
function unlockAudioContext() {
  if (audioContext.state === "suspended") {
    var buffer = audioContext.createBuffer(1, 1, 22050);
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    // Play the empty buffer when the "unlock" button is pressed.
    if (typeof source.start === "undefined") {
      source.noteOn(0);
    } else {
      source.start(0);
    }

    // Setup a callback to check if the audio context is unlocked
    setTimeout(function () {
      if (audioContext.state === "running") {
        console.log("Playback unlocked!");
      }
    }, 0);
  }
}

// Add event listeners to the unlock button
document
  .getElementById("unlockButton")
  .addEventListener("touchstart", unlockAudioContext, false);
document
  .getElementById("unlockButton")
  .addEventListener("click", unlockAudioContext, false);

function playTone(freq, volume) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillators.push(oscillator);
  gainNodes.push(gainNode);
}

function stopPlaying() {
  oscillators.forEach((osc) => {
    osc.stop();
    osc.disconnect();
  });
  oscillators = [];
  gainNodes = [];
}

function updateVolume(volume) {
  gainNodes.forEach((gainNode) => {
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!audioContext) {
    alert("Web Audio API is not supported in this browser");
  }
});
