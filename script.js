'use strict';

(() => {
  // Cached DOM elements
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    hint: document.getElementById("hint"),
    successMessage: document.getElementById("success-message"),
    progress: document.getElementById("progress"),
    score: document.getElementById("score"),
    progressBar: document.getElementById("progress-bar"),
    xpDisplay: document.getElementById("xp-display"),
    streakDisplay: document.getElementById("streak-display"),
    badgesList: document.getElementById("badges-list"),
    submitBtn: document.getElementById("submit-btn"),
    tryAgainBtn: document.getElementById("try-again-btn")
  };

  // Speech API Utility
  function speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        let preferredVoice = voices.find(v => v.name.includes("Google US English")) || 
                            voices.find(v => v.lang === "en-US" && v.name.includes("Natural")) || 
                            voices[0];
        utterance.voice = preferredVoice;
        console.log("Voice used:", preferredVoice?.name || "None available");
      };
      if (window.speechSynthesis.getVoices().length) setVoice();
      else window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis API not supported.");
    }
  }

  // Sentence Pools (Full arrays from your input)
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
    "The car stops at the red light.",
    "I jump high on the trampoline.",
    "The book is open on the table.",
    "The rain falls softly on the roof.",
    "The school bell rings loudly.",
    "My friend smiles on a sunny day.",
    "The dog wags its tail happily.",
    "The cat purrs when it is happy.",
    "I like to read fun stories.",
    "The bird flies across the sky.",
    "We share our toys with friends.",
    "The cake tastes very sweet.",
    "The wind blows gently outside.",
    "I sing songs with my classmates.",
    "The flowers bloom in the spring.",
    "The moon shines in the dark sky.",
    "I ride my scooter to school.",
    "The baby laughs at funny faces.",
    "The ice cream melts in the sun.",
    "I play with my new puzzle.",
    "The dog fetches the ball quickly.",
    "The girl claps her hands loudly.",
    "My brother runs in the park.",
    "The water is clear and cool.",
    "I build a tower with blocks.",
    "The school is big and bright.",
    "The bird builds a nest in the tree.",
    "I draw a picture of my family.",
    "The sun sets behind the hills.",
    "I sleep early at night."
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
    "The movie was long, but it was very interesting.",
    "I listened attentively while the teacher explained the experiment.",
    "The garden was full of colorful and blooming flowers.",
    "My brother quickly finished his math homework.",
    "The wind was strong enough to sway the tall trees.",
    "I enjoyed reading the story because it was very exciting.",
    "The school bus arrived promptly every morning.",
    "My friend and I shared our snacks during recess.",
    "The teacher praised the class for their hard work.",
    "I carefully followed the instructions for the science project.",
    "The sun shone brightly on the warm summer day.",
    "We eagerly awaited the start of the school assembly.",
    "The classroom was neat and well-organized.",
    "I learned many new things during our history lesson.",
    "The concert was amazing and left everyone impressed.",
    "My family celebrated my birthday with a surprise party.",
    "The puzzle was challenging, but I solved it step by step.",
    "The students participated actively in the group discussion.",
    "I enjoyed the field trip because it was both fun and educational.",
    "The rain stopped suddenly, and the sky became clear.",
    "I was proud of my work after I completed the project.",
    "The teacher encouraged us to ask questions during the lesson.",
    "Our class visited the museum and learned about history.",
    "The game was exciting and filled with many surprises.",
    "I practiced my speech until I felt confident and ready.",
    "The art project allowed me to express my creativity.",
    "I reviewed my notes carefully before the big test.",
    "The library offered a quiet place for everyone to study.",
    "The teacher organized a fun quiz that everyone enjoyed.",
    "I finished my homework quickly because I understood the topic well."
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
    "The boy wears a blue cap every day.",
    "The girl carefully draws a beautiful flower.",
    "The dog runs quickly in the green park.",
    "The teacher writes neat words on the board.",
    "The child listens carefully to the exciting story.",
    "The boy enjoys playing under the warm sun.",
    "The girl shares her lunch with a good friend.",
    "The cat purrs softly when it is happy.",
    "The dog wags its tail as it plays.",
    "The student reads a story aloud with passion.",
    "The teacher explains the homework in detail.",
    "The child jumps high during recess time.",
    "The boy builds a small tower with colorful blocks.",
    "The girl draws a picture of her loving family.",
    "The dog barks excitedly at the passing car.",
    "The teacher smiles as the students learn eagerly.",
    "The cat sleeps peacefully on the comfy mat.",
    "The boy rides his bicycle fast along the lane.",
    "The girl skips along the cheerful path.",
    "The student writes neatly in his bright notebook.",
    "The teacher claps for a job well done.",
    "The child sings a cheerful tune during art class.",
    "The dog runs across the vast green field.",
    "The girl reads an interesting book during break time.",
    "The boy plays a lively game of tag with friends.",
    "The teacher explains a tricky problem with clarity.",
    "The student solves the puzzle with careful thought.",
    "The cat jumps gracefully onto the cozy chair.",
    "The dog chases its tail happily in the yard.",
    "The child dreams of a fun and adventurous day."
  ];

  const sentencesP4 = [
    "The cheerful girl sings beautifully during the assembly.",
    "The boy quickly runs to school, eager to learn.",
    "The teacher patiently explains the lesson to her attentive students.",
    "The children happily play together in the spacious park.",
    "The shiny red car moves fast along the busy road.",
    "The little boy smiles brightly when he sees his friend at school.",
    "The elderly man walks slowly with a calm and steady pace.",
    "The smart student solves difficult problems with ease.",
    "The busy mother prepares a delicious breakfast every single morning.",
    "The gentle wind blows softly, rustling the vibrant green leaves.",
    "The excited child jumps high in joyful celebration during recess.",
    "The kind teacher helps every student after class with care.",
    "The little girl reads a colorful book under a large shady tree.",
    "The brave boy climbs the tall tree with determination and skill.",
    "The attentive class listens carefully to the teacher’s detailed instructions.",
    "The calm lake reflects the clear blue sky perfectly on a sunny day.",
    "The fast train zooms past the station with remarkable speed.",
    "The playful puppy chases its tail with endless energy.",
    "The thoughtful boy generously shares his toys with his friends.",
    "The pretty garden blooms vibrantly in early spring, showcasing many colors.",
    "The girl carefully draws a detailed picture of her school.",
    "The boy eagerly practices his favorite sport every day after school.",
    "The teacher explains a complex concept in a simple and clear manner.",
    "The children work together on a creative art project with enthusiasm.",
    "The little girl writes a short poem about nature with vivid words.",
    "The boy reads a fascinating story about adventure and mystery.",
    "The teacher encourages the class to ask insightful questions during the lesson.",
    "The gentle breeze makes the leaves dance gracefully on a warm day.",
    "The child listens intently during the exciting science demonstration.",
    "The smart student completes his homework with precision and care.",
    "The class takes a quiet moment to appreciate the beautiful artwork on the wall.",
    "The girl hums a gentle tune while reading her favorite book.",
    "The boy carefully builds a model airplane for the class project.",
    "The teacher smiles as she watches her students collaborate effectively.",
    "The children cheerfully participate in the group activity with great spirit.",
    "The little girl practices her spelling words with focus and determination.",
    "The boy and his friends explore the wonders of nature during recess.",
    "The teacher explains historical events with engaging and vivid details.",
    "During the science experiment, the students observed every detail carefully.",
    "The passionate student presented his findings with clarity and confidence.",
    "After a challenging exam, the class discussed strategies to improve their study habits.",
    "The teacher introduced a new topic that sparked curiosity among the students.",
    "The art class allowed the students to experiment with different techniques.",
    "The diligent student revised his notes thoroughly before the big test.",
    "The class enjoyed a lively discussion about their favorite subjects.",
    "The creative student painted a vibrant picture of the sunset.",
    "The boy solved a challenging puzzle with creative thinking.",
    "The teacher complimented the class on their excellent teamwork.",
    "The children shared their unique ideas during a fun group discussion.",
    "The student finished his project with pride and excitement."
  ];

  const sentencesP5 = [
    "The teacher reads a fascinating story, and the children listen attentively.",
    "The boy finished his homework before dinner, so he went outside to play.",
    "The little girl happily skipped to school, and her friends cheered her on.",
    "The bright sun shines over the calm sea while a gentle breeze cools the air.",
    "The busy bees buzz around the blooming flowers as the children watch in wonder.",
    "The students study in the library and take notes carefully on every detail.",
    "The father cooks dinner, and the children eagerly help set the table.",
    "The dog barks loudly, but the cat remains calm and sleeps peacefully.",
    "The rain poured outside, yet the class continued their lesson indoors with focus.",
    "The bird sings in the morning, and the flowers open gracefully to welcome the day.",
    "The boy plays soccer while his friend rides a bicycle around the field.",
    "The teacher writes on the board, and the students copy the notes precisely.",
    "The car stops at the red light, and the driver patiently waits for the signal.",
    "The children laugh during recess, full of energy and joy.",
    "The sun sets in the west, and the sky turns a beautiful shade of orange.",
    "The little girl draws a creative picture, and her mother praises her artistic skills.",
    "The student answers the question correctly, and the teacher smiles with pride.",
    "The dog runs in the park, and the kids cheer excitedly during playtime.",
    "The wind blows gently, making the leaves rustle softly in the cool breeze.",
    "The book is open on the desk, and the student reads silently with concentration.",
    "The teacher explains a challenging concept in a clear and understandable way.",
    "The boy listens carefully to the lesson and asks thoughtful questions.",
    "The little girl practices her handwriting with neat and careful strokes.",
    "The class works together on a creative project, sharing ideas openly.",
    "The student completes his assignment with diligence and accuracy.",
    "The teacher encourages everyone to participate actively in the discussion.",
    "The children explore new topics with curiosity and excitement.",
    "The boy shares his favorite story with his classmates during circle time.",
    "The little girl uses colorful markers to draw an imaginative picture.",
    "The teacher explains the importance of teamwork during a lively discussion.",
    "The students listen intently as the teacher reads a captivating tale.",
    "The class enjoys a fun science experiment that sparks their interest.",
    "The boy carefully solves a challenging math problem on the board.",
    "The teacher provides constructive feedback on every student’s work.",
    "The children take turns presenting their projects with confidence.",
    "The little girl writes a thoughtful letter to a pen pal from another school.",
    "The class debates a current event with respect and insight.",
    "The teacher organizes a creative art session that inspires everyone.",
    "The students work on group assignments and learn from each other.",
    "The boy and his friends participate in a friendly sports competition.",
    "The teacher explains historical events with engaging details.",
    "The little girl listens carefully to a story about faraway lands.",
    "The class takes a quiet moment to appreciate the beauty of nature.",
    "The student researches a topic thoroughly and shares his findings.",
    "The teacher encourages critical thinking through interactive activities.",
    "The children learn the value of cooperation during group work.",
    "The boy practices his musical instrument with dedication and passion.",
    "The teacher leads a lively discussion on interesting scientific discoveries.",
    "The class collaborates on a creative writing assignment that sparks imagination.",
    "The student reflects on his learning journey with enthusiasm and pride."
  ];

  const sentencesP6 = [
    "After finishing his homework, the student went to the library to study more in depth.",
    "Although it was raining heavily, the children played outside happily during recess.",
    "The teacher, known for her kindness, explained the lesson in remarkable detail.",
    "Despite the heavy traffic, she arrived at school on time and greeted everyone warmly.",
    "When the bell rang, the students hurried to their classrooms with eager anticipation.",
    "Since the exam was extremely challenging, the teacher reviewed the material thoroughly afterward.",
    "Even though it was late, the boy continued reading his favorite book with great enthusiasm.",
    "While the sun was setting, the family enjoyed a delightful picnic in the park.",
    "If you study hard every day, you will achieve excellent results in your exams.",
    "After the game ended, the players celebrated their victory with cheers and applause.",
    "Although the movie was quite long, the audience remained engaged until the very end.",
    "Because the weather was unexpectedly cool, the picnic lasted longer than anticipated.",
    "Since the library was exceptionally quiet, the students concentrated deeply on their research.",
    "When the storm passed, the children went outside to play joyfully despite the damp ground.",
    "After receiving his award, the student thanked his parents for their unwavering support.",
    "Although she was extremely tired, the teacher continued to prepare engaging lessons for the class.",
    "If you practice regularly, your skills will improve significantly over time with dedication.",
    "While the bell was ringing, the students gathered in the hall to listen attentively to the announcement.",
    "Because the assignment was particularly difficult, the students worked in groups to complete it.",
    "After the concert ended, the crowd applauded enthusiastically as the performers took a bow.",
    "The student carefully analyzed the complex problem before writing down his solution.",
    "The teacher challenged the class with a thought-provoking question during the lesson.",
    "Despite the unexpected setback, the group continued working diligently on their project.",
    "The bright, clear sky inspired the students to discuss their favorite outdoor activities.",
    "In the quiet of the library, the students immersed themselves in research and learning.",
    "The teacher skillfully connected historical events to modern-day situations during the discussion.",
    "During the science experiment, the students observed and recorded every detail meticulously.",
    "The passionate student presented his findings with clarity and confidence to the class.",
    "After a challenging exam, the class discussed strategies to improve their study habits.",
    "The teacher introduced a new topic, sparking curiosity and lively debate among the students.",
    "In the art class, students experimented with different techniques to express their creativity.",
    "The diligent student revised his notes thoroughly before the upcoming test.",
    "A group of students collaborated on a project that explored the wonders of the natural world.",
    "The teacher encouraged the class to think critically about the impact of technology on society.",
    "During recess, the students engaged in a spirited game that fostered teamwork and sportsmanship.",
    "The inspiring lecture motivated the students to pursue their academic interests passionately.",
    "After a long day of learning, the students reflected on their progress and set new goals.",
    "The teacher used real-life examples to make abstract concepts more accessible.",
    "During the class discussion, every student contributed thoughtful ideas and opinions.",
    "The creative writing assignment allowed the students to express themselves through imaginative storytelling.",
    "In the music class, the students practiced their instruments with determination and precision.",
    "The teacher organized a field trip that enriched the students' understanding of history and culture.",
    "After a challenging day, the class celebrated their accomplishments with a fun educational activity.",
    "The rigorous academic schedule prepared the students for the challenges of upcoming examinations.",
    "With dedication and hard work, the students steadily improved their academic performance.",
    "The teacher provided valuable feedback that helped the students refine their skills and knowledge.",
    "During group work, the students learned the importance of communication and collaboration.",
    "The classroom buzzed with energy as the students engaged in a lively discussion about current events.",
    "By the end of the lesson, the students felt inspired to further explore the topic on their own.",
    "The dedicated student looked forward to the future with optimism and a thirst for knowledge."
  ];

  // Game variables
  const sessionLength = 5;
  let puzzles = [];
  let currentPuzzleIndex = 0;
  let score = 0;
  let currentLevel = localStorage.getItem('currentLevel') || 'p3';
  let xp = parseInt(localStorage.getItem('xp')) || 0;
  let streak = parseInt(localStorage.getItem('streak')) || 0;
  let badges = JSON.parse(localStorage.getItem('badges')) || [];
  let timeLeft = 30, timerId = null;
  let hintCount = 0;
  let currentDropZone = null;
  let lastPlayDate = localStorage.getItem('lastPlayDate');
  const today = new Date().toDateString();
  if (lastPlayDate && lastPlayDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastPlayDate !== yesterday.toDateString()) streak = 0;
  }

  // Utilities
  const shuffle = array => array.sort(() => Math.random() - 0.5);
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
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
    updateGamificationPanel();
  };

  // Check Completion
  const checkCompletion = () => {
    if (!currentDropZone) return;
    const totalWords = puzzles[currentPuzzleIndex].correct.length;
    const droppedWords = currentDropZone.children.length;
    elements.submitBtn.disabled = droppedWords !== totalWords;
    elements.submitBtn.style.opacity = elements.submitBtn.disabled ? "0.5" : "1";
    console.log(`Check Completion - Dropped: ${droppedWords}, Total: ${totalWords}, Button Enabled: ${!elements.submitBtn.disabled}`);
  };

  // Display Puzzle
  const displayCurrentPuzzle = () => {
    elements.puzzleContainer.innerHTML = "";
    elements.hint.textContent = "";
    elements.successMessage.textContent = "";
    stopTimer();
    elements.submitBtn.style.display = "inline-block";
    elements.tryAgainBtn.style.display = "none";

    if (currentPuzzleIndex >= puzzles.length) {
      elements.puzzleContainer.innerHTML = "<p>Well done! Session complete!</p>";
      speak("Well done! You finished the session!");
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

    [wordBank, currentDropZone].forEach(zone => {
      zone.addEventListener("dragover", handleDragOver);
      zone.addEventListener("dragleave", handleDragLeave);
      zone.addEventListener("drop", handleDrop);
    });

    if (!puzzle.submitted) {
      const wordsShuffled = shuffle([...puzzle.correct]);
      wordsShuffled.forEach(word => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word";
        wordDiv.setAttribute("role", "listitem");
        wordDiv.tabIndex = 0;
        wordDiv.textContent = word;
        if (window.PointerEvent) {
          wordDiv.addEventListener("pointerdown", handlePointerDown);
          wordDiv.draggable = false;
        } else {
          wordDiv.draggable = true;
          wordDiv.addEventListener("dragstart", handleDragStart);
          wordDiv.addEventListener("dragend", handleDragEnd);
        }
        wordDiv.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            currentDropZone.appendChild(wordDiv);
            checkCompletion();
            wordDiv.focus();
          }
        });
        wordBank.appendChild(wordDiv);
      });
    } else {
      puzzle.userAnswer.forEach((word, index) => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word";
        wordDiv.textContent = word;
        wordDiv.classList.add(word === puzzle.correct[index] ? "correct" : "incorrect");
        if (word !== puzzle.correct[index]) {
          wordDiv.setAttribute("data-tooltip", getWordRole(puzzle.correct[index]));
          wordDiv.addEventListener("click", () => handleWordClick(wordDiv, index));
          wordDiv.draggable = true; // Allow re-dragging within drop zone
          wordDiv.addEventListener("dragstart", handleDragStart);
          wordDiv.addEventListener("dragend", handleDragEnd);
        }
        wordDiv.tabIndex = 0;
        currentDropZone.appendChild(wordDiv);
      });
      elements.submitBtn.style.display = "none";
      elements.tryAgainBtn.style.display = "inline-block";
    }

    elements.puzzleContainer.appendChild(container);
    timeLeft = 30;
    startTimer();
    checkCompletion();
    elements.progress.textContent = `Puzzle ${currentPuzzleIndex + 1} of ${sessionLength}${document.getElementById("timer-mode").checked ? ` - Time: ${timeLeft}s` : ""}`;
    elements.score.textContent = `Score: ${score}`;
    elements.progressBar.style.width = `${((currentPuzzleIndex + 1) / sessionLength) * 100}%`;
  };

  // Helper to determine word role for tooltip
  const getWordRole = (word) => {
    if (/^[A-Z]/.test(word)) return "This is the subject.";
    if (word.match(/^(is|was|are|runs|jumps|eats)/)) return "This is the verb.";
    if (word.match(/\.$/)) return "This ends the sentence.";
    return "This is part of the sentence.";
  };

  // Handle clicking incorrect words
  const handleWordClick = (wordDiv, currentIndex) => {
    const puzzle = puzzles[currentPuzzleIndex];
    const correctIndex = puzzle.correct.indexOf(wordDiv.textContent);
    if (correctIndex !== -1 && correctIndex !== currentIndex) {
      const targetWord = currentDropZone.children[correctIndex];
      currentDropZone.insertBefore(wordDiv, targetWord);
      checkCompletion();
    }
  };

  // Drag-and-Drop Handlers
  let draggedItem = null;
  const handleDragStart = (e) => {
    draggedItem = e.target;
    e.target.style.opacity = "0.5";
    e.dataTransfer.setData("text/plain", e.target.textContent);
  };
  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.currentTarget.classList.contains("drop-zone")) {
      e.currentTarget.classList.add("active");
    }
  };
  const handleDragLeave = (e) => {
    if (e.currentTarget.classList.contains("drop-zone")) {
      e.currentTarget.classList.remove("active");
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.classList.contains("drop-zone") && draggedItem) {
      e.currentTarget.classList.remove("active");
      const dropIndex = Array.from(e.currentTarget.children).indexOf(draggedItem);
      if (dropIndex === -1) {
        e.currentTarget.appendChild(draggedItem);
      }
      gsap.fromTo(draggedItem, { opacity: 0, scale: 0.8 }, { duration: 0.3, opacity: 1, scale: 1 });
      checkCompletion();
    }
  };

  let pointerDragItem = null, pointerOffsetX = 0, pointerOffsetY = 0;
  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    pointerDragItem = e.currentTarget;
    pointerDragItem.setPointerCapture(e.pointerId);
    pointerDragItem.style.opacity = "0.7";
    pointerDragItem.style.zIndex = "1000";
    const rect = pointerDragItem.getBoundingClientRect();
    pointerOffsetX = e.clientX - rect.left;
    pointerOffsetY = e.clientY - rect.top;
  };
  const handlePointerMove = (e) => {
    if (!pointerDragItem) return;
    pointerDragItem.style.position = "absolute";
    pointerDragItem.style.left = `${e.clientX - pointerOffsetX}px`;
    pointerDragItem.style.top = `${e.clientY - pointerOffsetY}px`;
    e.preventDefault();
  };
  const handlePointerUp = (e) => {
    if (!pointerDragItem) return;
    pointerDragItem.releasePointerCapture(e.pointerId);
    pointerDragItem.style.opacity = "1";
    const originalDisplay = pointerDragItem.style.display;
    pointerDragItem.style.display = "none";
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    pointerDragItem.style.display = originalDisplay;
    let validDropZone = dropTarget;
    while (validDropZone && !validDropZone.classList.contains("drop-zone")) {
      validDropZone = validDropZone.parentElement;
    }
    if (validDropZone) {
      validDropZone.appendChild(pointerDragItem);
      gsap.fromTo(pointerDragItem, { opacity: 0, scale: 0.8 }, { duration: 0.3, opacity: 1, scale: 1 });
      currentDropZone = validDropZone;
      checkCompletion();
    }
    pointerDragItem.style.position = "";
    pointerDragItem.style.left = "";
    pointerDragItem.style.top = "";
    pointerDragItem.style.zIndex = "";
    pointerDragItem = null;
  };
  if (window.PointerEvent) {
    document.addEventListener("pointermove", debounce(handlePointerMove, 10));
    document.addEventListener("pointerup", handlePointerUp);
  }

  // Timer Logic
  const startTimer = () => {
    if (!document.getElementById("timer-mode").checked) return;
    timerId = setInterval(() => {
      timeLeft--;
      elements.progress.textContent = `Puzzle ${currentPuzzleIndex + 1} of ${sessionLength} - Time: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerId);
        submitAnswer();
        nextPuzzle();
      }
    }, 1000);
  };
  const stopTimer = () => clearInterval(timerId);

  // Gamification
  function updateGamificationPanel() {
    elements.xpDisplay.textContent = `XP: ${xp}`;
    elements.streakDisplay.textContent = `Streak: ${streak}`;
    elements.badgesList.textContent = badges.join(', ');
    localStorage.setItem('xp', xp);
    localStorage.setItem('streak', streak);
    localStorage.setItem('badges', JSON.stringify(badges));
    localStorage.setItem('lastPlayDate', today);
    localStorage.setItem('currentLevel', currentLevel);
  }

  function displayConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.backgroundColor = getRandomColor();
      confettiContainer.appendChild(confetti);
    }
    setTimeout(() => confettiContainer.remove(), 5000);
  }
  function getRandomColor() {
    return ['#ff6f61', '#ff9f1c', '#ffcc00', '#98fb98', '#40c4ff'][Math.floor(Math.random() * 5)];
  }

  function animateSuccessMessage() {
    gsap.fromTo(elements.successMessage, { scale: 0, opacity: 0 }, { duration: 0.6, scale: 1, opacity: 1, ease: "bounce.out" });
  }

  // Hint & Submission
  const showHint = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    if (!puzzle.submitted) {
      if (hintCount === 0) {
        hintCount++;
        elements.hint.textContent = `Hint 1: Start with "${puzzle.correct[0]}"`;
        speak(`Hint: Start with ${puzzle.correct[0]}`);
      } else if (hintCount === 1) {
        hintCount++;
        elements.hint.textContent = "Hint 2: Use Subject-Verb-Object order.";
        speak("Hint: Use Subject-Verb-Object order.");
      } else {
        elements.hint.textContent = "No more hints!";
      }
      xp -= hintCount * 2;
      updateGamificationPanel();
    }
  };

  const submitAnswer = () => {
    console.log("Submit Answer clicked");
    const puzzle = puzzles[currentPuzzleIndex];
    puzzle.attempts++;
    localStorage.setItem(`puzzle_${currentPuzzleIndex}_attempts`, puzzle.attempts);
    if (!currentDropZone) return;
    const userWords = Array.from(currentDropZone.children).map(word => word.textContent);
    if (userWords.length !== puzzle.correct.length) return;

    puzzle.submitted = true;
    const userWordsAdjusted = userWords.map((word, idx) => 
      idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
    );
    const needsPunctuation = !/[.!?]/.test(userWordsAdjusted[userWordsAdjusted.length - 1]);
    puzzle.userAnswer = userWordsAdjusted;
    const isCorrect = userWordsAdjusted.join(" ") === puzzle.correct.join(" ");

    Array.from(currentDropZone.children).forEach((wordElem, index) => {
      wordElem.classList.remove("correct", "incorrect");
      wordElem.classList.add(wordElem.textContent === puzzle.correct[index] ? "correct" : "incorrect");
    });

    if (isCorrect && !needsPunctuation) {
      score++;
      streak++;
      xp += 10 + (document.getElementById("timer-mode").checked ? Math.floor(timeLeft / 5) : 0);
      if (!badges.includes("First Win")) badges.push("First Win");
      if (streak === 5 && !badges.includes("Perfect Streak 5")) badges.push("Perfect Streak 5");
      if (score === sessionLength && !badges.includes("Level Master")) badges.push("Level Master");
      document.getElementById("success-sound").play();
      speak(`Great job! The sentence is: ${puzzle.correct.join(" ")}`);
      elements.successMessage.textContent = "✓ Yay! You got it!";
      animateSuccessMessage();
      displayConfetti();
      setTimeout(() => elements.successMessage.textContent = "", 3000);
    } else {
      document.getElementById("error-sound").play();
      streak = 0;
      let feedback = "Oops, not quite! Click the red words to fix them.";
      if (needsPunctuation) feedback += " Add a period or question mark.";
      speak(`${feedback} The correct sentence is: ${puzzle.correct.join(" ")}`);
      elements.hint.textContent = feedback;
    }
    updateGamificationPanel();
    displayCurrentPuzzle();
  };

  const tryAgain = () => {
    const puzzle = puzzles[currentPuzzleIndex];
    puzzle.submitted = false;
    puzzle.userAnswer = [];
    hintCount = 0;
    displayCurrentPuzzle();
  };

  // Navigation
  const nextPuzzle = () => {
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
        speak(`Wow! Moving up to ${currentLevel.toUpperCase()}!`);
        alert(`Great job! Moving up to ${currentLevel.toUpperCase()}!`);
        resetQuiz();
      } else {
        speak("Amazing! You’ve mastered all levels!");
        alert("Congratulations! You've mastered all levels!");
      }
    } else {
      speak("Session complete! Good work!");
      alert("Session complete! You finished 5 puzzles.");
    }
  };

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

  const resetQuiz = () => {
    generatePuzzles();
    const levelColors = { p1: '#ff6f61', p2: '#ff9f1c', p3: '#ffcc00', p4: '#98fb98', p5: '#40c4ff', p6: '#ff69b4' };
    document.documentElement.style.setProperty('--primary-color', levelColors[currentLevel]);
    displayCurrentPuzzle();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => console.warn(err));
    else document.exitFullscreen();
  };

  // Event Listeners
  document.getElementById("listen-instructions-btn").addEventListener("click", () => speak(document.querySelector("p.instructions").textContent));
  document.getElementById("hint-btn").addEventListener("click", showHint);
  elements.submitBtn.addEventListener("click", submitAnswer);
  elements.tryAgainBtn.addEventListener("click", tryAgain);
  document.getElementById("next-btn").addEventListener("click", nextPuzzle);
  document.getElementById("prev-btn").addEventListener("click", prevPuzzle);
  document.getElementById("reset-btn").addEventListener("click", resetQuiz);
  document.getElementById("level-select").addEventListener("change", (e) => {
    currentLevel = e.target.value;
    resetQuiz();
  });
  document.getElementById("fullscreen-btn").addEventListener("click", toggleFullScreen);
  document.getElementById("theme-toggle").addEventListener("click", () => document.body.classList.toggle("light-theme"));

  document.addEventListener("DOMContentLoaded", () => {
    generatePuzzles();
    displayCurrentPuzzle();
  });
})();
