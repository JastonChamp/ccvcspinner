'use strict';

(() => {
  // Cached DOM elements
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    progress: document.getElementById("progress"),
    progressBar: document.getElementById("progress-bar"),
    xpDisplay: document.getElementById("xp-display"),
    streakDisplay: document.getElementById("streak-display"),
    submitBtn: document.getElementById("submit-btn"),
    feedbackPanel: document.getElementById("feedback-panel"),
    feedbackMessage: document.getElementById("feedback-message"),
    feedbackAnnouncer: document.getElementById("feedback-announcer"),
  };

  // Sentence pools (reusing your original arrays, abbreviated here for brevity)
  const sentencesP1 = ["Doreen had a huge birthday party.", /* ... */];
  const sentencesP2 = ["It was raining very heavily this morning.", /* ... */];
  const sentencesP3 = ["The boy eats an apple during recess.", /* ... */];
  const sentencesP4 = ["The cheerful girl sings beautifully during the assembly.", /* ... */];
  const sentencesP5 = ["The teacher reads a fascinating story, and the children listen attentively.", /* ... */];
  const sentencesP6 = ["After finishing his homework, the student went to the library to study more in depth.", /* ... */];

  // Game variables
  const sessionLength = 5;
  let puzzles = [], currentPuzzleIndex = 0, score = 0;
  let xp = parseInt(localStorage.getItem('xp')) || 0;
  let streak = parseInt(localStorage.getItem('streak')) || 0;
  let badges = JSON.parse(localStorage.getItem('badges')) || [];
  let currentLevel = localStorage.getItem('currentLevel') || 'p3';
  let timeLeft = 0, timerId = null, hintCount = 0;
  let lastPlayDate = localStorage.getItem('lastPlayDate');
  const today = new Date().toDateString();
  if (lastPlayDate && lastPlayDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastPlayDate !== yesterday.toDateString()) streak = 0;
  }

  // Utilities
  const shuffle = array => array.sort(() => Math.random() - 0.5);
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      elements.feedbackMessage.textContent = text;
    }
  };

  const getSentencesForLevel = level => ({
    p1: sentencesP1, p2: sentencesP2, p3: sentencesP3,
    p4: sentencesP4, p5: sentencesP5, p6: sentencesP6
  }[level] || sentencesP3);

  // Puzzle Generation
  const generatePuzzles = () => {
    const sentencePool = getSentencesForLevel(currentLevel);
    const selectedSentences = shuffle([...sentencePool]).slice(0, sessionLength);
    puzzles = selectedSentences.map(sentence => ({
      correct: sentence.split(" "),
      submitted: false,
      userAnswer: [],
      attempts: 0
    }));
    currentPuzzleIndex = 0;
    score = 0;
    hintCount = 0;
    updateStatusBar();
  };

  // Display Puzzle
  const displayCurrentPuzzle = () => {
    elements.puzzleContainer.innerHTML = "";
    stopTimer();
    elements.submitBtn.disabled = true;

    if (currentPuzzleIndex >= puzzles.length) {
      elements.puzzleContainer.innerHTML = "<p>Congratulations! Session complete!</p>";
      speak("Congratulations! You finished the session!");
      return;
    }

    const puzzle = puzzles[currentPuzzleIndex];
    const container = document.createElement("div");
    container.className = "sentence-container";

    const wordBank = document.createElement("div");
    wordBank.className = "word-bank";
    const dropZone = document.createElement("div");
    dropZone.className = "drop-zone";

    const wordFragment = document.createDocumentFragment();
    const words = puzzle.submitted ? puzzle.userAnswer : shuffle([...puzzle.correct]);
    words.forEach((word, idx) => {
      const wordDiv = document.createElement("div");
      wordDiv.className = "word";
      wordDiv.textContent = word;
      wordDiv.draggable = !puzzle.submitted;
      wordDiv.tabIndex = 0;

      if (!puzzle.submitted) {
        wordDiv.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", word));
        wordDiv.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            dropZone.appendChild(wordDiv);
            checkCompletion();
          }
        });
      } else {
        wordDiv.classList.add(word === puzzle.correct[idx] ? "correct" : "incorrect");
      }
      wordFragment.appendChild(wordDiv);
    });
    (puzzle.submitted ? dropZone : wordBank).appendChild(wordFragment);

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      const word = e.dataTransfer.getData("text/plain");
      const wordDiv = wordBank.querySelector(`.word[textContent="${word}"]`) || document.createElement("div");
      wordDiv.className = "word";
      wordDiv.textContent = word;
      dropZone.appendChild(wordDiv);
      checkCompletion();
    });

    container.append(wordBank, dropZone);
    elements.puzzleContainer.appendChild(container);
    updateStatusBar();
    startTimer();
  };

  // Check Completion
  const checkCompletion = () => {
    const dropZone = elements.puzzleContainer.querySelector(".drop-zone");
    const totalWords = puzzles[currentPuzzleIndex].correct.length;
    const droppedWords = dropZone.children.length;
    elements.submitBtn.disabled = droppedWords !== totalWords;
  };

  // Timer Logic
  const startTimer = () => {
    const duration = parseInt(document.getElementById("timer-duration").value);
    if (!document.getElementById("timer-mode").checked || duration === 0) return;
    timeLeft = duration;
    elements.submitBtn.textContent = `Submit (${timeLeft}s)`;
    timerId = setInterval(() => {
      timeLeft--;
      elements.submitBtn.textContent = `Submit (${timeLeft}s)`;
      if (timeLeft <= 0) {
        stopTimer();
        submitAnswer();
        nextPuzzle();
      }
    }, 1000);
  };
  const stopTimer = () => {
    clearInterval(timerId);
    elements.submitBtn.textContent = "Submit";
  };

  // Gamification
  const updateStatusBar = () => {
    elements.progress.textContent = `Puzzle ${currentPuzzleIndex + 1}/${sessionLength}`;
    elements.xpDisplay.textContent = `XP: ${xp}`;
    elements.streakDisplay.textContent = `Streak: ${streak}`;
    elements.progressBar.style.width = `${((currentPuzzleIndex + 1) / sessionLength) * 100}%`;
    localStorage.setItem('xp', xp);
    localStorage.setItem('streak', streak);
    localStorage.setItem('badges', JSON.stringify(badges));
    localStorage.setItem('lastPlayDate', today);
    localStorage.setItem('currentLevel', currentLevel);
  };

  const showFeedback = (message, isSuccess) => {
    elements.feedbackMessage.textContent = message;
    elements.feedbackAnnouncer.textContent = message;
    elements.feedbackPanel.classList.add(isSuccess ? "success" : "error");
    elements.feedbackPanel.classList.add("visible");
    setTimeout(() => {
      elements.feedbackPanel.classList.remove("visible", "success", "error");
    }, 3000);
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4CAF50", "#FF9800", "#FFC107"],
    });
  };

  // Hint & Submission
  const showHint = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    if (puzzle.submitted) return;
    let hintText;
    switch (hintCount) {
      case 0: hintText = `Start with the subject: "${puzzle.correct[0]}"`; break;
      case 1: hintText = `Next is the verb: "${puzzle.correct[1]}"`; break;
      case 2: hintText = "Follow with the object or detail."; break;
      default: hintText = "No more hints available!"; return;
    }
    hintCount++;
    xp -= hintCount * 5;
    showFeedback(hintText, false);
    speak(hintText);
    updateStatusBar();
  };

  const submitAnswer = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    const dropZone = elements.puzzleContainer.querySelector(".drop-zone");
    const userWords = Array.from(dropZone.children).map(word => word.textContent);
    puzzle.userAnswer = userWords;
    puzzle.submitted = true;

    const isCorrect = userWords.join(" ") === puzzle.correct.join(" ");
    if (isCorrect) {
      score++;
      streak++;
      xp += 10 + (timeLeft > 0 ? Math.floor(timeLeft / 5) : 0);
      if (!badges.includes("First Win")) badges.push("First Win");
      if (streak === 5) badges.push("Streak Master");
      document.getElementById("success-sound").play();
      showFeedback("Great job! Correct sentence!", true);
      speak(`Correct! ${puzzle.correct.join(" ")}`);
      launchConfetti();
    } else {
      streak = 0;
      document.getElementById("error-sound").play();
      const feedback = `Oops! Should be: ${puzzle.correct.join(" ")}`;
      showFeedback(feedback, false);
      speak(feedback);
    }
    updateStatusBar();
    displayCurrentPuzzle();
  };

  // Navigation
  const nextPuzzle = () => {
    stopTimer();
    if (currentPuzzleIndex < puzzles.length - 1) {
      currentPuzzleIndex++;
      hintCount = 0;
      displayCurrentPuzzle();
    } else if (score === sessionLength) {
      const levels = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      const nextLevelIndex = levels.indexOf(currentLevel) + 1;
      if (nextLevelIndex < levels.length) {
        currentLevel = levels[nextLevelIndex];
        document.getElementById("level-select").value = currentLevel;
        speak(`Moving up to ${currentLevel.toUpperCase()}!`);
        alert(`Great job! Advancing to ${currentLevel.toUpperCase()}!`);
        resetQuiz();
      } else {
        speak("You’ve mastered all levels!");
        alert("Congratulations! You've mastered all levels!");
      }
    }
  };

  const resetQuiz = () => {
    generatePuzzles();
    displayCurrentPuzzle();
  };

  // Settings Modal
  document.getElementById("settings-btn").addEventListener("click", () => {
    document.getElementById("settings-modal").classList.add("visible");
  });
  document.getElementById("close-settings").addEventListener("click", () => {
    document.getElementById("settings-modal").classList.remove("visible");
  });
  document.getElementById("level-select").addEventListener("change", (e) => {
    currentLevel = e.target.value;
    resetQuiz();
  });

  // Event Listeners
  document.getElementById("hint-btn").addEventListener("click", showHint);
  elements.submitBtn.addEventListener("click", submitAnswer);
  document.getElementById("next-btn").addEventListener("click", nextPuzzle);

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    generatePuzzles();
    displayCurrentPuzzle();
  });
})();
