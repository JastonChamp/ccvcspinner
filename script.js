"use strict";
(() => {
  // ——————————————————————————————————————————————————————————
  // 1. DOM refs
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    progressFill:   document.getElementById("progress-bar-fill"),
    xpDisplay:      document.getElementById("xp-display"),
    streakDisplay:  document.getElementById("streak-display"),
    badgesList:     document.getElementById("badges-list"),
    hintText:       document.getElementById("hint"),
    successMsg:     document.getElementById("success-message"),
    submitBtn:      document.getElementById("submit-btn"),
    prevBtn:        document.getElementById("prev-btn"),
    nextBtn:        document.getElementById("next-btn"),
    hintBtn:        document.getElementById("hint-btn"),
    clearBtn:       document.getElementById("clear-btn"),
    learnBtn:       document.getElementById("learn-btn"),
    levelSelect:    document.getElementById("level-select"),
    timerToggle:    document.getElementById("timer-mode"),
    listenBtn:      document.getElementById("listen-instructions-btn"),
    fullscreenBtn:  document.getElementById("fullscreen-btn"),
    themeBtn:       document.getElementById("change-theme-btn"),
    resetBtn:       document.getElementById("reset-btn"),
    successSound:   document.getElementById("success-sound"),
    errorSound:     document.getElementById("error-sound")
  };

  // ——————————————————————————————————————————————————————————
  // 2. State
  const SESSION_LENGTH = 10;
  let puzzles = [], idx = 0, timerId = null, hintCount = 0;
  let xp = +localStorage.getItem("xp")     || 0;
  let streak = +localStorage.getItem("streak") || 0;
  let badges = JSON.parse(localStorage.getItem("badges")||"[]");
  let currentLevel = localStorage.getItem("currentLevel") || "p3";

  // ——————————————————————————————————————————————————————————
  // 3. Sentences
  const SENTS = {
    p1: [ /* …24 sentences… */ ],
    p2: [], p3: [], p4: [], p5: [], p6: []
  };
  // Fill p2–p6 with p1 for demo:
  SENTS.p2 = [...SENTS.p1];
  SENTS.p3 = [...SENTS.p1];
  SENTS.p4 = [...SENTS.p1];
  SENTS.p5 = [...SENTS.p1];
  SENTS.p6 = [...SENTS.p1];

  // ——————————————————————————————————————————————————————————
  // 4. Helpers
  const shuffle = a => a.sort(() => Math.random()-0.5);
  const save = () => {
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
    localStorage.setItem("badges", JSON.stringify(badges));
    localStorage.setItem("currentLevel", currentLevel);
  };
  function speak(txt) {
    if (!speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(txt);
    const v = speechSynthesis.getVoices().find(v=>v.lang==="en-GB");
    if (v) u.voice = v;
    u.rate=0.9; u.pitch=1.1;
    speechSynthesis.speak(u);
  }

  // Micro‑confetti
  function launchConfetti() {
    for (let i=0; i<12; i++) {
      const d = document.createElement("div");
      d.className = "confetti";
      d.style.setProperty("--dx", (Math.random()-0.5)*200 + "px");
      d.style.setProperty("--dy", (Math.random()-0.5)*200 + "px");
      document.body.appendChild(d);
      d.onanimationend = () => d.remove();
    }
  }

  // ——————————————————————————————————————————————————————————
  // 5. Progress UI
  function updateProgress() {
    const pct = Math.round(((idx+1)/SESSION_LENGTH)*100);
    elements.progressFill.style.width = pct + "%";
  }

  // ——————————————————————————————————————————————————————————
  // 6. Generate puzzles
  function genPuzzles() {
    const pool = SENTS[currentLevel];
    puzzles = shuffle([...pool]).slice(0, SESSION_LENGTH)
      .map(s => ({ correct: s.split(" "), attempts: 0 }));
    idx = 0; hintCount = 0;
    renderPuzzle(); updateProgress(); updateGamify();
  }

  // ——————————————————————————————————————————————————————————
  // 7. Render puzzle
  function renderPuzzle() {
    clearInterval(timerId);
    elements.puzzleContainer.innerHTML = "";
    elements.submitBtn.disabled = true;
    elements.hintText.textContent = "";
    elements.successMsg.textContent = "";

    const pz = puzzles[idx];
    // Header
    const h3 = document.createElement("h3");
    h3.textContent = `Puzzle ${idx+1} of ${SESSION_LENGTH}`;
    elements.puzzleContainer.appendChild(h3);

    // Word bank
    const bank = document.createElement("div"); bank.className = "word-bank";
    shuffle([...pz.correct]).forEach(w => {
      const d = document.createElement("div");
      d.className = "word"; d.textContent = w; d.draggable = true;
      d.addEventListener("dragstart", ()=>dragged = d);
      bank.appendChild(d);
    });
    elements.puzzleContainer.appendChild(bank);

    // Drop zone
    const drop = document.createElement("div"); drop.className="drop-zone";
    drop.innerHTML=`<div class="drop-placeholder">Drag words here…</div>`;
    drop.addEventListener("dragover", e=>{e.preventDefault();drop.classList.add("active")});
    drop.addEventListener("dragleave", ()=>drop.classList.remove("active"));
    drop.addEventListener("drop", e=>{
      e.preventDefault(); drop.classList.remove("active");
      const ph = drop.querySelector(".drop-placeholder"); if(ph) ph.remove();
      drop.appendChild(dragged); gsap.fromTo(dragged,{scale:1.2},{scale:1,duration:0.2});
      dragged=null;
      elements.submitBtn.disabled = drop.children.length!==pz.correct.length;
    });
    elements.puzzleContainer.appendChild(drop);

    // Timer (optional)
    if (elements.timerToggle.checked) {
      let t=30;
      timerId=setInterval(()=>{
        if(--t<=0){ clearInterval(timerId); checkAnswer(); }
      },1000);
    }
  }

  // ——————————————————————————————————————————————————————————
  // 8. Gamify UI
  function updateGamify() {
    elements.xpDisplay.textContent     = xp;
    elements.streakDisplay.textContent = streak;
    elements.badgesList.textContent    = badges.join(", ")||"None";
    save();
  }

  // ——————————————————————————————————————————————————————————
  // 9. Check answer
  function checkAnswer() {
    clearInterval(timerId);
    const drop = document.querySelector(".drop-zone");
    const pz   = puzzles[idx];
    pz.attempts++;
    const user = Array.from(drop.children).map(d=>d.textContent);
    const norm = user.map((w,i)=>i===0?w.charAt(0).toUpperCase()+w.slice(1):w);
    const correct = norm.join(" ")===pz.correct.join(" ");

    // Mark tiles
    Array.from(drop.children).forEach((d,i)=>{
      d.classList.remove("correct","incorrect");
      if (d.textContent===pz.correct[i]) d.classList.add("correct");
      else {
        d.classList.add("incorrect");
        d.addEventListener("click", fixWord);
      }
    });

    if (correct) {
      xp+=10; streak++; if(!badges.includes("First Win")) badges.push("First Win");
      elements.successMsg.textContent="🎉 Correct!";
      elements.successSound.play();
      gsap.fromTo(".drop-zone",{y:-10},{y:0,duration:0.6,stagger:0.1,ease:"bounce.out"});
      launchConfetti();
    } else {
      streak=0;
      elements.hintText.textContent="Oops—tap red words to fix!";
      elements.errorSound.play();
      gsap.fromTo(".drop-zone",{x:-5},{x:5,duration:0.1,repeat:5,yoyo:true});
    }
    updateGamify(); updateProgress();
  }

  function fixWord(e) {
    const d = e.target;
    const pz = puzzles[idx];
    const i = Array.from(d.parentNode.children).indexOf(d);
    d.textContent = pz.correct[i];
    d.classList.replace("incorrect","correct");
    d.removeEventListener("click", fixWord);
    // If fully correct now:
    if ( Array.from(d.parentNode.children).every((c,j)=> c.textContent===pz.correct[j]) ) {
      checkAnswer();
    }
  }

  // ——————————————————————————————————————————————————————————
  // 10. Navigation
  let dragged = null;
  elements.submitBtn.addEventListener("click", checkAnswer);
  elements.nextBtn.addEventListener("click", ()=>{
    idx = (idx+1<SESSION_LENGTH?idx+1:0);
    renderPuzzle(); updateProgress(); updateGamify();
  });
  elements.prevBtn.addEventListener("click", ()=>{
    idx = idx>0?idx-1:0;
    renderPuzzle(); updateProgress(); updateGamify();
  });
  elements.clearBtn.addEventListener("click", ()=>renderPuzzle());
  elements.hintBtn.addEventListener("click", ()=>{
    hintCount++;
    const subj = puzzles[idx].correct[0];
    elements.hintText.textContent = `Hint: Subject = "${subj}"`;
  });
  elements.learnBtn.addEventListener("click", ()=>{
    elements.puzzleContainer.innerHTML=`
      <h3>Learn: Subject + Verb (+Object)</h3>
      <p>Example: <strong>The dog runs fast.</strong></p>
    `;
  });

  // Settings
  elements.levelSelect.addEventListener("change", e=>{ currentLevel=e.target.value; genPuzzles(); });
  elements.resetBtn.addEventListener("click", genPuzzles);
  elements.listenBtn.addEventListener("click", ()=>speak(
    "Drag the words below to make a sentence. Start with capital and end with a full stop or question mark."
  ));
  elements.fullscreenBtn.addEventListener("click", ()=>{
    document.fullscreenElement 
      ? document.exitFullscreen() 
      : document.documentElement.requestFullscreen();
  });
  elements.themeBtn.addEventListener("click", ()=>document.body.classList.toggle("dark-theme"));

  // ——————————————————————————————————————————————————————————
  // 11. Init
  document.addEventListener("DOMContentLoaded", genPuzzles);
})();
