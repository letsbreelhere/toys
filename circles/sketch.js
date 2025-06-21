// Array to store circle objects
let circles = [];
let colorPalette = [];
let circleLayer; // Ephemeral layer for circles
let trailLayer;  // Persistent layer for trail

function setup() {
  // Create canvas and attach it to the sketch-holder div
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-holder');

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

  for (let i = 0; i < 8; i++) {
    circles.push(new Circle(
      100 - i * 10,
      colorPalette[i % colorPalette.length],
      Math.random() * 0.01 + 0.01
    ));
  }
}

function draw() {
  // Clear main canvas
  background(20, 20, 30);

  // Clear the ephemeral circle layer
  circleLayer.background(0, 0, 0, 90); // Transparent background

  // Draw circles on the ephemeral layer
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];
    circle.update();
    circle.display(i > 0 ? circles[i - 1] : null, circleLayer);
  }

  const lastCircle = circles[circles.length - 1];

  // Calculate the current position of the point at the edge of the last circle
  let trailX = lastCircle.radius * cos(lastCircle.theta) + lastCircle.x;
  let trailY = lastCircle.radius * sin(lastCircle.theta) + lastCircle.y;

  // Draw the trail point on the persistent layer
  trailLayer.fill(255, 255, 255);
  trailLayer.noStroke();
  trailLayer.ellipse(trailX, trailY, 2);

  image(circleLayer, 0, 0);
  image(trailLayer, 0, 0);
}

class Circle {
  constructor(radius, c, angularVelocity) {
    this.theta = 0;
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
