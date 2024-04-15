const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let oscillators = [null, null]; // Initialize an array for two oscillators
let gainNodes = [null, null]; // Initialize an array for two gain nodes

// Utility function to update the frequency of the oscillators
function updateFrequencies() {
  const numerator = Number(
    document.getElementById("ratioNumeratorInput").value
  );
  const denominator = Number(
    document.getElementById("ratioDenominatorInput").value
  );
  const baseFrequency = Number(
    document.getElementById("baseFrequencyInput").value
  );

  // Check if the values are valid
  if (!isNaN(numerator) && !isNaN(denominator) && !isNaN(baseFrequency)) {
    // Calculate the frequencies based on the ratio
    const frequencyOne = baseFrequency;
    const frequencyTwo = baseFrequency * (numerator / denominator);

    // Update frequencies if oscillators are playing
    if (oscillators[0]) {
      oscillators[0].frequency.setValueAtTime(
        frequencyOne,
        audioContext.currentTime
      );
    }
    if (oscillators[1]) {
      oscillators[1].frequency.setValueAtTime(
        frequencyTwo,
        audioContext.currentTime
      );
    }
  }
}

// Update the volume for the gain nodes
function updateVolume() {
  const volume = document.getElementById("volumeControl").value;
  // Update gain nodes if they exist
  gainNodes.forEach((gainNode, index) => {
    if (gainNode) {
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      // Update the volume indicator text
      document.getElementById("volumeValue").textContent = `${Math.round(
        volume * 100
      )}%`;
    }
  });
}

// Attach the updateVolume function to the volume control
document
  .getElementById("volumeControl")
  .addEventListener("input", updateVolume);

// Play or update the tone based on current input values
function playOrUpdateTone(index) {
  const waveType = document.getElementById("waveTypeSelect").value;
  const volume = document.getElementById("volumeControl").value;

  // If the oscillator does not exist, create it and start playing
  if (!oscillators[index]) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = waveType;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    oscillator.start();

    oscillators[index] = oscillator;
    gainNodes[index] = gainNode;
  }

  // Update the wave type for the existing oscillator
  oscillators[index].type = waveType;
}

// Function to start or resume the audio context and play tones
function startPlaying() {
  // Resume the audio context if it is suspended
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Play or update tones for both oscillators
  playOrUpdateTone(0); // For the first oscillator
  playOrUpdateTone(1); // For the second oscillator

  // Now update the frequencies based on the current input values
  updateFrequencies();
}

// Stop playing the tones and disconnect the oscillators
function stopPlaying() {
  oscillators.forEach((oscillator, index) => {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillators[index] = null;
      gainNodes[index].disconnect();
      gainNodes[index] = null;
    }
  });
}

// Event listeners for ratio and frequency inputs to update tones
document
  .getElementById("ratioNumeratorInput")
  .addEventListener("input", updateFrequencies);
document
  .getElementById("ratioDenominatorInput")
  .addEventListener("input", updateFrequencies);
document
  .getElementById("baseFrequencyInput")
  .addEventListener("input", updateFrequencies);
document.getElementById("waveTypeSelect").addEventListener("change", () => {
  playOrUpdateTone(0); // Update the wave type for the first oscillator
  playOrUpdateTone(1); // Update the wave type for the second oscillator
  updateFrequencies(); // Then update the frequencies
});

// Function to initialize the app on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if the Web Audio API is supported
  if (!audioContext) {
    alert("Web Audio API is not supported in this browser");
  }
});
