"use strict";
(() => {
  // DOM References
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    progressFill: document.getElementById("progress-bar-fill"),
    xpDisplay: document.getElementById("xp-display"),
    streakDisplay: document.getElementById("streak-display"),
    badgesList: document.getElementById("badges-list"),
    hintText: document.getElementById("hint"),
    successMsg: document.getElementById("success-message"),
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
  };

  // State
  const SESSION_LENGTH = 10;
  let puzzles = [],
    idx = 0,
    timerId = null,
    hintCount = 0;
  let xp = +localStorage.getItem("xp") || 0;
  let streak = +localStorage.getItem("streak") || 0;
  let badges = JSON.parse(localStorage.getItem("badges") || "[]");
  let currentLevel = localStorage.getItem("currentLevel") || "p3";

  // Sentences for Each Level
  const SENTS = {
    p1: [
      "Doreen had a huge birthday party.",
      "We can go out to play.",
      "The boy was chased by a dog.",
      "Would you like to have lunch now?",
      "I love to draw colorful pictures.",
    ],
    p2: [
      "The cat slept on the mat.",
      "She sings beautifully.",
      "They went to the park yesterday.",
      "Can you help me with this?",
      "He is reading a book.",
    ],
    p3: [
      "The sun sets in the west.",
      "Birds fly in the sky.",
      "I have two brothers and one sister.",
      "Do you want to join us?",
      "She painted a beautiful landscape.",
    ],
    p4: [
      "The teacher explained the lesson.",
      "We are going to the zoo tomorrow.",
      "He fixed the broken chair.",
      "What time is it now?",
      "They enjoyed the concert.",
    ],
    p5: [
      "The scientist conducted an experiment.",
      "She wrote a letter to her friend.",
      "We visited the museum last week.",
      "How do you solve this problem?",
      "He is learning to play the guitar.",
    ],
    p6: [
      "The chef prepared a delicious meal.",
      "They are planning a trip to Europe.",
      "She solved the puzzle quickly.",
      "Why did you choose this book?",
      "He has been working here for five years.",
    ],
  };

  // Helpers
  const shuffle = (a) => a.sort(() => Math.random() - 0.5);

  const save = () => {
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badges", JSON.stringify(badges));
    localStorage.setItem("currentLevel", currentLevel);
  };

  function speak(txt) {
    if (!window.speechSynthesis) {
      elements.hintText.textContent = "Speech not supported on this device.";
      return;
    }
    const voices = speechSynthesis.getVoices();
    if (!voices.length) {
      // Voices not loaded yet, wait for them
      speechSynthesis.onvoiceschanged = () => speak(txt);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(txt);
    const voice = voices.find((v) => v.lang === "en-GB") || voices[0];
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }

  function launchConfetti() {
    for (let i = 0; i < 6; i++) { // Reduced to 6 for performance
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.setProperty("--dx", `${(Math.random() - 0.5) * 200}px`);
      confetti.style.setProperty("--dy", `${(Math.random() - 0.5) * 200}px`);
      document.body.appendChild(confetti);
      confetti.onanimationend = () => confetti.remove();
    }
  }

  // Progress UI
  function updateProgress() {
    const pct = Math.round(((idx + 1) / SESSION_LENGTH) * 100);
    elements.progressFill.style.width = `${pct}%`;
    elements.progressFill.parentElement.setAttribute("aria-valuenow", idx + 1);
    elements.progressLabel.textContent = `Puzzle ${idx + 1} of ${SESSION_LENGTH}`;
  }

  // Generate Puzzles
  function genPuzzles() {
    const pool = SENTS[currentLevel];
    if (!pool.length) {
      elements.hintText.textContent = "No sentences available for this level.";
      return;
    }
    puzzles = shuffle([...pool])
      .slice(0, SESSION_LENGTH)
      .map((s) => ({ correct: s.split(" "), attempts: 0 }));
    idx = 0;
    hintCount = 0;
    renderPuzzle();
    updateProgress();
    updateGamify();
  }

  // Render Puzzle
  let dragged = null;
  function renderPuzzle() {
    clearInterval(timerId);
    elements.puzzleContainer.innerHTML = "";
    elements.submitBtn.disabled = true;
    elements.hintText.textContent = "";
    elements.successMsg.textContent = "";

    const pz = puzzles[idx];
    const h3 = document.createElement("h3");
    h3.textContent = `Puzzle ${idx + 1} of ${SESSION_LENGTH}`;
    elements.puzzleContainer.appendChild(h3);

    // Word Bank
    const bank = document.createElement("div");
    bank.className = "word-bank";
    shuffle([...pz.correct]).forEach((w) => {
      const word = document.createElement("div");
      word.className = "word";
      word.textContent = w;
      word.draggable = true;
      word.tabIndex = 0; // Keyboard accessible
      word.addEventListener("dragstart", () => (dragged = word));
      word.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          dragged = word;
          word.focus();
        }
      });
      bank.appendChild(word);
    });
    elements.puzzleContainer.appendChild(bank);

    // Drop Zone
    const drop = document.createElement("div");
    drop.className = "drop-zone";
    drop.innerHTML = `<div class="drop-placeholder">Drag words here…</div>`;
    drop.addEventListener("dragover", (e) => {
      e.preventDefault();
      drop.classList.add("active");
    });
    drop.addEventListener("dragleave", () => drop.classList.remove("active"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("active");
      const ph = drop.querySelector(".drop-placeholder");
      if (ph) ph.remove();
      if (dragged) {
        drop.appendChild(dragged);
        gsap.fromTo(dragged, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
        dragged = null;
      }
      elements.submitBtn.disabled = drop.children.length !== pz.correct.length;
    });
    elements.puzzleContainer.appendChild(drop);

    // Timer
    if (elements.timerToggle.checked) {
      let t = 30;
      const timerDisplay = document.createElement("div");
      timerDisplay.className = "timer";
      timerDisplay.textContent = `Time: ${t}s`;
      elements.puzzleContainer.appendChild(timerDisplay);
      timerId = setInterval(() => {
        t--;
        timerDisplay.textContent = `Time: ${t}s`;
        if (t <= 0) {
          clearInterval(timerId);
          checkAnswer();
        }
      }, 1000);
    }
  }

  // Gamification UI
  function updateGamify() {
    elements.xpDisplay.textContent = xp;
    elements.streakDisplay.textContent = streak;
    elements.badgesList.textContent = badges.join(", ") || "None";
    save();
  }

  // Check Answer
  function checkAnswer() {
    clearInterval(timerId);
    const drop = document.querySelector(".drop-zone");
    const pz = puzzles[idx];
    pz.attempts++;
    const user = Array.from(drop.children).map((d) => d.textContent);
    const norm = user.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w));
    const correct = norm.join(" ") === pz.correct.join(" ");

    Array.from(drop.children).forEach((d, i) => {
      d.classList.remove("correct", "incorrect");
      if (d.textContent === pz.correct[i]) {
        d.classList.add("correct");
      } else {
        d.classList.add("incorrect");
        d.addEventListener("click", fixWord);
      }
    });

    if (correct) {
      xp += 10;
      streak++;
      if (!badges.includes("First Win")) badges.push("First Win");
      if (streak === 5) badges.push("Streak Master");
      elements.successMsg.textContent = "🎉 Correct!";
      elements.successSound.play();
      gsap.fromTo(".drop-zone", { y: -10 }, { y: 0, duration: 0.6, ease: "bounce.out" });
      launchConfetti();
    } else {
      streak = 0;
      elements.hintText.textContent = "Oops—tap red words to fix!";
      elements.errorSound.play();
      gsap.fromTo(".drop-zone", { x: -5 }, { x: 5, duration: 0.1, repeat: 5, yoyo: true });
    }
    updateGamify();
    updateProgress();
  }

  function fixWord(e) {
    const d = e.target;
    const pz = puzzles[idx];
    const i = Array.from(d.parentNode.children).indexOf(d);
    d.textContent = pz.correct[i];
    d.classList.replace("incorrect", "correct");
    d.removeEventListener("click", fixWord);
    gsap.fromTo(d, { scale: 1.1 }, { scale: 1, duration: 0.3 });

    if (Array.from(d.parentNode.children).every((c, j) => c.textContent === pz.correct[j])) {
      checkAnswer();
    }
  }

  // Navigation
  elements.submitBtn.addEventListener("click", checkAnswer);
  elements.nextBtn.addEventListener("click", () => {
    idx = idx + 1 < SESSION_LENGTH ? idx + 1 : 0;
    renderPuzzle();
    updateProgress();
    updateGamify();
  });
  elements.prevBtn.addEventListener("click", () => {
    idx = idx > 0 ? idx - 1 : 0;
    renderPuzzle();
    updateProgress();
    updateGamify();
  });
  elements.clearBtn.addEventListener("click", renderPuzzle);
  elements.hintBtn.addEventListener("click", () => {
    hintCount++;
    const subj = puzzles[idx].correct[0];
    elements.hintText.textContent = `Hint: Subject = "${subj}"`;
  });
  elements.learnBtn.addEventListener("click", () => {
    elements.puzzleContainer.innerHTML = `
      <h3>Learn: Subject + Verb (+Object)</h3>
      <p>Example: <strong>The dog runs fast.</strong></p>
    `;
  });

  // Settings
  elements.levelSelect.addEventListener("change", (e) => {
    currentLevel = e.target.value;
    genPuzzles();
  });
  elements.resetBtn.addEventListener("click", genPuzzles);
  elements.listenBtn.addEventListener("click", () => {
    speak("Drag the words below to make a sentence. Start with a capital letter and end with a full stop or question mark.");
  });
  elements.fullscreenBtn.addEventListener("click", () => {
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
  });
  elements.themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    save();
  });

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    elements.levelSelect.value = currentLevel;
    genPuzzles();
  });
})();
