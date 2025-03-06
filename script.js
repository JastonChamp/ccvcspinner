'use strict';

(() => {
  class Game {
    constructor() {
      this.sessionLength = 10;
      this.puzzles = [];
      this.currentPuzzleIndex = 0;
      this.score = 0;
      this.currentLevel = localStorage.getItem('currentLevel') || 'p3';
      this.xp = parseInt(localStorage.getItem('xp')) || 0;
      this.streak = this.checkStreak();
      this.badges = JSON.parse(localStorage.getItem('badges')) || [];
      this.timeLeft = 30;
      this.timerId = null;
      this.hintCount = 0;
      this.puzzleAttempts = 0;
      this.correctCount = 0;
      this.sentences = {
        p1: [
          'Doreen had a huge birthday party.',
          'We can go out to play.',
          'The boy was chased by a dog.',
          'Would you like to have lunch now?',
          'The house was empty and quiet.',
          'I have a small red ball.',
          'My cat sleeps on the warm mat.',
          'The teacher reads a fun story.',
          'The dog runs fast in the park.',
          'I love to draw colorful pictures.',
          'The sun is shining brightly.',
          'My friend is kind and gentle.',
          'We play games during recess.',
          'The bird sings a sweet song.',
          'I like to eat ice cream.',
          'The tree is tall and green.',
          'The girl wears a blue dress.',
          'The boy rides a small bicycle.',
          'My mom cooks tasty food.',
          'The puppy barks at the mailman.',
          'Ali plays soccer with his friends.',
          'Maria dances at the festival.',
          'Juan paints a bright mural.',
          'Aisha shares her books with classmates.'
        ],
        p2: [
          'It was raining very heavily this morning.',
          'All students should obey the school rules.',
          'It was so cold that I could not stop shivering.',
          'Which of these activities do you enjoy doing?',
          'The teacher explained the lesson clearly and patiently.',
          'My friend always helps me with my homework.',
          'The cat quietly slept on the soft cushion.',
          'We often play games during our lunch break.',
          'The dog eagerly fetched the ball in the yard.',
          'The students listened carefully to the principal\'s announcement.',
          'My mother prepared a delicious meal for dinner.',
          'The library was quiet and full of interesting books.',
          'I carefully completed all my assignments on time.',
          'The children enjoyed a fun and educational field trip.',
          'The weather was so warm that we decided to have a picnic.',
          'The boy happily rode his bicycle to school.',
          'The girl carefully painted a beautiful picture.',
          'The teacher asked a challenging question during the lesson.',
          'Our class worked together to solve a difficult problem.',
          'I felt excited as I opened my new book.',
          'Hiro reads a story about Japan.',
          'Fatima shares dates with her class.',
          'Luka sings a song from Croatia.',
          'Priya learns a dance from India.'
        ],
        p3: [
          'The boy eats an apple during recess.',
          'The girl plays with a shiny toy in class.',
          'The dog chases the ball across the field.',
          'The teacher reads an interesting story to the students.',
          'The cat drinks milk from a small bowl.',
          'The boy kicks the ball with great enthusiasm.',
          'The girl draws a colorful picture on the board.',
          'The dog barks at the stranger outside.',
          'The student writes a letter to his best friend.',
          'The mother cooks dinner for the family.',
          'The father drives a car on busy roads.',
          'The boy catches a slippery frog near the pond.',
          'The girl rides her bicycle along the busy street.',
          'The dog fetches a stick in the backyard.',
          'The teacher explains the lesson clearly to the class.',
          'The child opens the door to let in the sunshine.',
          'The boy climbs a tall tree in the park.',
          'The girl sings a sweet song during assembly.',
          'The cat chases a little mouse in the garden.',
          'The student solves a challenging puzzle.',
          'Kofi builds a sandcastle at the beach.',
          'Mei paints a dragon for the festival.',
          'Omar kicks a ball in the park.',
          'Sana writes a poem for her teacher.'
        ],
        p4: [
          'The cheerful girl sings beautifully during the assembly.',
          'The boy quickly runs to school, eager to learn.',
          'The teacher patiently explains the lesson to her attentive students.',
          'The children happily play together in the spacious park.',
          'The shiny red car moves fast along the busy road.',
          'The little boy smiles brightly when he sees his friend at school.',
          'The elderly man walks slowly with a calm and steady pace.',
          'The smart student solves difficult problems with ease.',
          'The busy mother prepares a delicious breakfast every single morning.',
          'The gentle wind blows softly, rustling the vibrant green leaves.',
          'The excited child jumps high in joyful celebration during recess.',
          'The kind teacher helps every student after class with care.',
          'The little girl reads a colorful book under a large shady tree.',
          'The brave boy climbs the tall tree with determination and skill.',
          'The attentive class listens carefully to the teacher’s detailed instructions.',
          'The calm lake reflects the clear blue sky perfectly on a sunny day.',
          'The fast train zooms past the station with remarkable speed.',
          'The playful puppy chases its tail with endless energy.',
          'The thoughtful boy generously shares his toys with his friends.',
          'The pretty garden blooms vibrantly in early spring, showcasing many colors.',
          'Nia plays a drum from her culture.',
          'Santiago flies a kite with his brother.',
          'Amina draws a picture of her family.',
          'Chen learns to cook dumplings with grandma.'
        ],
        p5: [
          'The teacher reads a fascinating story, and the children listen attentively.',
          'The boy finished his homework before dinner, so he went outside to play.',
          'The little girl happily skipped to school, and her friends cheered her on.',
          'The bright sun shines over the calm sea while a gentle breeze cools the air.',
          'The busy bees buzz around the blooming flowers as the children watch in wonder.',
          'The students study in the library and take notes carefully on every detail.',
          'The father cooks dinner, and the children eagerly help set the table.',
          'The dog barks loudly, but the cat remains calm and sleeps peacefully.',
          'The rain poured outside, yet the class continued their lesson indoors with focus.',
          'The bird sings in the morning, and the flowers open gracefully to welcome the day.',
          'The boy plays soccer while his friend rides a bicycle around the field.',
          'The teacher writes on the board, and the students copy the notes precisely.',
          'The car stops at the red light, and the driver patiently waits for the signal.',
          'The children laugh during recess, full of energy and joy.',
          'The sun sets in the west, and the sky turns a beautiful shade of orange.',
          'The little girl draws a creative picture, and her mother praises her artistic skills.',
          'The student answers the question correctly, and the teacher smiles with pride.',
          'The dog runs in the park, and the kids cheer excitedly during playtime.',
          'The wind blows gently, making the leaves rustle softly in the cool breeze.',
          'The book is open on the desk, and the student reads silently with concentration.',
          'Zara sings a song from her homeland.',
          'Diego helps his dad with the garden.',
          'Leila paints a picture of her cat.',
          'Ravi plays cricket with his cousins.'
        ],
        p6: [
          'After finishing his homework, the student went to the library to study more in depth.',
          'Although it was raining heavily, the children played outside happily during recess.',
          'The teacher, known for her kindness, explained the lesson in remarkable detail.',
          'Despite the heavy traffic, she arrived at school on time and greeted everyone warmly.',
          'When the bell rang, the students hurried to their classrooms with eager anticipation.',
          'Since the exam was extremely challenging, the teacher reviewed the material thoroughly afterward.',
          'Even though it was late, the boy continued reading his favorite book with great enthusiasm.',
          'While the sun was setting, the family enjoyed a delightful picnic in the park.',
          'If you study hard every day, you will achieve excellent results in your exams.',
          'After the game ended, the players celebrated their victory with cheers and applause.',
          'Although the movie was quite long, the audience remained engaged until the very end.',
          'Because the weather was unexpectedly cool, the picnic lasted longer than anticipated.',
          'Since the library was exceptionally quiet, the students concentrated deeply on their research.',
          'When the storm passed, the children went outside to play joyfully despite the damp ground.',
          'After receiving his award, the student thanked his parents for their unwavering support.',
          'Although she was extremely tired, the teacher continued to prepare engaging lessons for the class.',
          'If you practice regularly, your skills will improve significantly over time with dedication.',
          'While the bell was ringing, the students gathered in the hall to listen attentively to the announcement.',
          'Because the assignment was particularly difficult, the students worked in groups to complete it.',
          'After the concert ended, the crowd applauded enthusiastically as the performers took a bow.',
          'Anya writes a story about her travels.',
          'Mateo builds a model of a rocket.',
          'Sofia learns about her family history.',
          'Jamil shares a recipe from his culture.'
        ]
      };
    }

    checkStreak() {
      const today = new Date().toDateString();
      const lastPlay = localStorage.getItem('lastPlayDate');
      if (!lastPlay || lastPlay !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return lastPlay === yesterday.toDateString() ? parseInt(localStorage.getItem('streak')) || 0 : 0;
      }
      return parseInt(localStorage.getItem('streak')) || 0;
    }

    shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    }

    generatePuzzles() {
      const sentencePool = this.sentences[this.currentLevel] || this.sentences.p3;
      const selectedSentences = this.shuffle([...sentencePool]).slice(0, this.sessionLength);
      this.puzzles = selectedSentences.map(sentence => ({
        correct: sentence.split(' '),
        submitted: false,
        userAnswer: [],
        attempts: 0
      }));
      this.currentPuzzleIndex = 0;
      this.score = 0;
      this.puzzleAttempts = 0;
      this.correctCount = 0;
      this.hintCount = 0;
    }

    getWordRole(word, index, correctSentence) {
      const commonVerbs = new Set([
        'is', 'was', 'were', 'are', 'runs', 'eats', 'sings', 'sleeps', 'reads', 'writes', 'explained',
        'listened', 'chased', 'had', 'play', 'draws', 'decided', 'enjoyed', 'prepared', 'helped',
        'finished', 'stopped', 'jumps', 'builds', 'climbs', 'solves', 'shares', 'flies', 'falls',
        'barks', 'purrs', 'rides', 'skips', 'claps', 'fetch', 'wags', 'does', 'do', 'did', 'will',
        'shall', 'can', 'might', 'should', 'would'
      ]);
      if (index === 0 && /^[A-Z]/.test(word)) return 'subject';
      if (commonVerbs.has(word.toLowerCase())) return 'verb';
      if (index > 1 && !/[.!?]/.test(word) && /^[a-zA-Z\s]+$/.test(word) && !commonVerbs.has(word.toLowerCase())) return 'object';
      if (word.match(/[.!?]$/)) return 'end';
      return 'other';
    }

    startTimer(ui) {
      if (!document.getElementById('timer-mode').checked) return;
      this.stopTimer();
      this.timeLeft = 30;
      this.timerId = setInterval(() => {
        this.timeLeft--;
        ui.updateProgress(this);
        if (this.timeLeft <= 0) {
          this.stopTimer();
          ui.submitAnswer(this);
          ui.nextPuzzle(this);
        }
      }, 1000);
    }

    stopTimer() {
      if (this.timerId) clearInterval(this.timerId);
    }

    updateLocalStorage() {
      localStorage.setItem('xp', this.xp);
      localStorage.setItem('streak', this.streak);
      localStorage.setItem('badges', JSON.stringify(this.badges));
      localStorage.setItem('lastPlayDate', new Date().toDateString());
      localStorage.setItem('currentLevel', this.currentLevel);
    }
  }

  class UI {
    constructor() {
      this.elements = {
        puzzleContainer: document.getElementById('puzzle-container'),
        hint: document.getElementById('hint'),
        successMessage: document.getElementById('success-message'),
        progress: document.getElementById('progress'),
        score: document.getElementById('score'),
        progressBar: document.getElementById('progress-bar'),
        progressLabel: document.getElementById('progress-label'),
        xpDisplay: document.getElementById('xp-display'),
        streakDisplay: document.getElementById('streak-display'),
        badgesList: document.getElementById('badges-list'),
        submitBtn: document.getElementById('submit-btn'),
        tryAgainBtn: document.getElementById('try-again-btn'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        hintBtn: document.getElementById('hint-btn'),
        clearBtn: document.getElementById('clear-btn'),
        progressIndicator: document.getElementById('progress-indicator'),
        successSound: document.getElementById('success-sound'),
        errorSound: document.getElementById('error-sound')
      };
      this.currentDropZone = null;
      this.draggedItem = null;
    }

    createElement(tag, className, attrs = {}) {
      const el = document.createElement(tag);
      el.className = className;
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      return el;
    }

    createWord(word, correctSentence, index = -1) {
      const wordDiv = this.createElement('div', 'word', { role: 'listitem', tabindex: 0 });
      wordDiv.textContent = word;
      wordDiv.draggable = true;
      const role = game.getWordRole(word, correctSentence.indexOf(word), correctSentence);
      wordDiv.dataset.role = role;
      wordDiv.classList.add(role);
      if (index >= 0) wordDiv.classList.add(word === correctSentence[index] ? 'correct' : 'incorrect');
      ['dragstart', 'dragend', 'mouseover', 'mouseout', 'touchstart', 'keydown'].forEach(event =>
        wordDiv.addEventListener(event, this.handleEvents[event].bind(this))
      );
      return wordDiv;
    }

    createZone(className, ariaLabel) {
      const zone = this.createElement('div', className, { 'aria-label': ariaLabel, role: 'list' });
      zone.style.display = 'grid';
      zone.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
      zone.style.gap = '20px';
      ['dragover', 'dragleave', 'drop'].forEach(event =>
        zone.addEventListener(event, this.handleEvents[event].bind(this))
      );
      return zone;
    }

    displayCurrentPuzzle(game) {
      this.elements.puzzleContainer.innerHTML = '';
      this.elements.hint.textContent = '';
      this.elements.successMessage.textContent = '';
      game.stopTimer();
      this.elements.submitBtn.style.display = 'inline-block';
      this.elements.tryAgainBtn.style.display = 'none';
      this.elements.prevBtn.style.display = 'inline-block';
      this.elements.nextBtn.style.display = 'inline-block';
      this.elements.hintBtn.style.display = 'inline-block';
      this.elements.clearBtn.style.display = 'inline-block';

      if (game.currentPuzzleIndex >= game.puzzles.length) {
        const masteryAchieved = game.puzzleAttempts >= game.sessionLength && game.correctCount / game.puzzleAttempts >= 0.8;
        const message = masteryAchieved
          ? 'Well done! You’ve mastered this level! Ready for a review?'
          : 'Keep practicing! You need more tries to master this level.';
        this.elements.puzzleContainer.innerHTML = `<p>${message}</p>`;
        speak(message);
        masteryAchieved ? this.startReviewSession(game) : game.generatePuzzles();
        game.updateLocalStorage();
        return;
      }

      const puzzle = game.puzzles[game.currentPuzzleIndex];
      const container = this.createElement('div', 'sentence-container');
      container.appendChild(this.createElement('h3', '', { innerText: `Puzzle ${game.currentPuzzleIndex + 1} of ${game.sessionLength}` }));

      const wordBank = this.createZone('word-bank', 'Word Bank');
      const dropZone = (this.currentDropZone = this.createZone('drop-zone', 'Drop Zone'));

      container.append(wordBank, dropZone);
      this.elements.puzzleContainer.appendChild(container);

      if (!puzzle.submitted) {
        game.shuffle([...puzzle.correct]).forEach(word => {
          const wordDiv = this.createWord(word, puzzle.correct);
          wordBank.appendChild(wordDiv);
        });
        if (!dropZone.children.length) {
          dropZone.appendChild(this.createElement('div', 'drop-placeholder', { innerText: 'Drag words here to build your sentence!', style: 'color: #666; font-style: italic;' }));
        }
      } else {
        puzzle.userAnswer.forEach((word, index) => {
          const wordDiv = this.createWord(word, puzzle.correct, index);
          if (wordDiv.classList.contains('incorrect')) {
            wordDiv.addEventListener('click', () => this.rearrangeToCorrect(index, game));
          }
          dropZone.appendChild(wordDiv);
        });
        this.elements.submitBtn.style.display = 'none';
        this.elements.tryAgainBtn.style.display = 'inline-block';
      }

      game.startTimer(this);
      this.checkCompletion();
      this.updateProgress(game);
    }

    checkCompletion() {
      if (!this.currentDropZone) return;
      const totalWords = game.puzzles[game.currentPuzzleIndex].correct.length;
      const droppedWords = this.currentDropZone.children.length;
      this.elements.submitBtn.disabled = droppedWords !== totalWords;
      this.elements.submitBtn.style.backgroundColor = this.elements.submitBtn.disabled ? '#cccccc' : '#4CAF50';
    }

    updateProgress(game) {
      this.elements.progress.textContent = `Puzzle ${game.currentPuzzleIndex + 1} of ${game.sessionLength}${document.getElementById('timer-mode').checked ? ` - Time: ${game.timeLeft}s` : ''}`;
      this.elements.score.textContent = `Score: ${game.score}`;
      this.elements.progressBar.style.width = `${((game.currentPuzzleIndex + 1) / game.sessionLength) * 100}%`;
      this.elements.progressIndicator.textContent = `Mastery Progress: ${game.puzzleAttempts > 0 ? Math.round((game.correctCount / game.puzzleAttempts) * 100) : 0}% (80% to advance)`;
      this.elements.progressLabel.innerHTML = `<img src="images/star.png" alt="Star" class="progress-icon"> Puzzle ${game.currentPuzzleIndex + 1}/${game.sessionLength}`;
    }

    updateGamificationPanel(game) {
      this.elements.xpDisplay.textContent = `XP: ${game.xp}`;
      this.elements.streakDisplay.textContent = `Streak: ${game.streak}`;
      this.elements.badgesList.innerHTML = game.badges
        .map(badge => `<img src="images/${badge.toLowerCase().replace(' ', '-')}.png" alt="${badge}" class="badge-icon">`)
        .join(' ') || 'None';
      game.updateLocalStorage();
    }

    showHint(game) {
      const puzzle = game.puzzles[game.currentPuzzleIndex];
      if (!puzzle.submitted) {
        const wordBankWords = Array.from(document.querySelectorAll('.word-bank .word'));
        if (game.hintCount < 3) {
          game.hintCount++;
          const hintType = ['subject', 'verb', 'object'][game.hintCount - 1];
          const hintWord = puzzle.correct[puzzle.correct.findIndex(w => game.getWordRole(w, puzzle.correct.indexOf(w), puzzle.correct) === hintType)];
          if (hintWord) {
            this.elements.hint.textContent = `${{ subject: 'Who does it?', verb: 'What happens?', object: 'What’s it about?' }[hintType]} The ${hintType} is "${hintWord}".`;
            speak(`${{ subject: 'Who does it?', verb: 'What happens?', object: 'What’s it about?' }[hintType]} The ${hintType} is ${hintWord}.`);
            wordBankWords.forEach(word => {
              if (word.textContent === hintWord) {
                word.classList.add(`hint-${hintType}`);
                setTimeout(() => word.classList.remove(`hint-${hintType}`), 3000);
              }
            });
          } else {
            this.elements.hint.textContent = `No ${hintType} found! Try building the sentence.`;
            speak(`No ${hintType} found! Try building the sentence.`);
          }
          game.xp -= game.hintCount * 2;
          this.updateGamificationPanel(game);
        } else {
          this.elements.hint.textContent = 'No more hints! You can do it!';
          speak('No more hints! You can do it!');
        }
      }
    }

    submitAnswer(game) {
      const puzzle = game.puzzles[game.currentPuzzleIndex];
      puzzle.attempts++;
      game.puzzleAttempts++;
      const userWords = Array.from(this.currentDropZone.children).map(w => w.textContent);
      puzzle.submitted = true;
      const userWordsAdjusted = userWords.map((word, idx) =>
        idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
      );
      const needsPunctuation = !/[.!?]$/.test(userWordsAdjusted[userWordsAdjusted.length - 1]);
      puzzle.userAnswer = userWordsAdjusted;
      const isCorrect = userWordsAdjusted.join(' ') === puzzle.correct.join(' ');

      Array.from(this.currentDropZone.children).forEach((wordElem, index) => {
        wordElem.classList.remove('correct', 'incorrect');
        wordElem.classList.add(wordElem.textContent === puzzle.correct[index] ? 'correct' : 'incorrect');
        if (wordElem.classList.contains('incorrect')) {
          wordElem.addEventListener('click', () => this.rearrangeToCorrect(index, game));
        }
      });

      if (isCorrect && !needsPunctuation) {
        game.score++;
        game.correctCount++;
        game.streak++;
        game.xp += 10 + (document.getElementById('timer-mode').checked ? Math.floor(game.timeLeft / 5) : 0);
        if (!game.badges.includes('First Win')) game.badges.push('First Win');
        if (game.streak === 5 && !game.badges.includes('Perfect Streak 5')) game.badges.push('Perfect Streak 5');
        if (game.score === game.sessionLength && !game.badges.includes('Level Master')) game.badges.push('Level Master');
        this.elements.successSound.play();
        speak(`Great job! The sentence is: ${puzzle.correct.join(' ')}`);
        this.elements.successMessage.textContent = '✓ Yay! You got it!';
        gsap.fromTo(this.elements.successMessage, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'bounce.out' });
        this.displayConfetti();
        setTimeout(() => (this.elements.successMessage.textContent = ''), 3000);
      } else {
        this.elements.errorSound.play();
        game.streak = 0;
        let feedback = 'Oops, not quite! ';
        if (!isCorrect) feedback += 'Check your word order. ';
        if (needsPunctuation) feedback += 'Add a period or question mark. ';
        if (!isCorrect && userWordsAdjusted[0] !== puzzle.correct[0]) feedback += 'Start with the subject! ';
        if (!isCorrect && userWordsAdjusted.findIndex(w => game.getWordRole(w, userWordsAdjusted.indexOf(w), userWordsAdjusted) === 'verb') !==
          puzzle.correct.findIndex(w => game.getWordRole(w, puzzle.correct.indexOf(w), puzzle.correct) === 'verb'))
          feedback += 'The verb might be misplaced! ';
        speak(feedback);
        this.elements.hint.textContent = feedback;
      }
      this.displayCurrentPuzzle(game);
      this.updateGamificationPanel(game);
    }

    rearrangeToCorrect(index, game) {
      const puzzle = game.puzzles[game.currentPuzzleIndex];
      const correctWord = puzzle.correct[index];
      const currentWordDiv = this.currentDropZone.children[index];
      if (currentWordDiv && currentWordDiv.classList.contains('incorrect')) {
        gsap.to(currentWordDiv, {
          duration: 0.5,
          opacity: 0,
          scale: 0.5,
          onComplete: () => {
            currentWordDiv.textContent = correctWord;
            currentWordDiv.classList.remove('incorrect');
            currentWordDiv.classList.add('correct');
            gsap.fromTo(currentWordDiv, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5 });
            speak(`Corrected to: ${correctWord} at position ${index + 1}.`);
            this.elements.hint.textContent = `Corrected to: ${correctWord} at position ${index + 1}. The right order is ${puzzle.correct.join(' ')}.`;
          }
        });
        puzzle.userAnswer[index] = correctWord;
        if (puzzle.userAnswer.join(' ') === puzzle.correct.join(' ')) {
          game.score++;
          game.correctCount++;
          game.streak++;
          game.xp += 5;
          if (!game.badges.includes('Self-Corrector') && game.streak >= 3) game.badges.push('Self-Corrector');
          this.elements.successSound.play();
          this.elements.successMessage.textContent = '✓ Great job fixing it!';
          gsap.fromTo(this.elements.successMessage, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'bounce.out' });
          this.displayConfetti();
          setTimeout(() => (this.elements.successMessage.textContent = ''), 3000);
        }
        this.updateGamificationPanel(game);
      }
    }

    tryAgain(game) {
      const puzzle = game.puzzles[game.currentPuzzleIndex];
      puzzle.submitted = false;
      puzzle.userAnswer = [];
      game.hintCount = 0;
      this.displayCurrentPuzzle(game);
    }

    nextPuzzle(game) {
      if (game.currentPuzzleIndex < game.puzzles.length - 1) {
        game.currentPuzzleIndex++;
        game.hintCount = 0;
        this.displayCurrentPuzzle(game);
      } else if (game.puzzleAttempts >= game.sessionLength && game.correctCount / game.puzzleAttempts >= 0.8) {
        const levels = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
        const nextLevelIndex = levels.indexOf(game.currentLevel) + 1;
        if (nextLevelIndex < levels.length) {
          game.currentLevel = levels[nextLevelIndex];
          document.getElementById('level-select').value = game.currentLevel;
          speak(`Wow! Moving up to ${game.currentLevel.toUpperCase()}!`);
          alert(`Great job! Moving up to ${game.currentLevel.toUpperCase()}!`);
          game.generatePuzzles();
          this.displayCurrentPuzzle(game);
        } else {
          speak('Amazing! You’ve mastered all levels!');
          alert('Congratulations! You\'ve mastered all levels!');
        }
      } else {
        game.generatePuzzles();
        this.displayCurrentPuzzle(game);
        speak('Keep practicing to master this level!');
      }
    }

    prevPuzzle(game) {
      if (game.currentPuzzleIndex > 0) {
        game.currentPuzzleIndex--;
        game.hintCount = 0;
        this.displayCurrentPuzzle(game);
      } else {
        speak('This is the first puzzle!');
        alert('This is the first puzzle.');
      }
    }

    startReviewSession(game) {
      const prevLevel = ['p1', 'p2', 'p3', 'p4', 'p5'].includes(game.currentLevel)
        ? `p${parseInt(game.currentLevel.replace('p', '')) - 1}`
        : 'p1';
      const prevSentences = game.sentences[prevLevel] || [];
      const currentSentences = game.sentences[game.currentLevel] || [];
      const reviewSentences = this.shuffle([...prevSentences.slice(0, 3), ...currentSentences.slice(0, 7)]);
      game.puzzles = reviewSentences.map(sentence => ({
        correct: sentence.split(' '),
        submitted: false,
        userAnswer: [],
        attempts: 0
      }));
      game.currentPuzzleIndex = 0;
      game.score = 0;
      game.puzzleAttempts = 0;
      game.correctCount = 0;
      this.displayCurrentPuzzle(game);
      speak('Time for a review session with mixed puzzles!');
    }

    resetQuiz(game) {
      game.generatePuzzles();
      const levelColors = {
        p1: '#ff6f61',
        p2: '#ff9f1c',
        p3: '#ffcc00',
        p4: '#98fb98',
        p5: '#40c4ff',
        p6: '#ff69b4'
      };
      document.documentElement.style.setProperty('--primary-color', levelColors[game.currentLevel]);
      this.displayCurrentPuzzle(game);
    }

    clearDropZone() {
      if (!this.currentDropZone) return;
      const wordBank = document.querySelector('.word-bank');
      Array.from(this.currentDropZone.children).forEach(word => {
        if (word.classList.contains('word')) {
          const newWord = this.createWord(word.textContent, game.puzzles[game.currentPuzzleIndex].correct);
          wordBank.appendChild(newWord);
          word.classList.add('removing');
          setTimeout(() => word.remove(), 300);
        }
      });
      if (!this.currentDropZone.children.length) {
        this.currentDropZone.appendChild(this.createElement('div', 'drop-placeholder', { innerText: 'Drag words here to build your sentence!', style: 'color: #666; font-style: italic;' }));
      }
      this.checkCompletion();
      speak('Drop zone cleared. Words returned to the word bank.');
    }

    toggleFullScreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }

    displayConfetti(count = 20) {
      const confettiContainer = this.createElement('div', 'confetti-container');
      document.body.appendChild(confettiContainer);
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < Math.min(count, 50); i++) {
        const confetti = this.createElement('div', 'confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.backgroundColor = ['#ff6f61', '#ff9f1c', '#ffcc00', '#98fb98', '#40c4ff'][Math.floor(Math.random() * 5)];
        fragment.appendChild(confetti);
      }
      confettiContainer.appendChild(fragment);
      setTimeout(() => confettiContainer.remove(), 5000);
    }

    handleEvents = {
      dragover: e => e.preventDefault(),
      dragleave: e => e.currentTarget.classList.remove('active'),
      drop: e => {
        e.preventDefault();
        if (!this.currentDropZone || !this.draggedItem) return;
        this.currentDropZone.classList.remove('active');
        const placeholder = this.currentDropZone.querySelector('.drop-placeholder');
        if (placeholder) placeholder.remove();
        this.currentDropZone.appendChild(this.draggedItem);
        gsap.fromTo(this.draggedItem, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
        this.checkCompletion();
        if (!this.currentDropZone.children.length) {
          this.currentDropZone.appendChild(this.createElement('div', 'drop-placeholder', { innerText: 'Drag words here to build your sentence!', style: 'color: #666; font-style: italic;' }));
        }
      },
      dragstart: e => {
        this.draggedItem = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.setData('text/plain', e.target.textContent);
      },
      dragend: e => (e.target.style.opacity = '1'),
      mouseover: e => this.showTooltip(e),
      mouseout: () => {},
      touchstart: e => this.showTouchTooltip(e),
      keydown: e => e.key === 'Enter' && this.removeWord(e)
    };

    showTooltip(e) {
      const role = e.target.dataset.role;
      const tips = {
        subject: 'Who does it?',
        verb: 'What happens?',
        object: 'What’s it about?',
        end: 'This ends the sentence.',
        default: 'Drag me to build the sentence! Double-click to remove or drag back to adjust.'
      };
      const tooltip = this.createElement('div', 'word-tooltip', { innerText: tips[role] || tips.default });
      const rect = e.target.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      tooltip.style.top = `${rect.bottom + scrollY + 5}px`;
      tooltip.style.left = `${rect.left}px`;
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth) tooltip.style.left = `${window.innerWidth - tooltipRect.width - 5}px`;
      if (tooltipRect.bottom > window.innerHeight) tooltip.style.top = `${rect.top + scrollY - tooltipRect.height - 5}px`;
      document.body.appendChild(tooltip);
      e.target.addEventListener('mouseout', () => tooltip.remove(), { once: true });
    }

    showTouchTooltip(e) {
      let timer;
      const touchMove = () => clearTimeout(timer);
      const touchEnd = () => {
        clearTimeout(timer);
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);
      };
      timer = setTimeout(() => {
        const role = e.target.dataset.role;
        const tips = {
          subject: 'Who does it?',
          verb: 'What happens?',
          object: 'What’s it about?',
          end: 'This ends the sentence.',
          default: 'Drag me to build the sentence! Double-tap to remove or drag back to adjust.'
        };
        const tooltip = this.createElement('div', 'word-tooltip', { innerText: tips[role] || tips.default });
        const rect = e.target.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        tooltip.style.top = `${rect.bottom + scrollY + 5}px`;
        tooltip.style.left = `${rect.left}px`;
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) tooltip.style.left = `${window.innerWidth - tooltipRect.width - 5}px`;
        if (tooltipRect.bottom > window.innerHeight) tooltip.style.top = `${rect.top + scrollY - tooltipRect.height - 5}px`;
        document.body.appendChild(tooltip);
        e.target.addEventListener('touchend', () => tooltip.remove(), { once: true });
      }, 500);
      document.addEventListener('touchmove', touchMove);
      document.addEventListener('touchend', touchEnd);
    }

    removeWord(e) {
      const word = e.target;
      const wordBank = document.querySelector('.word-bank');
      if (word.classList.contains('word') && word.parentElement.classList.contains('drop-zone')) {
        const newWord = this.createWord(word.textContent, game.puzzles[game.currentPuzzleIndex].correct);
        wordBank.appendChild(newWord);
        word.classList.add('removing');
        setTimeout(() => word.remove(), 300);
        speak('Word removed and returned to the word bank.');
      }
      this.checkCompletion();
      if (word.parentElement.classList.contains('drop-zone') && !word.parentElement.children.length) {
        word.parentElement.appendChild(this.createElement('div', 'drop-placeholder', { innerText: 'Drag words here to build your sentence!', style: 'color: #666; font-style: italic;' }));
      }
    }
  }

  function speak(text) {
    if ('speechSynthesis' in window) {
      const ensureVoiceLoaded = new Promise(resolve => {
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) resolve(voices);
          else window.speechSynthesis.addEventListener('voiceschanged', () => resolve(window.speechSynthesis.getVoices()), { once: true });
        };
        checkVoices();
      });

      ensureVoiceLoaded.then(voices => {
        const utterance = new SpeechSynthesisUtterance(text);
        let preferredVoice = voices.find(v => v.name.includes('UK English Female') || (v.lang === 'en-GB' && v.gender === 'female'));
        if (!preferredVoice) preferredVoice = voices.find(v => (v.name.includes('US English Female') || v.name.includes('Samantha') || v.name.includes('Victoria')) && v.lang === 'en-US' && v.gender === 'female');
        if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Australian English Female') || v.name.includes('Karen') || (v.lang === 'en-AU' && v.gender === 'female'));
        if (!preferredVoice) {
          preferredVoice = voices.find(v => v.gender === 'female') || voices[0];
          console.warn('No female voice found, using default voice. Check browser voice settings.');
        }
        utterance.voice = preferredVoice || voices[0];
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      });
    } else console.warn('Speech synthesis not supported on this device.');
  }

  const game = new Game();
  const ui = new UI();

  function init() {
    game.generatePuzzles();
    ui.displayCurrentPuzzle(game);

    document.getElementById('listen-instructions-btn').addEventListener('click', () =>
      speak(document.querySelector('p.instructions').textContent)
    );
    ui.elements.hintBtn.addEventListener('click', () => ui.showHint(game));
    ui.elements.submitBtn.addEventListener('click', () => ui.submitAnswer(game));
    ui.elements.tryAgainBtn.addEventListener('click', () => ui.tryAgain(game));
    ui.elements.prevBtn.addEventListener('click', () => ui.prevPuzzle(game));
    ui.elements.nextBtn.addEventListener('click', () => ui.nextPuzzle(game));
    ui.elements.clearBtn.addEventListener('click', () => ui.clearDropZone());
    document.getElementById('reset-btn').addEventListener('click', () => ui.resetQuiz(game));
    document.getElementById('level-select').addEventListener('change', e => {
      game.currentLevel = e.target.value;
      ui.resetQuiz(game);
    });
    document.getElementById('fullscreen-btn').addEventListener('click', () => ui.toggleFullScreen());
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const body = document.body;
      if (body.classList.contains('pastel-theme')) {
        body.classList.remove('pastel-theme');
        body.classList.add('rainbow-theme');
        speak('Switched to Rainbow Fun theme!');
      } else if (body.classList.contains('rainbow-theme')) {
        body.classList.remove('rainbow-theme');
        speak('Switched to Bright Playful theme!');
      } else {
        body.classList.add('pastel-theme');
        speak('Switched to Pastel Calm theme!');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
