const DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

let mode = "focus";
let timeLeft = DURATIONS.focus;
let isRunning = false;
let sessionCount = 0;
let intervalId = null;

const container = document.getElementById("container");
const modeLabel = document.getElementById("modeLabel");
const timerEl = document.getElementById("timer");
const btnStart = document.getElementById("btnStart");
const dots = [
  document.getElementById("dot0"),
  document.getElementById("dot1"),
  document.getElementById("dot2"),
  document.getElementById("dot3"),
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

function render() {
  timerEl.textContent = formatTime(timeLeft);
  btnStart.textContent = isRunning ? "Pause" : "Start";

  container.classList.remove("mode-short", "mode-long");
  if (mode === "short") {
    modeLabel.textContent = "SHORT BREAK";
    container.classList.add("mode-short");
  } else if (mode === "long") {
    modeLabel.textContent = "LONG BREAK";
    container.classList.add("mode-long");
  } else {
    modeLabel.textContent = "FOCUS";
  }

  dots.forEach((dot, i) => {
    dot.textContent = i < sessionCount ? "●" : "◌";
    dot.classList.toggle("active", i < sessionCount);
  });
}

function switchMode() {
  beep();
  if (mode === "focus") {
    sessionCount = (sessionCount + 1) % 5;
    mode = sessionCount === 0 ? "long" : "short";
  } else {
    mode = "focus";
  }
  timeLeft = DURATIONS[mode];
  isRunning = true;
  render();
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
  } else {
    clearInterval(intervalId);
    switchMode();
    intervalId = setInterval(tick, 1000);
  }
}

function toggleStartPause() {
  isRunning = !isRunning;
  if (isRunning) {
    intervalId = setInterval(tick, 1000);
  } else {
    clearInterval(intervalId);
  }
  render();
}

function reset() {
  clearInterval(intervalId);
  isRunning = false;
  timeLeft = DURATIONS[mode];
  render();
}

render();
