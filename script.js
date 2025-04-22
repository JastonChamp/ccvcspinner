"use strict";

(() => {
  // DOM elements for the game
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    hint: document.getElementById("hint"),
    successMessage: document.getElementById("success-message"),
    progress: document.getElementById("progress"),
    score: document.getElementById("score"),
    progressBar: document.getElementById("progress-bar"),
    progressLabel: document.getElementById("progress-label"),
    progressIndicator: document.getElementById("progress-indicator"),
    xpDisplay: document.getElementById("xp-display"),
    streakDisplay: document.getElementById("streak-display"),
    badgesList: document.getElementById("badges-list"),
    submitBtn: document.getElementById("submit-btn"),
    tryAgainBtn: document.getElementById("try-again-btn"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    hintBtn: document.getElementById("hint-btn"),
    clearBtn: document.getElementById("clear-btn"),
    learnBtn: document.getElementById("learn-btn"),
  };

  // Speech Synthesis with dynamic voice selection (UK Female or fallback)
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported on this device.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer UK female, then US female, then any English voice, then default
      const preferredVoice =
        voices.find((v) => v.lang === "en-GB" && v.name.includes("Female")) ||
        voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) ||
        voices.find((v) => v.lang.startsWith("en-")) ||
        voices[0]; // Fallback to the first available voice
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        console.warn("No preferred voice found, using default.");
      }
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      loadVoices();
    }
  }

  // Hide tooltip helper
  const hideTooltip = (e) => {
    const tooltip = document.querySelector(".word-tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  };

  // Sentence pools for each level
  const sentencesP1 = [
    "Doreen had a huge birthday party.",
    "We can go out to play.",
    "The boy was chased by a dog.",
    "Would you like to have lunch now?",
    "The house was empty and quiet.",
    "I have a small red ball.",
    "My cat sleeps on the warm mat.",
    "The teacher reads a fun story.",
    "The dog runs fast in the park.",
    "I love to draw colorful pictures.",
    "The sun is shining brightly.",
    "My friend is kind and gentle.",
    "We play games during recess.",
    "The bird sings a sweet song.",
    "I like to eat ice cream.",
    "The tree is tall and green.",
    "The girl wears a blue dress.",
    "The boy rides a small bicycle.",
    "My mom cooks tasty food.",
    "The puppy barks at the mailman.",
    "Ali plays soccer with his friends.",
    "Maria dances at the festival.",
    "Juan paints a bright mural.",
    "Aisha shares her books with classmates.",
  ];

  // Placeholder for other levels (add your own sentences if needed)
  const sentencesP2 = sentencesP1;
  const sentencesP3 = sentencesP1;
  const sentencesP4 = sentencesP1;
  const sentencesP5 = sentencesP1;
  const sentencesP6 = sentencesP1;
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  const saveState = () => {
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badges", JSON.stringify(badges));
    localStorage.setItem("currentLevel", currentLevel);
    localStorage.setItem("lastPlayDate", today);
  };

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    let voices = speechSynthesis.getVoices();
    u.voice = voices.find(v=>v.lang==="en-GB")||voices[0];
    u.rate=0.9; u.pitch=1.1; speechSynthesis.speak(u);
  }

  // ——————————————————————————————————————————————————————————
  // Progress UI (bar + ARIA)
  function updateProgressUI() {
    const current = currentPuzzleIndex + 1;
    const pct = Math.round((current / sessionLength) * 100);
    elements.progressBarFill.style.width = `${pct}%`;
    const bar = document.getElementById("progress-bar-container");
    bar.setAttribute("aria-valuenow", current);
  }

  // ——————————————————————————————————————————————————————————
  // Generate puzzles
  function generatePuzzles() {
    const pool = {
      p1: sentencesP1, p2: sentencesP2, p3: sentencesP3,
      p4: sentencesP4, p5: sentencesP5, p6: sentencesP6
    }[currentLevel];
    const chosen = shuffle([...pool]).slice(0, sessionLength);
    puzzles = chosen.map(s => ({
      correct: s.split(" "),
      submitted: false,
      userAnswer: [],
      attempts: 0
    }));
    currentPuzzleIndex=0; score=0; puzzleAttempts=0; correctCount=0; hintCount=0;
    renderPuzzle();
    updateProgressUI();
    updateGamificationPanel();
  }

  // ——————————————————————————————————————————————————————————
  // Render current puzzle
  function renderPuzzle() {
    elements.puzzleContainer.innerHTML = "";
    stopTimer();
    elements.submitBtn.disabled = true;
    elements.hint.textContent = "";
    elements.successMessage.textContent = "";

    const pz = puzzles[currentPuzzleIndex];
    const container = document.createElement("div");
    container.className = "sentence-container";

    // Header
    const header = document.createElement("h3");
    header.textContent = `Puzzle ${currentPuzzleIndex+1} of ${sessionLength}`;
    container.appendChild(header);

    // Word bank
    const bank = document.createElement("div");
    bank.className = "word-bank";
    const shuffled = shuffle([...pz.correct]);
    shuffled.forEach(word => {
      const w = document.createElement("div");
      w.className = "word";
      w.textContent = word;
      w.draggable = true;
      w.addEventListener("dragstart", dragStart);
      w.addEventListener("touchstart", dragStartTouch, {passive:true});
      bank.appendChild(w);
    });
    container.appendChild(bank);

    // Drop zone
    const drop = document.createElement("div");
    drop.className = "drop-zone";
    drop.innerHTML = `<div class="drop-placeholder">Drag words here to build your sentence!</div>`;
    drop.addEventListener("dragover", dragOver);
    drop.addEventListener("drop", dropWord);
    drop.addEventListener("dragleave", () => drop.classList.remove("active"));
    container.appendChild(drop);
    currentDropZone = drop;

    elements.puzzleContainer.appendChild(container);

    // Start timer if on
    if (elements.timerToggle.checked) startTimer();
    updateProgressUI();
  }

  // ——————————————————————————————————————————————————————————
  // Drag & Drop
  let dragged = null;
  function dragStart(e) { dragged = e.target; }
  function dragStartTouch(e) { dragged = e.target; }
  function dragOver(e) { e.preventDefault(); currentDropZone.classList.add("active"); }
  function dropWord(e) {
    e.preventDefault();
    currentDropZone.classList.remove("active");
    if (!dragged) return;
    if (currentDropZone.querySelector(".drop-placeholder")) {
      currentDropZone.querySelector(".drop-placeholder").remove();
    }
    currentDropZone.appendChild(dragged);
    gsap.fromTo(dragged, {scale:1.2},{scale:1,duration:0.2});
    dragged = null;
    elements.submitBtn.disabled = currentDropZone.children.length !== puzzles[currentPuzzleIndex].correct.length;
  }

  // ——————————————————————————————————————————————————————————
  // Timer
  function startTimer() {
    timeLeft = 30;
    timerId = setInterval(()=>{
      timeLeft--;
      if (timeLeft<=0) {
        clearInterval(timerId);
        submitAnswer();
      }
    },1000);
  }
  function stopTimer() { clearInterval(timerId); }

  // ——————————————————————————————————————————————————————————
  // Gamification panel
  function updateGamificationPanel() {
    elements.xpDisplay.textContent = xp;
    elements.streakDisplay.textContent = streak;
    elements.badgesList.textContent = badges.length ? badges.join(" ") : "None";
    saveState();
  }

  // ——————————————————————————————————————————————————————————
  // Submit & evaluate
  function submitAnswer() {
    stopTimer();
    const pz = puzzles[currentPuzzleIndex];
    pz.attempts++; puzzleAttempts++;
    const userWords = Array.from(currentDropZone.children).map(w=>w.textContent);
    pz.submitted = true;
    // Normalize capitalization/punctuation
    if (userWords[0]) userWords[0] = userWords[0][0].toUpperCase()+userWords[0].slice(1);
    const isCorrect = userWords.join(" ") === pz.correct.join(" ");
    // Mark right/wrong
    Array.from(currentDropZone.children).forEach((w,i)=>{
      w.classList.remove("correct","incorrect");
      if (w.textContent === pz.correct[i]) w.classList.add("correct");
      else {
        w.classList.add("incorrect");
        w.addEventListener("click", correctWord);
      }
    });

    if (isCorrect) {
      xp += 10; streak++; correctCount++;
      if (!badges.includes("First Win")) badges.push("First Win");
      elements.successMessage.textContent = "✓ Yay! You got it!";
      document.getElementById("success-sound").play();
      currentDropZone.classList.add("glow");
      setTimeout(()=>currentDropZone.classList.remove("glow"),1000);
    } else {
      streak = 0;
      elements.hint.textContent = "Oops! Click incorrect words to fix them.";
      document.getElementById("error-sound").play();
    }
    updateGamificationPanel();
    updateProgressUI();
  }

  // ——————————————————————————————————————————————————————————
  // Correct a wrong word
  function correctWord(e) {
    const w = e.target;
    w.textContent = w.dataset.correct || w.textContent;
    w.classList.replace("incorrect","correct");
    w.removeEventListener("click", correctWord);
    // Re-evaluate if fully correct
    const pz = puzzles[currentPuzzleIndex];
    const now = Array.from(currentDropZone.children).map(x=>x.textContent).join(" ");
    if (now === pz.correct.join(" ")) submitAnswer();
  }

  // ——————————————————————————————————————————————————————————
  // Navigation
  elements.nextBtn.addEventListener("click", ()=>{
    if (currentPuzzleIndex < puzzles.length-1) {
      currentPuzzleIndex++;
      renderPuzzle();
    } else generatePuzzles();
  });
  elements.prevBtn.addEventListener("click", ()=>{
    if (currentPuzzleIndex>0) {
      currentPuzzleIndex--;
      renderPuzzle();
    }
  });
  elements.clearBtn.addEventListener("click", renderPuzzle);
  elements.hintBtn.addEventListener("click", ()=>{
    hintCount++;
    const subj = puzzles[currentPuzzleIndex].correct[0];
    elements.hint.textContent = `Hint: the subject is "${subj}".`;
  });
  elements.learnBtn.addEventListener("click", ()=>{
    elements.puzzleContainer.innerHTML = `
      <h3>Learn Sentence Basics</h3>
      <p>A sentence has: <strong>Subject</strong> (who), <strong>Verb</strong> (action), and often an <strong>Object</strong>.</p>
    `;
  });

  // ——————————————————————————————————————————————————————————
  // Settings
  elements.levelSelect.addEventListener("change", e=>{
    currentLevel = e.target.value;
    generatePuzzles();
  });
  elements.resetBtn.addEventListener("click", generatePuzzles);
  elements.listenBtn.addEventListener("click", ()=>{
    speak(document.querySelector(".instructions").textContent);
  });
  elements.fullscreenBtn.addEventListener("click", ()=>{
    document.fullscreenElement 
      ? document.exitFullscreen() 
      : document.documentElement.requestFullscreen();
  });
  elements.themeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark-theme");
  });

  // ——————————————————————————————————————————————————————————
  // Init
  document.addEventListener("DOMContentLoaded", ()=>{
    generatePuzzles();
  });
})();
