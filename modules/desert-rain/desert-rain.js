const words = Array.from(document.querySelectorAll(".word"));
const resetBtn = document.getElementById("resetBtn");
const replayBtn = document.getElementById("replayBtn");
const demoSurface = document.getElementById("demoSurface");
const textField = document.getElementById("textField");
const rainOverlay = document.getElementById("rainOverlay");
const cadenceSelect = document.getElementById("cadence");
const clusterInput = document.getElementById("cluster");
const proximityInput = document.getElementById("proximity");
const readingShapeInput = document.getElementById("readingShape");
const letterSpaceInput = document.getElementById("letterSpace");
const reducedMotionToggle = document.getElementById("reducedMotionToggle");
const highContrastToggle = document.getElementById("highContrastToggle");
const reduceShimmerToggle = document.getElementById("reduceShimmerToggle");
const statusText = document.getElementById("statusText");

let revealIndex = 0;
let revealTimeout = null;
let rainInterval = null;
let hasStarted = false;
let proximityFrame = null;

const cadenceMap = {
  slow: [180, 300],
  medium: [95, 180],
  fast: [55, 110]
};

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isReducedMotionMode() {
  return prefersReducedMotion() || reducedMotionToggle.checked;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clearRevealTimer() {
  if (revealTimeout) {
    clearTimeout(revealTimeout);
    revealTimeout = null;
  }
}

function clearRainInterval() {
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
  }
}

function getCadenceDelay() {
  const value = cadenceSelect.value in cadenceMap ? cadenceSelect.value : "medium";
  const [min, max] = cadenceMap[value];
  if (isReducedMotionMode()) return 40;
  return Math.round(randomBetween(min, max));
}

function getClusterSize() {
  return Number(clusterInput.value);
}

function applyReadingShape(level) {
  const root = document.documentElement;

  switch (Number(level)) {
    case 0:
      root.style.setProperty("--reader-letter-space", "0em");
      root.style.setProperty("--reader-word-space", "0em");
      root.style.setProperty("--reader-font-weight", "400");
      root.style.setProperty("--reader-line-height", "1.95");
      root.style.setProperty("--reader-scale", "1");
      break;
    case 1:
      root.style.setProperty("--reader-letter-space", "0.02em");
      root.style.setProperty("--reader-word-space", "0.04em");
      root.style.setProperty("--reader-font-weight", "450");
      root.style.setProperty("--reader-line-height", "2.02");
      root.style.setProperty("--reader-scale", "1");
      break;
    case 2:
      root.style.setProperty("--reader-letter-space", "0.05em");
      root.style.setProperty("--reader-word-space", "0.08em");
      root.style.setProperty("--reader-font-weight", "500");
      root.style.setProperty("--reader-line-height", "2.1");
      root.style.setProperty("--reader-scale", "0.98");
      break;
    case 3:
      root.style.setProperty("--reader-letter-space", "0.08em");
      root.style.setProperty("--reader-word-space", "0.12em");
      root.style.setProperty("--reader-font-weight", "550");
      root.style.setProperty("--reader-line-height", "2.18");
      root.style.setProperty("--reader-scale", "0.96");
      break;
    default:
      break;
  }
}

function applyLetterSpacing(level) {
  const values = ["0em", "0.01em", "0.03em", "0.05em", "0.08em"];
  document.documentElement.style.setProperty(
    "--reader-letter-space",
    values[Number(level)] || "0em"
  );
}

function applyVisualModes() {
  demoSurface.classList.toggle("reduce-shimmer", reduceShimmerToggle.checked || isReducedMotionMode());
  textField.classList.toggle("high-contrast", highContrastToggle.checked);
}

function resetWords() {
  clearRevealTimer();
  clearRainInterval();
  revealIndex = 0;
  hasStarted = false;
  rainOverlay.innerHTML = "";

  words.forEach((word) => {
    word.classList.remove("near", "visible", "fading", "locked");
  });

  applyVisualModes();
  setStatus("Rain reset.");
}

function spawnRainDrops(clusterSize = 1) {
  if (isReducedMotionMode()) return;

  const surfaceRect = demoSurface.getBoundingClientRect();

  for (let i = 0; i < clusterSize; i += 1) {
    const drop = document.createElement("span");
    drop.className = "drop";
    drop.style.left = `${Math.random() * surfaceRect.width}px`;
    drop.style.height = `${randomBetween(28, 64)}px`;
    drop.style.animationDuration = `${randomBetween(900, 1800)}ms`;
    drop.style.animationDelay = `${randomBetween(0, 180)}ms`;
    rainOverlay.appendChild(drop);

    window.setTimeout(() => {
      drop.remove();
    }, 2200);
  }
}

function lockVisibleWords() {
  words.forEach((word, index) => {
    if (index < revealIndex) {
      word.classList.remove("near", "fading", "visible");
      word.classList.add("locked");
    }
  });
}

function revealCluster() {
  if (revealIndex >= words.length) {
    clearRevealTimer();
    clearRainInterval();
    lockVisibleWords();
    setStatus("All words revealed.");
    return;
  }

  const clusterSize = Math.max(1, getClusterSize());

  for (let i = 0; i < clusterSize && revealIndex < words.length; i += 1) {
    if (revealIndex > 0) {
      const previous = words[revealIndex - 1];
      if (previous && !previous.classList.contains("locked")) {
        previous.classList.remove("visible", "near");
        previous.classList.add("fading");
      }
    }

    const current = words[revealIndex];
    current.classList.remove("near", "fading", "locked");
    current.classList.add("visible");
    revealIndex += 1;
  }

  spawnRainDrops(clusterSize + 1);
  revealTimeout = window.setTimeout(revealCluster, getCadenceDelay());
}

function beginRain() {
  if (hasStarted) return;
  hasStarted = true;

  setStatus("Rain sequence started.");
  revealTimeout = window.setTimeout(revealCluster, isReducedMotionMode() ? 20 : 180);

  if (!isReducedMotionMode()) {
    clearRainInterval();
    rainInterval = window.setInterval(() => {
      spawnRainDrops(Math.max(1, Math.floor(getClusterSize() / 2)));
    }, 700);
  }
}

function replayRain() {
  resetWords();
  beginRain();
}

function revealAllImmediately() {
  clearRevealTimer();
  clearRainInterval();
  revealIndex = words.length;

  words.forEach((word) => {
    word.classList.remove("near", "fading", "visible");
    word.classList.add("locked");
  });

  setStatus("All words revealed immediately.");
}

function pointerToSurfacePosition(clientX, clientY) {
  const rect = demoSurface.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
    rect
  };
}

function updateProximity(clientX, clientY) {
  const { x, y, rect } = pointerToSurfacePosition(clientX, clientY);
  const radius = Number(proximityInput.value);

  const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

  if (!inside) {
    words.forEach((word, index) => {
      if (index >= revealIndex) word.classList.remove("near");
    });
    return;
  }

  const surfaceRect = demoSurface.getBoundingClientRect();

  words.forEach((word, index) => {
    if (index < revealIndex) return;

    const wordRect = word.getBoundingClientRect();
    const centerX = wordRect.left - surfaceRect.left + wordRect.width / 2;
    const centerY = wordRect.top - surfaceRect.top + wordRect.height / 2;
    const distance = Math.hypot(centerX - x, centerY - y);

    if (distance < radius) {
      word.classList.add("near");
    } else {
      word.classList.remove("near");
    }
  });
}

function requestProximityUpdate(clientX, clientY) {
  if (proximityFrame) cancelAnimationFrame(proximityFrame);
  proximityFrame = requestAnimationFrame(() => {
    updateProximity(clientX, clientY);
  });
}

function handleGentleArrival() {
  beginRain();
}

function handlePointerMove(event) {
  handleGentleArrival();
  requestProximityUpdate(event.clientX, event.clientY);
}

function handleTouch(event) {
  handleGentleArrival();

  const touch = event.touches[0];
  if (!touch) return;

  requestProximityUpdate(touch.clientX, touch.clientY);
}

function handlePointerLeave() {
  words.forEach((word, index) => {
    if (index >= revealIndex) word.classList.remove("near");
  });
}

function handleKeyArrival(event) {
  const allowedKeys = ["Tab", "ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", " ", "Enter"];
  if (allowedKeys.includes(event.key)) beginRain();
  if (event.key === "Home") resetWords();
  if (event.key === "End") revealAllImmediately();
}

window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("scroll", handleGentleArrival, { passive: true });
window.addEventListener("keydown", handleKeyArrival);

demoSurface.addEventListener("touchstart", handleTouch, { passive: true });
demoSurface.addEventListener("touchmove", handleTouch, { passive: true });
demoSurface.addEventListener("pointerleave", handlePointerLeave);
demoSurface.addEventListener("focus", beginRain);

resetBtn.addEventListener("click", resetWords);
replayBtn.addEventListener("click", replayRain);

cadenceSelect.addEventListener("change", () => {
  setStatus(`Cadence set to ${cadenceSelect.value}.`);
});

clusterInput.addEventListener("input", () => {
  setStatus(`Rainfall clustering set to ${clusterInput.value}.`);
});

proximityInput.addEventListener("input", () => {
  setStatus(`Proximity sensitivity set to ${proximityInput.value}.`);
});

readingShapeInput.addEventListener("input", () => {
  applyReadingShape(readingShapeInput.value);
  setStatus(`Reading shape set to ${readingShapeInput.value}.`);
});

letterSpaceInput.addEventListener("input", () => {
  applyLetterSpacing(letterSpaceInput.value);
  setStatus(`Letter spacing adjusted.`);
});

reducedMotionToggle.addEventListener("change", () => {
  applyVisualModes();
  if (isReducedMotionMode()) clearRainInterval();
  setStatus(`Reduced motion ${reducedMotionToggle.checked ? "enabled" : "disabled"}.`);
});

highContrastToggle.addEventListener("change", () => {
  applyVisualModes();
  setStatus(`Higher contrast ${highContrastToggle.checked ? "enabled" : "disabled"}.`);
});

reduceShimmerToggle.addEventListener("change", () => {
  applyVisualModes();
  setStatus(`Shimmer ${reduceShimmerToggle.checked ? "reduced" : "restored"}.`);
});

applyReadingShape(readingShapeInput.value);
applyLetterSpacing(letterSpaceInput.value);
applyVisualModes();
resetWords();
