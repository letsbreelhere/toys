let circles = [];
let springs = [];

const NUM_CIRCLES = 20;

let width = null;
let height = null;
let t = 0;

function checkCollisions(c, i) {
  circles.forEach((c2, j) => {
    if (i == j) return;

    const direction = createVector(c2.x - c.x, c2.y - c.y);
    const dist = direction.mag();
    const minRadius = (c.diameter + c2.diameter) / 2 + 4;
    const delta = minRadius - dist;

    if (delta > 0) {
      // Shove circles apart by half of the required distance
      direction.normalize();
      direction.mult(delta);

      c2.vel.add(direction);
      c2.force.add(direction);
      direction.mult(-1);
      c.vel.add(direction);
      c.force.add(direction);
    }
  });
}

function setup() {
  frameRate(60);
  width = windowWidth - 100;
  height = windowHeight - 100;
  createCanvas(width, height);

  for (let i = 0; i < NUM_CIRCLES; i++) {
    const x = random(0, width);
    const y = random(0, height);
    const diameter = random(40, 100);
    circles.push({
      x,
      y,
      diameter,
      force: createVector(0, 0),
      vel: createVector(0, 0),
    });
  }

  let connected = [0];

  while (connected.length < circles.length) {
    const start = Math.floor(random(0, circles.length));
    const end = Math.floor(random(0, circles.length));
    if (connected.includes(start) && connected.includes(end)) continue;
    const alreadyExists = springs.some((s) => s.start == start && s.end == end);
    if (start == end || alreadyExists) continue;
    springs.push({ start, end });
    const connects = connected.includes(start) || connected.includes(end);
    if (connects && !connected.includes(start)) connected.push(start);
    if (connects && !connected.includes(end)) connected.push(end);
  }
}

function draw() {
  t++;
  background(20, 20, 20);
  stroke(200, 200, 200);
  noFill();

  circles.forEach((c) => {
    circle(c.x, c.y, c.diameter);
  });

  stroke(100, 100, 100);
  springs.forEach((s) => {
    const startCircle = circles[s.start];
    const endCircle = circles[s.end];

    line(startCircle.x, startCircle.y, endCircle.x, endCircle.y);
  });

  // Update positions and reset forces
  circles.forEach((c, i) => {
    checkCollisions(c, i);
    c.x += c.vel.x * 0.04;
    c.y += c.vel.y * 0.04;

    c.force.mult(0.04);
    c.vel.add(c.force);
    c.vel.mult(0.94);

    c.force = createVector(0, 0);
  });

  // Update forces
  springs.forEach((s) => {
    const startCircle = circles[s.start];
    const endCircle = circles[s.end];
    const direction = createVector(
      endCircle.x - startCircle.x,
      endCircle.y - startCircle.y
    );

    startCircle.force.add(direction);
    direction.mult(-1);
    endCircle.force.add(direction);
  });
}
