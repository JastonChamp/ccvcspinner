const wheel = document.querySelector('.wheel');
const cvccWords = [
  'bend', 'fast', 'milk', 'jump', 'sink', 'wind', 'lost', 'sand', 'melt',
  // ... (add more CVCC words here)
];

cvccWords.forEach((word, index) => {
  const slot = document.createElement('div');
  slot.className = 'slot';
  
  let coloredWord = '';
  for (let letter of word) {
    if ('aeiou'.includes(letter)) {
      coloredWord += `<span class="vowel">${letter}</span>`;
    } else {
      coloredWord += letter;
    }
  }
  
  slot.innerHTML = coloredWord;
  slot.style.display = 'none';
  wheel.appendChild(slot);
});

const slots = document.querySelectorAll('.slot');
slots[0].style.display = 'flex';

let currentSlot = 0;

document.getElementById('spinButton').addEventListener('click', () => {
  let shuffleCount = 0;
  let lastRandom = 0;

  const shuffleEffect = setInterval(() => {
    slots[lastRandom].style.display = 'none';
    const randomSlot = Math.floor(Math.random() * cvccWords.length);
    slots[randomSlot].style.display = 'flex';
    lastRandom = randomSlot;
    shuffleCount++;
    if (shuffleCount > 20) {
      clearInterval(shuffleEffect);
      slots[lastRandom].style.display = 'none';
      slots[currentSlot].style.display = 'flex';
    }
  }, 100);

  setTimeout(() => {
    const randomSlot = Math.floor(Math.random() * cvccWords.length);
    slots[currentSlot].style.display = 'none';
    slots[randomSlot].style.display = 'flex';
    currentSlot = randomSlot;
  }, 2500);
});
