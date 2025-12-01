let circles = [];
let springs = [];

const NUM_CIRCLES = 200;

let width = null;
let height = null;

function checkCollisions(c, i) {
  circles.forEach((c2, j) => {
    if (i == j) return;

    const direction = createVector(c2.x - c.x, c2.y - c.y);
    const dist = direction.mag();
    const minRadius = (c.diameter + c2.diameter) / 2;
    const delta = minRadius - dist;

    if (delta > 0) {
      // Shove circles apart by half of the required distance
      direction.normalize();
      direction.mult(delta * Math.abs(slider.value()));
      let velChange = createVector(direction.x, direction.y);
      velChange.mult(1);
      direction.mult(10000 / delta ** 2);
      clampVector(direction, 10);

      c2.vel.add(velChange);
      c2.force.add(direction);
      direction.mult(-1);
      velChange.mult(-1);
      c.vel.add(velChange);
      c.force.add(direction);
    }
  });
}

let grabbed = null;
function mousePressed() {
  let found = null;

  circles.forEach((c) => {
    if (
      createVector(mouseX, mouseY).dist(createVector(c.x, c.y)) <
      c.diameter / 2
    ) {
      found = c;
      return;
    }
  });

  grabbed = found;
}
function mouseReleased() {
  grabbed = null;
}

let slider;

function setup() {
  frameRate(60);
  width = windowWidth - 100;
  height = windowHeight - 100;
  slider = createSlider(-1, 30, 3, 0.1);
  createCanvas(width, height);

  for (let i = 0; i < NUM_CIRCLES; i++) {
    const x = random(0, width);
    const y = random(0, height);
    const diameter = random(10, 100);
    circles.push({
      x,
      y,
      diameter,
      force: createVector(0, 0),
      vel: createVector(0, 0),
    });
  }

  circles.forEach((c, start) => {
    if (start === 0) return;
    const end = Math.floor(random(0, start - 1));
    springs.push({ start, end });
  });

  // while (connected.length < circles.length) {
  //   const start = Math.floor(random(0, circles.length));
  //   const end = Math.floor(random(0, circles.length));
  //   if (connected.includes(start) && connected.includes(end)) continue;
  //   const alreadyExists = springs.some((s) => s.start == start && s.end == end);
  //   if (start == end || alreadyExists) continue;
  //   springs.push({ start, end });
  //   const connects = connected.includes(start) || connected.includes(end);
  //   if (connects && !connected.includes(start)) connected.push(start);
  //   if (connects && !connected.includes(end)) connected.push(end);
  // }
}

function clampVector(v, maxMag) {
  const m = v.mag();
  const newMag = Math.min(m, maxMag);
  v.normalize();
  v.mult(newMag);
  return v;
}

function draw() {
  textSize(24);
  background(20, 20, 20);
  stroke(200, 200, 200);
  fill(200, 200, 200);
  const forceTotal = circles.reduce((s, c) => {
    return s + c.force.mag();
  }, 0);
  text(`Total forces: ${Math.round(forceTotal)}`, 20, 50);
  text(`Spring force: ${slider.value()}`, 20, 20);
  noFill();

  if (grabbed) {
    const gpos = createVector(grabbed.x, grabbed.y);
    const mpos = createVector(mouseX, mouseY);
    gpos.mult(-1);
    gpos.add(mpos);
    gpos.mult(slider.value());
    grabbed.vel.mult(0.9);
    grabbed.vel.add(gpos);
    grabbed.force = gpos;
  }

  let sorted = [...circles];
  sorted.sort((a, b) => a.force.magSq() - b.force.magSq());
  strokeWeight(2);
  sorted.forEach((c, i) => {
    const rgb = lerp(50, 200, i / NUM_CIRCLES);
    stroke(rgb, 0, 200 - rgb);
    circle(c.x, c.y, c.diameter);
  });
  strokeWeight(1);

  stroke(255, 255, 255, 150);
  springs.forEach((s) => {
    const startCircle = circles[s.start];
    const endCircle = circles[s.end];
    line(startCircle.x, startCircle.y, endCircle.x, endCircle.y);
  });

  // Update positions and reset forces
  circles.forEach((c, i) => {
    checkCollisions(c, i);
    // c.force = clampVector(c.force, 1000);
    // c.vel = clampVector(c.vel, 1000);
    c.x += c.vel.x / 60;
    c.y += c.vel.y / 60;

    c.force.mult(1 / 60);
    c.vel.add(c.force);
    c.vel.mult(0.95);
  });

  // Update forces
  springs.forEach((s) => {
    const startCircle = circles[s.start];
    const endCircle = circles[s.end];
    const direction = createVector(
      endCircle.x - startCircle.x,
      endCircle.y - startCircle.y
    );
    direction.mult(slider.value());

    startCircle.force.add(direction);
    direction.mult(-1);
    endCircle.force.add(direction);
  });
}
