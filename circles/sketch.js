// Array to store circle objects
let circles = [];
let colorPalette = [];
let circleLayer; // Ephemeral layer for circles
let trailLayer;  // Persistent layer for trail
let prevTrailX, prevTrailY; // Previous trail point for line drawing
let speedSlider; // Speed control slider
let showCirclesCheckbox; // Checkbox to show/hide circles
let initialThetaSliders = []; // Array to store initial theta sliders
let radiusSliders = []; // Array to store radius sliders
let previousThetaValues = []; // To track theta slider changes
let previousRadiusValues = []; // To track radius slider changes

function setup() {
  frameRate(60);

  // Create canvas and attach it to the sketch-holder div
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-holder');

  speedSlider = createSlider(1, 50, 1, 1);
  speedSlider.position(20, 20);
  speedSlider.size(200);

  // Create checkbox to show/hide circles
  showCirclesCheckbox = createCheckbox('Show Circles', true);
  showCirclesCheckbox.position(20, 50);

  // Create graphics layers
  circleLayer = createGraphics(windowWidth, windowHeight);
  trailLayer = createGraphics(windowWidth, windowHeight);

  // Set transparent background for trail layer
  trailLayer.clear();

  // Initialize color palette
  colorPalette = [
    color(255, 100, 100),  // Red
    color(100, 255, 100),  // Green
    color(100, 100, 255),  // Blue
    color(255, 255, 100),  // Yellow
    color(255, 100, 255),  // Magenta
    color(100, 255, 255),  // Cyan
    color(255, 150, 50),   // Orange
    color(150, 50, 255)    // Purple
  ];

  const vels = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]

  // Create circles and their corresponding sliders
  for (let i of vels) {
    if (i == 0) continue;
    let initialTheta = 0;

    circles.push(new Circle(
      0,
      colorPalette[Math.abs(i) % colorPalette.length],
      i * 0.02,
      initialTheta
    ));

    startY = 80 + (5+i) * 80;

    // Create initial theta slider for each circle (0 to 2π)
    let thetaSlider = createSlider(0, TWO_PI, initialTheta, 0.01);
    thetaSlider.position(20, startY);
    thetaSlider.size(200);
    initialThetaSliders.push(thetaSlider);
    previousThetaValues.push(initialTheta);

    // Create radius slider for each circle
    let radiusSlider = createSlider(0, 200, 0, 1);
    radiusSlider.position(20, startY + 30);
    radiusSlider.size(200);
    radiusSliders.push(radiusSlider);
    previousRadiusValues.push(0);
  }
}

function draw() {
  // Clear main canvas
  background(20, 20, 30);

  // Check for slider changes and reset animation if needed
  let shouldReset = false;
  for (let i = 0; i < circles.length; i++) {
    let currentTheta = initialThetaSliders[i].value();
    let currentRadius = radiusSliders[i].value();

    if (currentTheta !== previousThetaValues[i]) {
      circles[i].initialTheta = currentTheta;
      previousThetaValues[i] = currentTheta;
      shouldReset = true;
    }

    if (currentRadius !== previousRadiusValues[i]) {
      circles[i].radius = currentRadius;
      previousRadiusValues[i] = currentRadius;
      shouldReset = true;
    }
  }

  // Reset animation if any slider changed
  if (shouldReset) {
    trailLayer.clear();
    prevTrailX = undefined;
    prevTrailY = undefined;
    // Reset all circle positions to their initial theta
    for (let circle of circles) {
      circle.theta = circle.initialTheta;
    }
  }

  // Get speed from slider
  let speed = speedSlider.value();

  // Perform multiple simulation steps based on speed
  for (let step = 0; step < speed; step++) {
    // Clear circle layer for each step
    circleLayer.background(0, 0, 0, 255);

    // Update circles (always update for trail calculation)
    for (let i = 0; i < circles.length; i++) {
      let circle = circles[i];
      circle.update();
      // Only display circles if checkbox is checked
      if (showCirclesCheckbox.checked()) {
        circle.display(i > 0 ? circles[i - 1] : null, circleLayer);
      } else {
        // Still calculate positions for trail even when circles are hidden
        if (i > 0) {
          circle.x = circles[i - 1].radius * cos(circle.theta) + circles[i - 1].x;
          circle.y = circles[i - 1].radius * sin(circle.theta) + circles[i - 1].y;
        } else {
          circle.x = width / 2;
          circle.y = height / 2;
        }
      }
    }

    // Calculate trail point
    const lastCircle = circles[circles.length - 1];
    let trailX = lastCircle.radius * cos(lastCircle.theta) + lastCircle.x;
    let trailY = lastCircle.radius * sin(lastCircle.theta) + lastCircle.y;

    // Draw trail line
    if (prevTrailX !== undefined && prevTrailY !== undefined) {
      trailLayer.stroke(255, 255, 255);
      trailLayer.strokeWeight(1);
      trailLayer.line(prevTrailX, prevTrailY, trailX, trailY);
    }

    // Update previous trail point
    prevTrailX = trailX;
    prevTrailY = trailY;
  }

  // Draw layers to main canvas
  image(circleLayer, 0, 0);
  image(trailLayer, 0, 0);
}

class Circle {
  constructor(radius, c, angularVelocity, initialTheta = 0) {
    this.initialTheta = initialTheta;
    this.theta = initialTheta;
    this.radius = radius;
    this.color = c;
    this.angularVelocity = angularVelocity;
    this.x = 0;
    this.y = 0;
  }

  update() {
    this.theta += this.angularVelocity;
  }

  display(previousCircle, layer = window) {
    let x, y;
    if (previousCircle) {
      this.x = previousCircle.radius * cos(this.theta) + previousCircle.x;
      this.y = previousCircle.radius * sin(this.theta) + previousCircle.y;
    } else {
      this.x = width / 2;
      this.y = height / 2;
    }

    layer.fill(this.color);
    layer.noStroke();
    layer.ellipse(this.x, this.y, this.radius * 2);
  }
}
