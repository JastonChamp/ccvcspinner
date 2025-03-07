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

  // Speech Synthesis with UK Female Voice (Fallback to US/AU Female Voice)
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported on this device.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice =
        voices.find((v) => v.lang === "en-GB" && v.name.includes("Female")) ||
        voices.find(
          (v) =>
            v.lang === "en-US" &&
            (v.name.includes("Samantha") || v.name.includes("Victoria"))
        ) ||
        voices.find((v) => v.lang === "en-AU" && v.name.includes("Karen")) ||
        voices.find((v) => v.lang.includes("en"));
      utterance.voice = preferredVoice || voices[0];
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

  const sentencesP2 = [
    "It was raining very heavily this morning.",
    "All students should obey the school rules.",
    "It was so cold that I could not stop shivering.",
    "Which of these activities do you enjoy doing?",
    "The teacher explained the lesson clearly and patiently.",
    "My friend always helps me with my homework.",
    "The cat quietly slept on the soft cushion.",
    "We often play games during our lunch break.",
    "The dog eagerly fetched the ball in the yard.",
    "The students listened carefully to the principal's announcement.",
    "My mother prepared a delicious meal for dinner.",
    "The library was quiet and full of interesting books.",
    "I carefully completed all my assignments on time.",
    "The children enjoyed a fun and educational field trip.",
    "The weather was so warm that we decided to have a picnic.",
    "The boy happily rode his bicycle to school.",
    "The girl carefully painted a beautiful picture.",
    "The teacher asked a challenging question during the lesson.",
    "Our class worked together to solve a difficult problem.",
    "I felt excited as I opened my new book.",
    "Hiro reads a story about Japan.",
    "Fatima shares dates with her class.",
    "Luka sings a song from Croatia.",
    "Priya learns a dance from India.",
  ];

  const sentencesP3 = [
    "The boy eats an apple during recess.",
    "The girl plays with a shiny toy in class.",
    "The dog chases the ball across the field.",
    "The teacher reads an interesting story to the students.",
    "The cat drinks milk from a small bowl.",
    "The boy kicks the ball with great enthusiasm.",
    "The girl draws a colorful picture on the board.",
    "The dog barks at the stranger outside.",
    "The student writes a letter to his best friend.",
    "The mother cooks dinner for the family.",
    "The father drives a car on busy roads.",
    "The boy catches a slippery frog near the pond.",
    "The girl rides her bicycle along the busy street.",
    "The dog fetches a stick in the backyard.",
    "The teacher explains the lesson clearly to the class.",
    "The child opens the door to let in the sunshine.",
    "The boy climbs a tall tree in the park.",
    "The girl sings a sweet song during assembly.",
    "The cat chases a little mouse in the garden.",
    "The student solves a challenging puzzle.",
    "Kofi builds a sandcastle at the beach.",
    "Mei paints a dragon for the festival.",
    "Omar kicks a ball in the park.",
    "Sana writes a poem for her teacher.",
  ];

  const sentencesP4 = [
    "The cheerful girl sings beautifully during the assembly.",
    "The boy quickly runs to school eager to learn.",
    "The teacher patiently explains the lesson to her attentive students.",
    "The children happily play together in the spacious park.",
    "The shiny red car moves fast along the busy road.",
    "The little boy smiles brightly when he sees his friend at school.",
    "The elderly man walks slowly with a calm and steady pace.",
    "The smart student solves difficult problems with ease.",
    "The busy mother prepares a delicious breakfast every single morning.",
    "The gentle wind blows softly rustling the vibrant green leaves.",
    "The excited child jumps high in joyful celebration during recess.",
    "The kind teacher helps every student after class with care.",
    "The little girl reads a colorful book under a large shady tree.",
    "The brave boy climbs the tall tree with determination and skill.",
    "The attentive class listens carefully to the teacher’s detailed instructions.",
    "The calm lake reflects the clear blue sky perfectly on a sunny day.",
    "The fast train zooms past the station with remarkable speed.",
    "The playful puppy chases its tail with endless energy.",
    "The thoughtful boy generously shares his toys with his friends.",
    "The pretty garden blooms vibrantly in early spring showcasing many colors.",
    "Nia plays a drum from her culture.",
    "Santiago flies a kite with his brother.",
    "Amina draws a picture of her family.",
    "Chen learns to cook dumplings with grandma.",
  ];

  const sentencesP5 = [
    "The teacher reads a fascinating story and the children listen attentively.",
    "The boy finished his homework before dinner so he went outside to play.",
    "The little girl happily skipped to school and her friends cheered her on.",
    "The bright sun shines over the calm sea while a gentle breeze cools the air.",
    "The busy bees buzz around the blooming flowers as the children watch in wonder.",
    "The students study in the library and take notes carefully on every detail.",
    "The father cooks dinner and the children eagerly help set the table.",
    "The dog barks loudly but the cat remains calm and sleeps peacefully.",
    "The rain poured outside yet the class continued their lesson indoors with focus.",
    "The bird sings in the morning and the flowers open gracefully to welcome the day.",
    "The boy plays soccer while his friend rides a bicycle around the field.",
    "The teacher writes on the board and the students copy the notes precisely.",
    "The car stops at the red light and the driver patiently waits for the signal.",
    "The children laugh during recess full of energy and joy.",
    "The sun sets in the west and the sky turns a beautiful shade of orange.",
    "The little girl draws a creative picture and her mother praises her artistic skills.",
    "The student answers the question correctly and the teacher smiles with pride.",
    "The dog runs in the park and the kids cheer excitedly during playtime.",
    "The wind blows gently making the leaves rustle softly in the cool breeze.",
    "The book is open on the desk and the student reads silently with concentration.",
    "Zara sings a song from her homeland.",
    "Diego helps his dad with the garden.",
    "Leila paints a picture of her cat.",
    "Ravi plays cricket with his cousins.",
  ];

  const sentencesP6 = [
    "After finishing his homework the student went to the library to study more in depth.",
    "Although it was raining heavily the children played outside happily during recess.",
    "The teacher known for her kindness explained the lesson in remarkable detail.",
    "Despite the heavy traffic she arrived at school on time and greeted everyone warmly.",
    "When the bell rang the students hurried to their classrooms with eager anticipation.",
    "Since the exam was extremely challenging the teacher reviewed the material thoroughly afterward.",
    "Even though it was late the boy continued reading his favorite book with great enthusiasm.",
    "While the sun was setting the family enjoyed a delightful picnic in the park.",
    "If you study hard every day you will achieve excellent results in your exams.",
    "After the game ended the players celebrated their victory with cheers and applause.",
    "Although the movie was quite long the audience remained engaged until the very end.",
    "Because the weather was unexpectedly cool the picnic lasted longer than anticipated.",
    "Since the library was exceptionally quiet the students concentrated deeply on their research.",
    "When the storm passed the children went outside to play joyfully despite the damp ground.",
    "After receiving his award the student thanked his parents for their unwavering support.",
    "Although she was extremely tired the teacher continued to prepare engaging lessons for the class.",
    "If you practice regularly your skills will improve significantly over time with dedication.",
    "While the bell was ringing the students gathered in the hall to listen attentively to the announcement.",
    "Because the assignment was particularly difficult the students worked in groups to complete it.",
    "After the concert ended the crowd applauded enthusiastically as the performers took a bow.",
    "Anya writes a story about her travels.",
    "Mateo builds a model of a rocket.",
    "Sofia learns about her family history.",
    "Jamil shares a recipe from his culture.",
  ];

  // Game state variables
  const sessionLength = 10;
  let puzzles = [];
  let currentPuzzleIndex = 0;
  let score = 0;
  let currentLevel = localStorage.getItem("currentLevel") || "p3";
  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;
  let badges = JSON.parse(localStorage.getItem("badges")) || [];
  let timeLeft = 30, timerId = null;
  let hintCount = 0;
  let currentDropZone = null;
  let puzzleAttempts = 0;
  let correctCount = 0;
  const today = new Date().toDateString();
  if (
    localStorage.getItem("lastPlayDate") &&
    localStorage.getItem("lastPlayDate") !== today
  ) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (localStorage.getItem("lastPlayDate") !== yesterday.toDateString())
      streak = 0;
  }

  // Utility function to shuffle an array
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  // Get sentences for the current level
  const getSentencesForLevel = (level) =>
    ({
      p1: sentencesP1,
      p2: sentencesP2,
      p3: sentencesP3,
      p4: sentencesP4,
      p5: sentencesP5,
      p6: sentencesP6,
    }[level] || sentencesP3);

  // Generate puzzles for the current session
  const generatePuzzles = () => {
    const sentencePool = getSentencesForLevel(currentLevel);
    const selectedSentences = shuffle([...sentencePool]).slice(0, sessionLength);
    puzzles = selectedSentences.map((sentence) => ({
      correct: sentence.split(" "),
      submitted: false,
      userAnswer: [],
      attempts: 0,
    }));
    currentPuzzleIndex = 0;
    score = 0;
    puzzleAttempts = 0;
    correctCount = 0;
    hintCount = 0;
    updateGamificationPanel();
  };

  // Check if the drop zone has all words to enable submission
  const checkCompletion = () => {
    if (!currentDropZone) return;
    const totalWords = puzzles[currentPuzzleIndex].correct.length;
    const droppedWords = currentDropZone.children.length;
    elements.submitBtn.disabled = droppedWords !== totalWords;
    elements.submitBtn.style.backgroundColor = elements.submitBtn.disabled
      ? "#cccccc"
      : "#4CAF50";
  };

  // Determine the role of a word in a sentence
  const getWordRole = (word, index, correctSentence) => {
    if (index === 0 && /^[A-Z]/.test(word)) return "subject";
    if (
      word.match(
        /^(is|was|were|are|runs|eats|sings|sleeps|reads|writes|explained|listened|chased|had|play|draws|decided|enjoyed|prepared|helped|finished|stopped|jumps|builds|climbs|solves|shares|flies|falls|barks|purrs|rides|skips|claps|fetch|wags|does|do|did|will|shall|can|might|should|would)/i
      )
    )
      return "verb";
    if (
      index > 1 &&
      index < correctSentence.length - 1 &&
      !word.match(/[.!?]$/) &&
      !word.match(
        /^(is|was|were|are|runs|eats|sings|sleeps|reads|writes|explained|listened|chased|had|play|draws|decided|enjoyed|prepared|helped|finished|stopped|jumps|builds|climbs|solves|shares|flies|falls|barks|purrs|rides|skips|claps|fetch|wags|does|do|did|will|shall|can|might|should|would)/i
      ) &&
      word.match(/^[a-zA-Z\s]+$/)
    )
      return "object";
    if (word.match(/[.!?]$/)) return "end";
    return "other";
  };

  // Display the current puzzle on the screen
  const displayCurrentPuzzle = () => {
    if (!elements.puzzleContainer) return;
    elements.puzzleContainer.innerHTML = "";
    elements.hint.textContent = "";
    elements.successMessage.textContent = "";
    stopTimer();
    elements.submitBtn.style.display = "inline-block";
    elements.tryAgainBtn.style.display = "none";
    elements.prevBtn.style.display = "inline-block";
    elements.nextBtn.style.display = "inline-block";
    elements.hintBtn.style.display = "inline-block";
    elements.clearBtn.style.display = "inline-block";
    elements.learnBtn.style.display = "inline-block";

    if (currentPuzzleIndex >= puzzles.length) {
      if (puzzleAttempts >= sessionLength && correctCount / puzzleAttempts >= 0.8) {
        elements.puzzleContainer.innerHTML =
          "<p>Well done! You’ve mastered this level! Ready for a review?</p>";
        speak("Well done! You’ve mastered this level! Ready for a review?");
        startReviewSession();
      } else {
        elements.puzzleContainer.innerHTML =
          "<p>Keep practicing! You need more tries to master this level.</p>";
        speak("Keep practicing! You need more tries to master this level.");
        generatePuzzles();
      }
      updateLocalStorage();
      return;
    }

    const puzzle = puzzles[currentPuzzleIndex];
    const container = document.createElement("div");
    container.className = "sentence-container";

    const header = document.createElement("h3");
    header.textContent = `Puzzle ${currentPuzzleIndex + 1} of ${sessionLength}`;
    container.appendChild(header);

    const wordBank = document.createElement("div");
    wordBank.className = "word-bank";
    wordBank.setAttribute("aria-label", "Word Bank");
    wordBank.setAttribute("role", "list");

    currentDropZone = document.createElement("div");
    currentDropZone.className = "drop-zone";
    currentDropZone.setAttribute("aria-label", "Drop Zone");
    currentDropZone.setAttribute("role", "list");

    container.appendChild(wordBank);
    container.appendChild(currentDropZone);

    wordBank.style.display = "grid";
    wordBank.style.gridTemplateColumns = "repeat(auto-fit, minmax(120px, 1fr))";
    wordBank.style.gap = "20px";
    currentDropZone.style.display = "grid";
    currentDropZone.style.gridTemplateColumns = "repeat(auto-fit, minmax(120px, 1fr))";
    currentDropZone.style.gap = "20px";

    [wordBank, currentDropZone].forEach((zone) => {
      zone.addEventListener("dragover", handleDragOver);
      zone.addEventListener("dragleave", handleDragLeave);
      zone.addEventListener("drop", handleDrop);
    });

    if (!puzzle.submitted) {
      const wordsShuffled = shuffle([...puzzle.correct]);
      wordsShuffled.forEach((word) => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word";
        wordDiv.setAttribute("role", "listitem");
        wordDiv.tabIndex = 0;
        wordDiv.textContent = word;
        wordDiv.draggable = true;
        const role = getWordRole(word, puzzle.correct.indexOf(word), puzzle.correct);
        wordDiv.dataset.role = role;
        wordDiv.classList.add(role);
        wordDiv.addEventListener("dragstart", handleDragStart);
        wordDiv.addEventListener("dragend", handleDragEnd);
        wordDiv.addEventListener("mouseover", showTooltip);
        wordDiv.addEventListener("mouseout", hideTooltip);
        wordDiv.addEventListener("touchstart", showTouchTooltip, { passive: true });
        wordDiv.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && wordDiv.parentElement.classList.contains("drop-zone"))
            removeWord(e);
        });
        wordBank.appendChild(wordDiv);
      });
      if (!currentDropZone.children.length) {
        const placeholder = document.createElement("div");
        placeholder.className = "drop-placeholder";
        placeholder.textContent = "Drag words here to build your sentence!";
        currentDropZone.appendChild(placeholder);
      }
    } else {
      puzzle.userAnswer.forEach((word, index) => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word";
        wordDiv.textContent = word;
        const isCorrect = word === puzzle.correct[index];
        wordDiv.classList.add(isCorrect ? "correct" : "incorrect");
        wordDiv.dataset.correctWord = puzzle.correct[index];
        if (!isCorrect) {
          wordDiv.style.cursor = "pointer";
          wordDiv.addEventListener("click", correctWord);
        }
        currentDropZone.appendChild(wordDiv);
      });
      elements.submitBtn.style.display = "none";
      elements.tryAgainBtn.style.display = "inline-block";
    }

    elements.puzzleContainer.appendChild(container);
    timeLeft = 30;
    startTimer();
    checkCompletion();
    elements.progress.textContent = `Puzzle ${currentPuzzleIndex + 1} of ${sessionLength}${
      document.getElementById("timer-mode").checked ? ` - Time: ${timeLeft}s` : ""
    }`;
    elements.score.textContent = `Score: ${score}`;
    elements.progressBar.style.width = `${((currentPuzzleIndex + 1) / sessionLength) * 100}%`;
    elements.progressIndicator.textContent = `Mastery Progress: ${
      puzzleAttempts > 0 ? Math.round((correctCount / puzzleAttempts) * 100) : 0
    }% (80% to advance)`;
    elements.progressLabel.innerHTML = `<img src="images/star.png" alt="Star" class="progress-icon"> Puzzle ${
      currentPuzzleIndex + 1
    }/${sessionLength}`;
  };

  // Drag-and-drop event handlers
  let draggedItem = null;
  const handleDragStart = (e) => {
    draggedItem = e.target;
    e.target.style.opacity = "0.5";
    e.dataTransfer.setData("text/plain", e.target.textContent);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    draggedItem = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("active");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("active");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (
      (e.currentTarget.classList.contains("drop-zone") ||
        e.currentTarget.classList.contains("word-bank")) &&
      draggedItem
    ) {
      e.currentTarget.classList.remove("active");
      const placeholder = e.currentTarget.querySelector(".drop-placeholder");
      if (placeholder && e.currentTarget.classList.contains("drop-zone"))
        placeholder.remove();
      e.currentTarget.appendChild(draggedItem);
      gsap.fromTo(
        draggedItem,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3 }
      );
      checkCompletion();
      if (
        e.currentTarget.classList.contains("drop-zone") &&
        e.currentTarget.children.length === 0
      ) {
        const newPlaceholder = document.createElement("div");
        newPlaceholder.className = "drop-placeholder";
        newPlaceholder.textContent = "Drag words here to build your sentence!";
        e.currentTarget.appendChild(newPlaceholder);
      }
    }
  };

  // Timer for timed mode
  const startTimer = () => {
    if (!document.getElementById("timer-mode").checked) return;
    stopTimer();
    timerId = setInterval(() => {
      timeLeft--;
      elements.progress.textContent = `Puzzle ${currentPuzzleIndex + 1} of ${sessionLength} - Time: ${timeLeft}s`;
      if (timeLeft <= 0) {
        stopTimer();
        submitAnswer();
        nextPuzzle();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerId) clearInterval(timerId);
    timerId = null;
  };

  // Update gamification panel and save state to localStorage
  function updateGamificationPanel() {
    elements.xpDisplay.textContent = `XP: ${xp}`;
    elements.streakDisplay.textContent = `Streak: ${streak}`;
    elements.badgesList.innerHTML =
      badges
        .map(
          (badge) =>
            `<img src="images/${badge.toLowerCase().replace(" ", "-")}.png" alt="${badge}" class="badge-icon">`
        )
        .join(" ") || "None";
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badges", JSON.stringify(badges));
    localStorage.setItem("lastPlayDate", today);
    localStorage.setItem("currentLevel", currentLevel);
  }

  // Save current game state to localStorage
  function updateLocalStorage() {
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badges", JSON.stringify(badges));
    localStorage.setItem("currentLevel", currentLevel);
  }

  // Display confetti animation on success
  function displayConfetti(count = 20) {
    const confettiContainer = document.createElement("div");
    confettiContainer.className = "confetti-container";
    document.body.appendChild(confettiContainer);
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDelay = Math.random() * 2 + "s";
      confetti.style.backgroundColor = [
        "#ff6f61",
        "#ff9f1c",
        "#ffcc00",
        "#98fb98",
        "#40c4ff",
      ][Math.floor(Math.random() * 5)];
      confettiContainer.appendChild(confetti);
    }
    setTimeout(() => confettiContainer.remove(), 5000);
  }

  // Animate success message with GSAP
  function animateSuccessMessage() {
    gsap.fromTo(
      elements.successMessage,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "bounce.out" }
    );
  }

  // Show tooltip on hover with word role
  const showTooltip = (e) => {
    const word = e.target.textContent;
    const puzzle = puzzles[currentPuzzleIndex];
    const index = puzzle.correct.indexOf(word);
    const role = index !== -1 ? getWordRole(word, index, puzzle.correct) : "unknown";
    let tip = "";
    switch (role) {
      case "subject":
        tip = "Subject: Who does it?";
        break;
      case "verb":
        tip = "Verb: What happens?";
        break;
      case "object":
        tip = "Object: What’s it about?";
        break;
      case "end":
        tip = "End: This ends the sentence.";
        break;
      default:
        tip = "Other: Part of the sentence.";
    }
    const tooltip = document.createElement("div");
    tooltip.textContent = tip;
    tooltip.className = "word-tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.background = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "white";
    tooltip.style.padding = "8px 12px";
    tooltip.style.borderRadius = "10px";
    tooltip.style.fontSize = "1em";
    tooltip.style.zIndex = "10";
    const rect = e.target.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    tooltip.style.top = `${rect.bottom + scrollY + 5}px`;
    tooltip.style.left = `${rect.left}px`;
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth)
      tooltip.style.left = `${window.innerWidth - tooltipRect.width - 5}px`;
    if (tooltipRect.bottom > window.innerHeight)
      tooltip.style.top = `${rect.top + scrollY - tooltipRect.height - 5}px`;
    document.body.appendChild(tooltip);
    e.target.addEventListener("mouseout", () => tooltip.remove(), { once: true });
  };

  // Show tooltip on touch (long press)
  const showTouchTooltip = (e) => {
    let timer;
    const touchMove = () => clearTimeout(timer);
    const touchEnd = () => {
      clearTimeout(timer);
      document.removeEventListener("touchmove", touchMove);
      document.removeEventListener("touchend", touchEnd);
    };
    timer = setTimeout(() => {
      const word = e.target.textContent;
      const puzzle = puzzles[currentPuzzleIndex];
      const index = puzzle.correct.indexOf(word);
      const role = index !== -1 ? getWordRole(word, index, puzzle.correct) : "unknown";
      let tip = "";
      switch (role) {
        case "subject":
          tip = "Subject: Who does it?";
          break;
        case "verb":
          tip = "Verb: What happens?";
          break;
        case "object":
          tip = "Object: What’s it about?";
          break;
        case "end":
          tip = "End: This ends the sentence.";
          break;
        default:
          tip = "Other: Part of the sentence.";
      }
      const tooltip = document.createElement("div");
      tooltip.textContent = tip;
      tooltip.className = "word-tooltip";
      tooltip.style.position = "absolute";
      tooltip.style.background = "rgba(0, 0, 0, 0.7)";
      tooltip.style.color = "white";
      tooltip.style.padding = "5px 10px";
      tooltip.style.borderRadius = "4px";
      tooltip.style.fontSize = "0.8em";
      tooltip.style.zIndex = "10";
      const rect = e.target.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      tooltip.style.top = `${rect.bottom + scrollY + 5}px`;
      tooltip.style.left = `${rect.left}px`;
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth)
        tooltip.style.left = `${window.innerWidth - tooltipRect.width - 5}px`;
      if (tooltipRect.bottom > window.innerHeight)
        tooltip.style.top = `${rect.top + scrollY - tooltipRect.height - 5}px`;
      document.body.appendChild(tooltip);
      e.target.addEventListener("touchend", () => tooltip.remove(), { once: true });
    }, 500);
    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchend", touchEnd);
  };

  // Remove a word from the drop zone and return it to the word bank
  const removeWord = (e) => {
    const word = e.target;
    const wordBank = document.querySelector(".word-bank");
    if (!wordBank || !word.classList.contains("word")) return;
    if (word.parentElement.classList.contains("drop-zone")) {
      const newWord = word.cloneNode(true);
      newWord.draggable = true;
      newWord.addEventListener("dragstart", handleDragStart);
      newWord.addEventListener("dragend", handleDragEnd);
      newWord.addEventListener("mouseover", showTooltip);
      newWord.addEventListener("mouseout", hideTooltip);
      newWord.addEventListener("touchstart", showTouchTooltip, { passive: true });
      newWord.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && newWord.parentElement.classList.contains("drop-zone"))
          removeWord(e);
      });
      wordBank.appendChild(newWord);
      word.classList.add("removing");
      setTimeout(() => word.remove(), 300);
      speak("Word removed and returned to the word bank.");
    }
    checkCompletion();
    if (currentDropZone && currentDropZone.children.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "drop-placeholder";
      placeholder.textContent = "Drag words here to build your sentence!";
      currentDropZone.appendChild(placeholder);
    }
  };

  // Correct a wrong word on click (updated: no individual correction audio)
  const correctWord = (e) => {
    const wordDiv = e.target;
    if (!wordDiv.classList.contains("incorrect")) return;
    const correctWordText = wordDiv.dataset.correctWord;
    wordDiv.textContent = correctWordText;
    wordDiv.classList.remove("incorrect");
    wordDiv.classList.add("correct");
    wordDiv.style.cursor = "default";
    wordDiv.removeEventListener("click", correctWord);
    // Now, if the sentence becomes correct, read out the full correct sentence
    const puzzle = puzzles[currentPuzzleIndex];
    puzzle.userAnswer = Array.from(currentDropZone.children).map((word) => word.textContent);
    const isNowCorrect = puzzle.userAnswer.join(" ") === puzzle.correct.join(" ");
    if (isNowCorrect) {
      score++;
      correctCount++;
      streak++;
      xp += 5; // Partial credit for correction
      document.getElementById("success-sound").play();
      // Read out the complete correct sentence
      speak(`Great job! The sentence is now correct: ${puzzle.correct.join(" ")}`);
      elements.successMessage.textContent = "✓ Yay! You fixed it!";
      animateSuccessMessage();
      displayConfetti();
      setTimeout(() => (elements.successMessage.textContent = ""), 3000);
      updateGamificationPanel();
    }
  };

  // Provide hints to help the player
  const showHint = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    if (!puzzle.submitted) {
      const wordBankWords = Array.from(document.querySelectorAll(".word-bank .word"));
      if (hintCount === 0) {
        hintCount++;
        const subjectWord = puzzle.correct[0];
        if (subjectWord) {
          elements.hint.textContent = `Who does it? The subject is "${subjectWord}".`;
          speak(`Who does it? The subject is ${subjectWord}.`);
          wordBankWords.forEach((word) => {
            if (word.textContent === subjectWord) {
              word.classList.add("hint-subject");
              setTimeout(() => word.classList.remove("hint-subject"), 3000);
            }
          });
        }
      } else if (hintCount === 1) {
        hintCount++;
        const verbIndex = puzzle.correct.findIndex(
          (word) => getWordRole(word, puzzle.correct.indexOf(word), puzzle.correct) === "verb"
        );
        const verbWord = verbIndex !== -1 ? puzzle.correct[verbIndex] : null;
        if (verbWord) {
          elements.hint.textContent = `What happens? The action word is "${verbWord}".`;
          speak(`What happens? The action word is ${verbWord}.`);
          wordBankWords.forEach((word) => {
            if (word.textContent === verbWord) {
              word.classList.add("hint-verb");
              setTimeout(() => word.classList.remove("hint-verb"), 3000);
            }
          });
        }
      } else if (hintCount === 2) {
        hintCount++;
        const objectIndex = puzzle.correct.findIndex(
          (word, idx) => getWordRole(word, idx, puzzle.correct) === "object"
        );
        const objectWord = objectIndex !== -1 ? puzzle.correct[objectIndex] : null;
        if (objectWord) {
          elements.hint.textContent = `What’s it about? The object is "${objectWord}".`;
          speak(`What’s it about? The object is ${objectWord}.`);
          wordBankWords.forEach((word) => {
            if (word.textContent === objectWord) {
              word.classList.add("hint-object");
              setTimeout(() => word.classList.remove("hint-object"), 3000);
            }
          });
        }
      } else {
        elements.hint.textContent = "No more hints! You can do it!";
        speak("No more hints! You can do it!");
      }
      xp -= hintCount * 2;
      updateGamificationPanel();
    }
  };

  // Submit and evaluate the player's answer
  const submitAnswer = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    puzzle.attempts++;
    puzzleAttempts++;
    const userWords = Array.from(currentDropZone.children).map((word) => word.textContent);
    puzzle.submitted = true;
    const userWordsAdjusted = userWords.map((word, idx) =>
      idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
    );
    const needsPunctuation = !/[.!?]$/.test(userWordsAdjusted[userWordsAdjusted.length - 1]);
    puzzle.userAnswer = userWordsAdjusted;
    const isCorrect = userWordsAdjusted.join(" ") === puzzle.correct.join(" ");

    Array.from(currentDropZone.children).forEach((wordElem, index) => {
      wordElem.classList.remove("correct", "incorrect");
      const isWordCorrect = wordElem.textContent === puzzle.correct[index];
      wordElem.classList.add(isWordCorrect ? "correct" : "incorrect");
      if (!isWordCorrect) {
        wordElem.dataset.correctWord = puzzle.correct[index];
        wordElem.style.cursor = "pointer";
        wordElem.addEventListener("click", correctWord);
      }
    });

    if (isCorrect && !needsPunctuation) {
      score++;
      correctCount++;
      streak++;
      xp += 10 + (document.getElementById("timer-mode").checked ? Math.floor(timeLeft / 5) : 0);
      if (!badges.includes("First Win")) badges.push("First Win");
      if (streak === 5 && !badges.includes("Perfect Streak 5"))
        badges.push("Perfect Streak 5");
      if (score === sessionLength && !badges.includes("Level Master"))
        badges.push("Level Master");
      document.getElementById("success-sound").play();
      speak(`Great job! The sentence is: ${puzzle.correct.join(" ")}`);
      elements.successMessage.textContent = "✓ Yay! You got it!";
      animateSuccessMessage();
      displayConfetti();
      setTimeout(() => (elements.successMessage.textContent = ""), 3000);
    } else {
      document.getElementById("error-sound").play();
      streak = 0;
      let feedback = "Oops, not quite! Click incorrect words to fix them. ";
      if (!isCorrect) feedback += "Check your word order. ";
      if (needsPunctuation) feedback += "Add a period or question mark. ";
      if (!isCorrect && userWordsAdjusted[0] !== puzzle.correct[0])
        feedback += "Start with the subject! ";
      if (
        !isCorrect &&
        userWordsAdjusted.findIndex((w) =>
          getWordRole(w, userWordsAdjusted.indexOf(w), userWordsAdjusted) === "verb"
        ) !==
          puzzle.correct.findIndex((w) =>
            getWordRole(w, puzzle.correct.indexOf(w), puzzle.correct) === "verb"
          )
      )
        feedback += "The verb might be misplaced! ";
      speak(feedback);
      elements.hint.textContent = feedback;
    }
    updateGamificationPanel();
    displayCurrentPuzzle();
  };

  // Retry the current puzzle
  const tryAgain = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    puzzle.submitted = false;
    puzzle.userAnswer = [];
    hintCount = 0;
    displayCurrentPuzzle();
  };

  // Move to the next puzzle or evaluate mastery
  const nextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      currentPuzzleIndex++;
      hintCount = 0;
      displayCurrentPuzzle();
    } else if (puzzleAttempts >= sessionLength && correctCount / puzzleAttempts >= 0.8) {
      const levels = ["p1", "p2", "p3", "p4", "p5", "p6"];
      const nextLevelIndex = levels.indexOf(currentLevel) + 1;
      if (nextLevelIndex < levels.length) {
        currentLevel = levels[nextLevelIndex];
        document.getElementById("level-select").value = currentLevel;
        speak(`Wow! Moving up to ${currentLevel.toUpperCase()}!`);
        alert(`Great job! Moving up to ${currentLevel.toUpperCase()}!`);
        generatePuzzles();
      } else {
        speak("Amazing! You’ve mastered all levels!");
        alert("Congratulations! You've mastered all levels!");
      }
    } else {
      generatePuzzles();
      speak("Keep practicing to master this level!");
    }
  };

  // Move to the previous puzzle
  const prevPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      currentPuzzleIndex--;
      hintCount = 0;
      displayCurrentPuzzle();
    } else {
      speak("This is the first puzzle!");
      alert("This is the first puzzle.");
    }
  };

  // Start a review session with mixed-level puzzles
  const startReviewSession = () => {
    // If current level is p1, remain at p1; otherwise, use previous level for review
    const prevLevel = currentLevel === "p1" ? "p1" : "p" + (parseInt(currentLevel.slice(1)) - 1);
    const prevSentences = getSentencesForLevel(prevLevel);
    const currentSentences = getSentencesForLevel(currentLevel);
    const reviewSentences = shuffle([...prevSentences.slice(0, 3), ...currentSentences.slice(0, 7)]);
    puzzles = reviewSentences.map((sentence) => ({
      correct: sentence.split(" "),
      submitted: false,
      userAnswer: [],
      attempts: 0,
    }));
    currentPuzzleIndex = 0;
    score = 0;
    puzzleAttempts = 0;
    correctCount = 0;
    displayCurrentPuzzle();
    speak("Time for a review session with mixed puzzles!");
  };

  // Reset the quiz to start over
  const resetQuiz = () => {
    generatePuzzles();
    const levelColors = {
      p1: "#ff6f61",
      p2: "#ff9f1c",
      p3: "#ffcc00",
      p4: "#98fb98",
      p5: "#40c4ff",
      p6: "#ff69b4",
    };
    document.documentElement.style.setProperty("--primary-color", levelColors[currentLevel]);
    displayCurrentPuzzle();
  };

  // Clear the drop zone and return words to the word bank
  const clearDropZone = () => {
    if (!currentDropZone) return;
    const wordBank = document.querySelector(".word-bank");
    if (!wordBank) return;
    Array.from(currentDropZone.children).forEach((word) => {
      if (word.classList.contains("word")) {
        const newWord = word.cloneNode(true);
        newWord.draggable = true;
        newWord.addEventListener("dragstart", handleDragStart);
        newWord.addEventListener("dragend", handleDragEnd);
        newWord.addEventListener("mouseover", showTooltip);
        newWord.addEventListener("mouseout", hideTooltip);
        newWord.addEventListener("touchstart", showTouchTooltip, { passive: true });
        newWord.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && newWord.parentElement.classList.contains("drop-zone"))
            removeWord(e);
        });
        wordBank.appendChild(newWord);
        word.classList.add("removing");
        setTimeout(() => word.remove(), 300);
      }
    });
    const placeholder = document.createElement("div");
    placeholder.className = "drop-placeholder";
    placeholder.textContent = "Drag words here to build your sentence!";
    currentDropZone.appendChild(placeholder);
    checkCompletion();
    speak("Drop zone cleared. Words returned to the word bank.");
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // Event listeners for interactive elements
  document.getElementById("listen-instructions-btn").addEventListener("click", () =>
    speak(document.querySelector("p.instructions").textContent)
  );
  elements.hintBtn.addEventListener("click", showHint);
  elements.submitBtn.addEventListener("click", submitAnswer);
  elements.tryAgainBtn.addEventListener("click", tryAgain);
  elements.prevBtn.addEventListener("click", prevPuzzle);
  elements.nextBtn.addEventListener("click", nextPuzzle);
  elements.clearBtn.addEventListener("click", clearDropZone);
  elements.learnBtn.addEventListener("click", () => {
    elements.puzzleContainer.innerHTML =
      "<h3>Learn Sentence Basics</h3><p>A sentence has a subject (who), a verb (what happens), and often an object (what’s affected). Example: 'The dog (subject) runs (verb) fast (object).'</p>";
    speak("Learn Sentence Basics: A sentence has a subject, a verb, and often an object.");
  });
  document.getElementById("reset-btn").addEventListener("click", resetQuiz);
  document.getElementById("level-select").addEventListener("change", (e) => {
    currentLevel = e.target.value;
    resetQuiz();
  });
  document.getElementById("fullscreen-btn").addEventListener("click", toggleFullScreen);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const body = document.body;
    if (body.classList.contains("pastel-theme")) {
      body.classList.remove("pastel-theme");
      body.classList.add("rainbow-theme");
      speak("Switched to Rainbow Fun theme!");
    } else if (body.classList.contains("rainbow-theme")) {
      body.classList.remove("rainbow-theme");
      speak("Switched to Bright Playful theme!");
    } else {
      body.classList.add("pastel-theme");
      speak("Switched to Pastel Calm theme!");
    }
  });

  // Initialize the game on page load
  document.addEventListener("DOMContentLoaded", () => {
    generatePuzzles();
    displayCurrentPuzzle();
  });
})();
