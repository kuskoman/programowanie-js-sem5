const app = document.querySelector("#app");

const keyToSoundMapping = {
  A: "boom",
  S: "clap",
  D: "hihat",
  F: "kick",
  G: "openhat",
  H: "ride",
  J: "snare",
  K: "tink",
  L: "tom",
};

const channels = [];

const playSound = (sound) => {
  const audio = new Audio(`./sounds/${sound}.wav`);
  audio.play();
};

const createChannel = () => {
  const channel = {
    id: channels.length + 1,
    recording: false,
    startTime: null,
    sounds: [],
    pauses: 0,
  };
  channels.push(channel);
  render();
};

const removeChannel = (id) => {
  const index = channels.findIndex((channel) => channel.id === id);
  channels.splice(index, 1);
  render();
};

const toggleRecording = (id) => {
  const channel = channels.find((channel) => channel.id === id);
  if (!channel.recording) {
    channel.startTime = Date.now();
    if (!channel.pauses) {
      channel.pauses = 0;
    } else {
      const accumulatedPause = Date.now() - channel.lastStop;
      channel.pauses += accumulatedPause;
    }
  } else {
    channel.lastStop = Date.now();
  }
  channel.recording = !channel.recording;
  render();
};

const replayChannel = (id) => {
  const channel = channels.find((channel) => channel.id === id);

  channel.sounds.forEach(({ sound, timestamp }) => {
    setTimeout(() => {
      playSound(sound);
    }, timestamp);
  });
};

const replayAllChannels = () => {
  channels.forEach((channel) => {
    channel.sounds.forEach(({ sound, timestamp }) => {
      setTimeout(() => {
        playSound(sound);
      }, timestamp);
    });
  });
};

const recordSound = (sound) => {
  const timestamp = Date.now();
  channels.forEach((channel) => {
    if (channel.recording) {
      const relativeTimestamp = timestamp - channel.startTime + channel.pauses;
      channel.sounds.push({ sound, timestamp: relativeTimestamp });
    }
  });
  render();
};

const createButton = (text, handler) => {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.addEventListener("click", handler);
  return btn;
};

const createSoundButton = (key, sound) => {
  const btn = document.createElement("button");
  btn.innerText = `${key} - ${sound}`;
  btn.addEventListener("click", () => {
    playSound(sound);
    recordSound(sound);
  });
  return btn;
};

const resetChannel = (id) => {
  const channel = channels.find((channel) => channel.id === id);
  channel.sounds = [];
  render();
};

const renderSoundKeys = () => {
  const soundKeysDiv = document.createElement("div");
  soundKeysDiv.classList.add("sound-keys");

  Object.entries(keyToSoundMapping).forEach(([key, sound]) => {
    const btn = createSoundButton(key, sound);
    soundKeysDiv.appendChild(btn);
  });

  app.appendChild(soundKeysDiv);
};

let looperInterval = null;

const getLongestDuration = () => {
  let longestDuration = 0;
  channels.forEach((channel) => {
    if (channel.lastStop && channel.startTime) {
      const duration = channel.lastStop - channel.startTime + channel.pauses;
      if (duration > longestDuration) {
        longestDuration = duration;
      }
    }
  });
  return longestDuration;
};

const toggleLooper = () => {
  if (looperInterval) {
    clearInterval(looperInterval);
    looperInterval = null;
  } else {
    replayAllChannels();
    looperInterval = setInterval(replayAllChannels, getLongestDuration());
  }
  render();
};

let metronomeInterval = null;

const playMetronome = (bpm) => {
  if (metronomeInterval) {
    clearInterval(metronomeInterval);
    metronomeInterval = null;
  }

  const millisecondsInMinute = 60000;
  const interval = millisecondsInMinute / bpm;
  metronomeInterval = setInterval(() => {
    playSound("tink");
  }, interval);
};

const stopMetronome = () => {
  if (metronomeInterval) {
    clearInterval(metronomeInterval);
    metronomeInterval = null;
  }
};

const handleMetronomeToggle = (input, button) => {
  if (metronomeInterval) {
    stopMetronome();
    button.innerText = "Start Metronome";
  } else {
    const bpm = parseInt(input.value, 10);
    if (bpm && bpm > 0) {
      playMetronome(bpm);
      button.innerText = "Stop Metronome";
    }
  }
};

const handleMetronomeInput = (input) => {
  if (metronomeInterval) {
    stopMetronome();
    const bpm = parseInt(input.value, 10);
    if (bpm && bpm > 0) {
      playMetronome(bpm);
    }
  }
};

const render = () => {
  app.innerHTML = "";
  renderSoundKeys();

  channels.forEach((channel) => {
    const channelDiv = document.createElement("div");
    channelDiv.classList.add("channel");

    const soundsDiv = document.createElement("div");
    soundsDiv.classList.add("sounds");

    channel.sounds.forEach(({ sound }) => {
      const soundDiv = document.createElement("div");
      soundDiv.innerText =
        Object.keys(keyToSoundMapping).find(
          (key) => keyToSoundMapping[key] === sound
        ) || sound;
      soundDiv.classList.add("sound");
      soundsDiv.appendChild(soundDiv);
    });

    channelDiv.appendChild(soundsDiv);

    const recordButton = createButton(channel.recording ? "■" : "⚫", () =>
      toggleRecording(channel.id)
    );
    if (channel.recording) {
      recordButton.setAttribute("active", "true");
    }
    channelDiv.appendChild(recordButton);
    channelDiv.appendChild(createButton("↺", () => replayChannel(channel.id)));
    channelDiv.appendChild(createButton("❌", () => removeChannel(channel.id)));
    channelDiv.appendChild(
      createButton("Reset", () => resetChannel(channel.id))
    );

    app.appendChild(channelDiv);
  });

  app.appendChild(createButton("Replay All", replayAllChannels));
  app.appendChild(createButton("Add Channel", createChannel));

  const looperButton = createButton(
    looperInterval ? "Stop Looping" : "Start Looping",
    toggleLooper
  );
  app.appendChild(looperButton);

  const metronomeDiv = document.createElement("div");
  metronomeDiv.classList.add("metronome");

  const bpmInput = document.createElement("input");
  bpmInput.setAttribute("type", "number");
  bpmInput.setAttribute("placeholder", "BPM");
  bpmInput.setAttribute("min", "40");
  bpmInput.setAttribute("max", "220");
  bpmInput.addEventListener("input", () => handleMetronomeInput(bpmInput));
  metronomeDiv.appendChild(bpmInput);

  const metronomeButton = createButton(
    metronomeInterval ? "Stop Metronome" : "Start Metronome",
    () => handleMetronomeToggle(bpmInput, metronomeButton)
  );
  metronomeDiv.appendChild(metronomeButton);

  app.appendChild(metronomeDiv);
};

document.addEventListener("keydown", (e) => {
  if (keyToSoundMapping[e.key.toUpperCase()]) {
    const sound = keyToSoundMapping[e.key.toUpperCase()];
    playSound(sound);
    recordSound(sound);
  }
});

render();
