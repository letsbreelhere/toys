const RADIUS = 25;

function angleDiff(a, b) {
  const dot = Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b);
  return Math.abs(Math.acos(dot));
}

class Clock {
  constructor(cx, cy) {
    this.pos = createVector(cx, cy);
    this.minute = Math.PI / 2;
    this.hour = 0;
    this.hourTarget = 0;
    this.minuteTarget = 0;
  }

  isSW() {
    return angleDiff(this.hour, clockDegreeToRadian(SW)) < 0.2
  }

  draw(flash) {
    push();
    strokeWeight(2);
    translate(this.pos.x, this.pos.y);

    if (flash) {
      if (this.isSW()) {
        stroke(50, 50, 50);
      } else {
        stroke(255, 255, 255);
      }
    } else {
      stroke(100, 100, 100);
    }

    push();
    rotate(this.minute);
    line(0, 0, RADIUS, 0);
    pop();

    push();
    rotate(this.hour);
    line(0, 0, RADIUS, 0);
    pop();

    stroke(50, 50, 50);
    strokeWeight(2);

    noFill();
    circle(0, 0, RADIUS * 2);
    pop();
  }

  update(ms) {
    this.hour += (2 * Math.PI * this.hourRate * ms) / 1000;
    while (this.hour > 2 * Math.PI) this.hour -= 2 * Math.PI;
    this.minute += (2 * Math.PI * this.minuteRate * ms) / 1000;
    while (this.minute > 2 * Math.PI) this.minute -= 2 * Math.PI;
  }
}

let CLOCKS = [];

const N = 0;
const NE = 45;
const E = 90;
const SE = 135;
const S = 180;
const SW = 225;
const W = 270;
const NW = 315;

const EMPTY = [SW, SW]

function check() {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    const next = (i + 1) % 10;
    for (let j = 0; j < 24; j++) {
      const ary1 = NUMERALS[i][j];
      const ary2 = NUMERALS[next][j];
      ary1.forEach((x, ix) => {
        if (x == ary2[ix]) {
          total++;
          console.warn("At", `(${j}, ${ix})`, "numerals", i, "and", next, "are both", x)
        }
      })
    }
  }
  console.warn("Found", total, "total matches");
}

const NUMERALS = {
  // ┏━━┓
  // ┃┏┓┃
  // ┃┃┃┃
  // ┃┃┃┃
  // ┃┗┛┃
  // ┗━━┛
  0: [
    [S, E], [W, E], [W, E], [W, S],
    [N, S], [S, E], [W, S], [N, S],
    [N, S], [S, N], [S, N], [N, S],
    [N, S], [S, N], [S, N], [N, S],
    [N, S], [E, N], [N, W], [N, S],
    [E, N], [E, W], [W, E], [W, N],
  ],

  // ┏━┓
  // ┗┓┃
  //  ┃┃
  //  ┃┃
  // ┏┛┗┓
  // ┗━━┛
  1: [
    [E, S], [E, W], [S, W], EMPTY,
    [E, N], [W, S], [S, N], EMPTY,
    EMPTY, [N, S], [N, S], EMPTY,
    EMPTY, [N, S], [N, S], EMPTY,
    [S, E], [N, W], [N, E], [S, W],
    [N, E], [W, E], [E, W], [N, W],
  ],

  // ┏━━┓
  // ┗━┓┃
  // ┏━┛┃
  // ┃┏━┛
  // ┃┗━┓
  // ┗━━┛
  2: [
    [S, E], [W, E], [W, E], [W, S],
    [N, E], [E, W], [W, S], [N, S],
    [E, S], [E, W], [W, N], [N, S],
    [N, S], [S, E], [E, W], [N, W],
    [N, S], [E, N], [E, W], [W, S],
    [E, N], [E, W], [W, E], [W, N]
  ],

  // ┏━━┓
  // ┗━┓┃
  // ┏━┛┃
  // ┗━┓┃
  // ┏━┛┃
  // ┗━━┛
  3: [
    [E, S], [E, W], [E, W], [S, W],
    [E, N], [W, E], [S, W], [S, N],
    [S, E], [W, E], [N, W], [S, N],
    [E, N], [E, W], [W, S], [S, N],
    [S, E], [W, E], [W, N], [S, N],
    [N, E], [W, E], [E, W], [N, W],
  ],

  // ┏┓┏┓
  // ┃┃┃┃
  // ┃┗┛┃
  // ┗━┓┃
  //   ┃┃
  //   ┗┛
  4: [
    [S, E], [W, S], [S, E], [W, S],
    [N, S], [S, N], [N, S], [N, S],
    [N, S], [E, N], [W, N], [N, S],
    [N, E], [W, E], [S, W], [N, S],
    [SW, SW], [SW, SW], [N, S], [N, S],
    [SW, SW], [SW, SW], [N, E], [W, N],
  ],

  // ┏━━┓
  // ┃┏━┛
  // ┃┗━┓
  // ┗━┓┃
  // ┏━┛┃
  // ┗━━┛
  5: [
    [E, S], [E, W], [E, W], [S, W],
    [S, N], [E, S], [E, W], [W, N],
    [S, N], [N, E], [E, W], [S, W],
    [E, N], [E, W], [W, S], [S, N],
    [S, E], [E, W], [W, N], [S, N],
    [E, N], [E, W], [E, W], [N, W],
  ],

  // ┏━━┓
  // ┃┏━┛
  // ┃┗━┓
  // ┃┏┓┃
  // ┃┗┛┃
  // ┗━━┛
  6: [
    [S, E], [W, E], [W, E], [W, S],
    [N, S], [S, E], [W, E], [N, W],
    [N, S], [E, N], [W, E], [W, S],
    [N, S], [S, E], [S, W], [N, S],
    [N, S], [N, E], [N, W], [N, S],
    [N, E], [W, E], [W, E], [W, N]
  ],

  // ┏━━┓
  // ┃┏┓┃
  // ┗┛┃┃
  //   ┃┃
  //   ┃┃
  //   ┗┛
  7: [
    [E, S], [E, W], [E, W], [S, W],
    [S, N], [E, S], [S, W], [S, N],
    [E, N], [N, W], [N, S], [S, N],
    EMPTY, EMPTY, [N, S], [S, N],
    EMPTY, EMPTY, [S, N], [S, N],
    EMPTY, EMPTY, [E, N], [N, W]
  ],

  // ┏━━┓
  // ┃┏┓┃
  // ┃┗┛┃
  // ┃┏┓┃
  // ┃┗┛┃
  // ┗━━┛
  8: [
    [S, NE], [W, E], [W, E], [NW, S],
    [N, S], [S, E], [W, S], [N, S],
    [N, S], [E, N], [W, N], [N, S],
    [N, S], [S, E], [S, W], [N, S],
    [N, S], [E, N], [N, W], [N, S],
    [SE, N], [E, W], [W, E], [SW, N],
  ],

  // ┏━━┓
  // ┃┏┓┃
  // ┃┗┛┃
  // ┗━┓┃
  // ┏━┛┃
  // ┗━━┛
  9: [
    [E, S], [E, W], [E, W], [S, W],
    [S, N], [E, S], [S, W], [S, N],
    [S, N], [N, E], [N, W], [S, N],
    [E, N], [E, W], [W, S], [S, N],
    [S, E], [W, E], [W, N], [S, N],
    [N, E], [W, E], [E, W], [N, W],
  ],
};

// Convert "clock degrees" (degrees _clockwise_, starting at (0,1)) to standard clockwise radians.
function clockDegreeToRadian(clockDegree) {
  return (clockDegree - 90) * Math.PI / 180;
}

class ClockDigit {
  constructor(opts) {
    this.clocks = [];
    this.tickover = opts.interval * 1000;
    this.last = 0;
    this.numeral = opts.numeral || 0;
    this.interval = opts.interval;
    this.cycle = opts.cycle;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 4; x++) {
        const i = 4 * y + x;
        const clock = new Clock(opts.startx + x * RADIUS * 2, opts.starty + y * RADIUS * 2);
        const [m, h] = NUMERALS[this.numeral][i];
        clock.minute = clockDegreeToRadian(m);
        clock.hour = clockDegreeToRadian(h);
        this.clocks.push(clock);
      }
    }
    this.setClockTargets(this.interval);
  }

  setClockTargets(seconds) {
    for (let i = 0; i < 24; i++) {
      const clock = this.clocks[i];
      const [m, h] = NUMERALS[this.numeral][i];
      clock.minuteTarget = clockDegreeToRadian(m);
      clock.hourTarget = clockDegreeToRadian(h);
      clock.minuteRate = (clock.minuteTarget - clock.minute) / (2 * seconds * Math.PI);
      if (clock.minuteRate < 0.001) clock.minuteRate += 1 / seconds;
      clock.hourRate = (clock.hourTarget - clock.hour) / (2 * seconds * Math.PI);
      if (clock.hourRate < 0.001) clock.hourRate += 1 / seconds;
      if (!clock.minuteRate) {
        throw new Error("minuteRate is nan")
      }
    }
  }

  draw(m) {
    const flash = this.tickover < 200 * (this.interval / 10) || this.tickover > 9800 * (this.interval / 10)
    this.clocks.forEach((c) => c.draw(flash));
    this.clocks.forEach((c) => c.update(m - this.last));

    this.tickover += (m - this.last);
    this.last = m;
    if (this.tickover >= 1000 * this.interval) {
      this.numeral += 1;
      this.numeral %= this.cycle;
      this.setClockTargets(this.interval);
      this.tickover -= 1000 * this.interval;
    }
  }
}

const DIGITS = []

function setup() {
  frameRate(60);
  createCanvas(windowWidth - 50, windowHeight - 50);
  const d = new Date();

  let x = 100;

  const h = d.getHours();
  console.warn(h);
  DIGITS.push(new ClockDigit({ startx: x, starty: 100, interval: 36000, cycle: 3, numeral: Math.floor(h / 10) }));
  x += 200;
  DIGITS.push(new ClockDigit({ startx: x, starty: 100, interval: 3600, cycle: 10, numeral: Math.floor(h % 10) }));

  x += 250;

  const m = d.getMinutes();
  DIGITS.push(new ClockDigit({ startx: x, starty: 100, interval: 600, cycle: 10, numeral: Math.floor(m / 10) }));
  x += 200;
  DIGITS.push(new ClockDigit({ startx: x, starty: 100, interval: 60, cycle: 10, numeral: Math.floor(m % 10) }));

  x += 250;

  const s = d.getSeconds();
  DIGITS.push(new ClockDigit({ startx: x, starty: 100, interval: 10, cycle: 6, numeral: Math.floor(s / 10) }));
  x += 200;
  DIGITS.push(new ClockDigit({ startx: x, starty: 100, interval: 1, cycle: 10, numeral: s % 10 }));
}

const INTERVAL = 1;

function draw() {
  background(20, 20, 20);
  const m = millis();
  DIGITS.forEach((d) => d.draw(m));
}
