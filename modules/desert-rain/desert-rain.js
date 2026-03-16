const words = Array.from(document.querySelectorAll(".word"));
const resetBtn = document.getElementById("resetBtn");

let revealIndex = 0;
let revealTimeout = null;
let hasStarted = false;

function clearRevealTimer() {
  if (revealTimeout) {
    clearTimeout(revealTimeout);
    revealTimeout = null;
  }
}

function setWordState(index, state) {
  const word = words[index];
  if (!word) return;

  word.classList.remove("visible", "fading");
  if (state) word.classList.add(state);
}

function resetWords() {
  clearRevealTimer();
  revealIndex = 0;
  hasStarted = false;

  words.forEach((word) => {
    word.classList.remove("visible", "fading");
  });
}

function revealNextWord() {
  if (revealIndex >= words.length) {
    clearRevealTimer();
    return;
  }

  if (revealIndex > 0) {
    setWordState(revealIndex - 1, "fading");
  }

  setWordState(revealIndex, "visible");
  revealIndex += 1;

  const nextDelay = 90 + Math.random() * 120;
  revealTimeout = window.setTimeout(revealNextWord, nextDelay);
}

function beginRain() {
  if (hasStarted) return;
  hasStarted = true;

  revealTimeout = window.setTimeout(revealNextWord, 240);
}

function handleGentleArrival() {
  beginRain();
}

function handleKeyArrival(event) {
  const allowedKeys = ["Tab", "ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", " "];
  if (allowedKeys.includes(event.key)) {
    beginRain();
  }
}

window.addEventListener("pointermove", handleGentleArrival, { once: true });
window.addEventListener("scroll", handleGentleArrival, { once: true });
window.addEventListener("keydown", handleKeyArrival, { once: true });

resetBtn.addEventListener("click", () => {
  resetWords();
});

resetWords();
