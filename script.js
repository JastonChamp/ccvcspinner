const wheel = document.querySelector('.wheel');
const ccvcWords = [
  'brag', 'clam', 'drop', 'flag', 'grip', 
  'plan', 'slip', 'trap', 'blot', 'clap',
  'drum', 'flap', 'glum', 'plug',
  'skim', 'twin',  'brim', 'clot', 'drip',
  'frog', 'swim', 
   'blip', 'chip',  'twig',
  'blab', 'clod', 'flit', 'grit',  'plot', 'scam',
  'trim', 'bran', 'chop', 'drag', 'flop', 'glim', 
  'prod', 'slam', 'twit', 
  'swan', 'sled', 'swig', 'slug',  'slab', 'swop', 'slop', 
  'swot', 'brat', 'clad',  'flog', 'grub', 
   'plum',  'spit', 'trot',  
  'plop', 
  'spin', 
'scum', 
   'grit', 
  'plug',  'skim', 'twin', 
];

ccvcWords.forEach((word, index) => {
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
    const randomSlot = Math.floor(Math.random() * ccvcWords.length); // Fixed here
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
    const randomSlot = Math.floor(Math.random() * ccvcWords.length); // Fixed here
    slots[currentSlot].style.display = 'none';
    slots[randomSlot].style.display = 'flex';
    currentSlot = randomSlot;
  }, 2500);
});
