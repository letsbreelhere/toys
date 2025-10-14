// Script to generate ASCII art comments for clock numerals

const NUMERALS = {
  0: [
    [180, 90], [270, 90], [270, 90], [270, 180],
    [0, 180], [180, 90], [270, 180], [0, 180],
    [0, 180], [180, 0], [180, 0], [0, 180],
    [0, 180], [180, 0], [180, 0], [0, 180],
    [0, 180], [90, 0], [0, 270], [0, 180],
    [90, 0], [90, 270], [270, 90], [270, 0],
  ],
  1: [
    [90, 180], [90, 270], [180, 270], [225, 225],
    [90, 0], [270, 180], [180, 0], [225, 225],
    [225, 225], [0, 180], [0, 180], [225, 225],
    [225, 225], [0, 180], [0, 180], [225, 225],
    [180, 90], [0, 270], [0, 90], [180, 270],
    [0, 90], [270, 90], [90, 270], [0, 270],
  ],
  2: [
    [180, 90], [270, 90], [270, 90], [270, 180],
    [0, 90], [90, 270], [270, 180], [0, 180],
    [90, 180], [90, 270], [270, 0], [0, 180],
    [0, 180], [180, 90], [90, 270], [0, 270],
    [0, 180], [90, 0], [90, 270], [270, 180],
    [90, 0], [90, 270], [270, 90], [270, 0]
  ],
  3: [
    [90, 180], [90, 270], [90, 270], [180, 270],
    [90, 0], [270, 90], [180, 270], [180, 0],
    [180, 90], [270, 90], [0, 270], [180, 0],
    [90, 0], [90, 270], [270, 180], [180, 0],
    [180, 90], [270, 90], [270, 0], [180, 0],
    [0, 90], [270, 90], [90, 270], [0, 270],
  ],
  5: [
    [90, 180], [90, 270], [90, 270], [180, 270],
    [180, 0], [90, 180], [90, 270], [270, 0],
    [180, 0], [0, 90], [90, 270], [180, 270],
    [90, 0], [90, 270], [270, 180], [180, 0],
    [180, 90], [90, 270], [270, 0], [180, 0],
    [90, 0], [90, 270], [90, 270], [0, 270],
  ],
  9: [
    [90, 180], [90, 270], [90, 270], [180, 270],
    [180, 0], [90, 180], [180, 270], [180, 0],
    [180, 0], [0, 90], [0, 270], [180, 0],
    [90, 0], [90, 270], [270, 180], [180, 0],
    [180, 90], [270, 90], [270, 0], [180, 0],
    [0, 90], [270, 90], [90, 270], [0, 270],
  ],
};

// Convert clock directions to box drawing characters
// Each clock has exactly 2 hands, so only 2 directions maximum
function directionToChar(minute, hour) {
  const m = minute;
  const h = hour;

  // EMPTY (SW, SW)
  if (m === 225 && h === 225) return ' ';

  // Count directions
  const hasTop = m === 0 || h === 0;
  const hasBottom = m === 180 || h === 180;
  const hasLeft = m === 270 || h === 270;
  const hasRight = m === 90 || h === 90;

  // Two-way connections (exactly 2 directions) - using bold characters
  if (hasTop && hasBottom) return '┃';
  if (hasLeft && hasRight) return '━';
  if (hasTop && hasLeft) return '┛';
  if (hasTop && hasRight) return '┗';
  if (hasBottom && hasLeft) return '┓';
  if (hasBottom && hasRight) return '┏';

  // If we get here, something unexpected happened
  return '?';
}

function generateComment(numeral) {
  const data = NUMERALS[numeral];
  const lines = [];

  for (let row = 0; row < 6; row++) {
    let line = '';
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col;
      const [minute, hour] = data[idx];
      line += directionToChar(minute, hour);
    }
    lines.push(line);
  }

  return lines.map(line => `  // ${line}`).join('\n');
}

// Generate comments for all numerals that don't have them yet
console.log('Numeral 0:');
console.log(generateComment(0));
console.log('');

console.log('Numeral 1:');
console.log(generateComment(1));
console.log('');

console.log('Numeral 2:');
console.log(generateComment(2));
console.log('');

console.log('Numeral 3:');
console.log(generateComment(3));
console.log('');

console.log('Numeral 5:');
console.log(generateComment(5));
console.log('');

console.log('Numeral 9:');
console.log(generateComment(9));
