// script.js
"use strict";
(() => {
  // ——————————————————————————————————————————————————————————
  // 1. DOM refs
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    xpDisplay: document.getElementById("xp-display"),
    streakDisplay: document.getElementById("streak-display"),
    badgesList: document.getElementById("badges-list"),
    submitBtn: document.getElementById("submit-btn"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    hintBtn: document.getElementById("hint-btn"),
    clearBtn: document.getElementById("clear-btn"),
    learnBtn: document.getElementById("learn-btn"),
    levelSelect: document.getElementById("level-select"),
    timerToggle: document.getElementById("timer-mode"),
    listenBtn: document.getElementById("listen-instructions-btn"),
    fullscreenBtn: document.getElementById("fullscreen-btn"),
    themeBtn: document.getElementById("theme-toggle"),
    resetBtn: document.getElementById("reset-btn"),
    successSound: document.getElementById("success-sound"),
    errorSound: document.getElementById("error-sound"),
    hintText: document.getElementById("hint"),
    successMessage: document.getElementById("success-message"),
  };

  // ——————————————————————————————————————————————————————————
  // 2. Game state
  const sessionLength = 10;
  let puzzles = [];
  let currentPuzzleIndex = 0;
  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;
  let badges = JSON.parse(localStorage.getItem("badges")) || [];
  let currentLevel = localStorage.getItem("currentLevel") || "p3";
  let timerId = null;
  let hintCount = 0;

  // ——————————————————————————————————————————————————————————
  // 3. Sentence pools
  const sentencesP1 = [
    "Doreen had a huge birthday party.",
    "We can go out to play.",
    "The boy was chased by a dog.",
    "Would you like to have lunch now?",
    "I love to draw colorful pictures.",
    // …and so on up to 24…
  ];
  const sentencesP2 = sentencesP1, sentencesP3 = sentencesP1;
  const sentencesP4 = sentencesP1, sentencesP5 = sentencesP1;
  const sentencesP6 = sentencesP1;

  // ——————————————————————————————————————————————————————————
  // 4. Helpers
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  const saveState = () => {
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badges", JSON.stringify(badges));
    localStorage.setItem("currentLevel", currentLevel);
  };

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find(v => v.lang === "en-GB") || voices[0];
    u.rate = 0.9; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }

  // ——————————————————————————————————————————————————————————
  // 5. Progress bar & ARIA
  function updateProgressUI() {
    const current = currentPuzzleIndex + 1;
    const pct = Math.round((current / sessionLength) * 100);
    elements.progressBarFill.style.width = `${pct}%`;
    const bar = document.getElementById("progress-bar-container");
    bar.setAttribute("aria-valuenow", current);
    bar.setAttribute("aria-valuemax", sessionLength);
  }

  // ——————————————————————————————————————————————————————————
  // 6. Generate & render puzzles
  function generatePuzzles() {
    const pool = { p1: sentencesP1, p2: sentencesP2, p3: sentencesP3,
                   p4: sentencesP4, p5: sentencesP5, p6: sentencesP6 }[currentLevel];
    puzzles = shuffle([...pool]).slice(0, sessionLength).map(s => ({
      correct: s.split(" "),
      submitted: false,
      attempts: 0
    }));
    currentPuzzleIndex = 0;
    hintCount = 0;
    renderPuzzle();
    updateProgressUI();
    updateGamificationPanel();
  }

  function renderPuzzle() {
    // Clear
    clearInterval(timerId);
    elements.puzzleContainer.innerHTML = "";
    elements.submitBtn.disabled = true;
    elements.hintText.textContent = "";
    elements.successMessage.textContent = "";

    // Build UI
    const pz = puzzles[currentPuzzleIndex];
    const container = document.createElement("div");
    container.className = "sentence-container";

    // Header
    const h3 = document.createElement("h3");
    h3.textContent = `Puzzle ${currentPuzzleIndex+1} of ${sessionLength}`;
    container.appendChild(h3);

    // Word bank
    const bank = document.createElement("div");
    bank.className = "word-bank";
    shuffle([...pz.correct]).forEach(w => {
      const d = document.createElement("div");
      d.className = "word";
      d.textContent = w;
      d.draggable = true;
      d.addEventListener("dragstart", () => dragged = d);
      d.addEventListener("touchstart", () => dragged = d, {passive:true});
      bank.appendChild(d);
    });
    container.appendChild(bank);

    // Drop zone
    const drop = document.createElement("div");
    drop.className = "drop-zone";
    drop.innerHTML = `<div class="drop-placeholder">Drag words here to build your sentence!</div>`;
    drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("active"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("active"));
    drop.addEventListener("drop", e => {
      e.preventDefault();
      drop.classList.remove("active");
      if (drop.querySelector(".drop-placeholder")) drop.querySelector(".drop-placeholder").remove();
      drop.appendChild(dragged);
      gsap.fromTo(dragged, {scale:1.2}, {scale:1,duration:0.2});
      dragged = null;
      elements.submitBtn.disabled = drop.children.length !== pz.correct.length;
    });
    container.appendChild(drop);
    elements.puzzleContainer.appendChild(container);

    // Timer
    if (elements.timerToggle.checked) {
      let timeLeft = 30;
      timerId = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) { clearInterval(timerId); submitAnswer(); }
      }, 1000);
    }
  }

  // ——————————————————————————————————————————————————————————
  // 7. Gamification panel
  function updateGamificationPanel() {
    elements.xpDisplay.textContent = xp;
    elements.streakDisplay.textContent = streak;
    elements.badgesList.textContent = badges.length ? badges.join(" ") : "None";
    saveState();
  }

  // ——————————————————————————————————————————————————————————
  // 8. Submit & check
  function submitAnswer() {
    clearInterval(timerId);
    const pz = puzzles[currentPuzzleIndex];
    pz.attempts++;
    const dropChildren = Array.from(document.querySelector(".drop-zone").children);
    const userWords = dropChildren.map(d => d.textContent);
    pz.submitted = true;

    // Normalize
    if (userWords[0]) userWords[0] = userWords[0][0].toUpperCase() + userWords[0].slice(1);
    const isCorrect = userWords.join(" ") === pz.correct.join(" ");

    // Mark each
    dropChildren.forEach((d,i) => {
      d.classList.remove("correct","incorrect");
      if (d.textContent === pz.correct[i]) d.classList.add("correct");
      else {
        d.classList.add("incorrect");
        d.addEventListener("click", correctWord);
      }
    });

    if (isCorrect) {
      xp += 10; streak++;
      if (!badges.includes("First Win")) badges.push("First Win");
      elements.successMessage.textContent = "✓ Yay! You got it!";
      elements.successSound.play();
      document.querySelector(".drop-zone").classList.add("glow");
      setTimeout(() => document.querySelector(".drop-zone").classList.remove("glow"), 1000);
    } else {
      streak = 0;
      elements.hintText.textContent = "Oops! Click incorrect words to fix them.";
      elements.errorSound.play();
    }
    updateGamificationPanel();
    updateProgressUI();
  }

  function correctWord(e) {
    const d = e.target;
    const pz = puzzles[currentPuzzleIndex];
    d.textContent = pz.correct[ Array.from(d.parentNode.children).indexOf(d) ];
    d.classList.replace("incorrect","correct");
    d.removeEventListener("click", correctWord);
    // Auto‑check full correct
    if ( Array.from(d.parentNode.children).every((c,i)=> c.textContent === pz.correct[i]) ) {
      submitAnswer();
    }
  }

  // ——————————————————————————————————————————————————————————
  // 9. Navigation & controls
  let dragged = null;
  elements.nextBtn.addEventListener("click", () => {
    if (currentPuzzleIndex < sessionLength - 1) {
      currentPuzzleIndex++;
      renderPuzzle();
    } else {
      generatePuzzles();
    }
  });
  elements.prevBtn.addEventListener("click", () => {
    if (currentPuzzleIndex > 0) {
      currentPuzzleIndex--;
      renderPuzzle();
    }
  });
  elements.clearBtn.addEventListener("click", renderPuzzle);
  elements.hintBtn.addEventListener("click", () => {
    hintCount++;
    const subj = puzzles[currentPuzzleIndex].correct[0];
    elements.hintText.textContent = `Hint: the subject is “${subj}.”`;
  });
  elements.learnBtn.addEventListener("click", () => {
    elements.puzzleContainer.innerHTML = `
      <h3>Learn Sentence Basics</h3>
      <p>A sentence = <strong>Subject</strong> + <strong>Verb</strong> + (<strong>Object</strong>).</p>
    `;
  });

  // Settings
  elements.levelSelect.addEventListener("change", e => {
    currentLevel = e.target.value;
    generatePuzzles();
  });
  elements.resetBtn.addEventListener("click", generatePuzzles);
  elements.listenBtn.addEventListener("click", () =>
    speak(document.querySelector(".instructions").textContent)
  );
  elements.fullscreenBtn.addEventListener("click", () => {
    document.fullscreenElement 
      ? document.exitFullscreen() 
      : document.documentElement.requestFullscreen();
  });
  elements.themeBtn.addEventListener("click", () =>
    document.body.classList.toggle("dark-theme")
  );
  elements.submitBtn.addEventListener("click", submitAnswer);

  // ——————————————————————————————————————————————————————————
  // 10. Init
  document.addEventListener("DOMContentLoaded", () => {
    generatePuzzles();
  });
})();
