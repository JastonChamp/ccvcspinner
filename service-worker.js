'use strict';

(() => {
  const elements = {
    puzzleContainer: document.getElementById("puzzle-container"),
    hint: document.getElementById("hint"),
    successMessage: document.getElementById("success-message"),
    progress: document.getElementById("progress"),
    score: document.getElementById("score"),
    progressBar: document.getElementById("progress-bar"),
    progressLabel: document.getElementById("progress-label"),
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
      };
      if (window.speechSynthesis.getVoices().length) setVoice();
      else window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }
