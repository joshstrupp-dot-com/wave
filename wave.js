// Please note that I leveraged Copilot and ChatGPT to generate the code below.

var offset = 0;
var strum = 0.6;
let planetSelect;
let stopwatch;
let lastTime = 0;

// Target and current values for smoother transition
let currentWaves = 30;
let targetWaves;
let transitionDuration = 5; // Duration in seconds for the transition
let transitionProgress = 0;
let stopwatchSpeed = 1; // Speed of the stopwatch based on planet day length

// Define an array of planets in the same order as in the dropdown
const planets = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

// Preload images
let earthImage, mercuryImage;
let planetImages = {};

function preload() {
  // Load all the planet images
  earthImage = loadImage("Earth.png");
  mercuryImage = loadImage("Mercury.png");
  let venusImage = loadImage("Venus.png");
  let marsImage = loadImage("Mars.png");
  let jupiterImage = loadImage("Jupiter.png");
  let saturnImage = loadImage("Saturn.png");
  let uranusImage = loadImage("Uranus.png");
  let neptuneImage = loadImage("Neptune.png");

  // Add loaded images to the planetImages dictionary
  planetImages["Mercury"] = mercuryImage;
  planetImages["Venus"] = venusImage;
  planetImages["Earth"] = earthImage;
  planetImages["Mars"] = marsImage;
  planetImages["Jupiter"] = jupiterImage;
  planetImages["Saturn"] = saturnImage;
  planetImages["Uranus"] = uranusImage;
  planetImages["Neptune"] = neptuneImage;
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  // Create dropdown for planet selection
  planetSelect = createSelect();
  planetSelect.position(10, 10);
  planetSelect.option("Mercury");
  planetSelect.option("Venus");
  planetSelect.option("Earth");
  planetSelect.option("Mars");
  planetSelect.option("Jupiter");
  planetSelect.option("Saturn");
  planetSelect.option("Uranus");
  planetSelect.option("Neptune");

  // Set the default selected option to "Earth"
  planetSelect.selected("Earth");

  // Hide the dropdown
  planetSelect.hide();

  planetSelect.changed(() => {
    setPlanetSpeed(planetSelect.value());
  });

  // Set initial planet speed
  setPlanetSpeed(planetSelect.value());

  // Initialize stopwatch
  stopwatch = new Stopwatch();

  // Create left and right arrow buttons
  let leftArrow = createButton("<");
  leftArrow.position(width / 2 - 25, height - 50); // Position 50px from the bottom
  leftArrow.mousePressed(() => cyclePlanet(-1));

  let rightArrow = createButton(">");
  rightArrow.position(width / 2 + 25, height - 50); // Position 50px from the bottom
  rightArrow.mousePressed(() => cyclePlanet(1));
}

// Define the day lengths in seconds for each planet
const planetDaysInSeconds = {
  Mercury: 1408 * 60 * 60, // Corrected to match Earth's day in seconds
  Venus: 5832 * 60 * 60,
  Earth: 86400,
  Mars: 24.6 * 60 * 60,
  Jupiter: 9.9 * 60 * 60,
  Saturn: 10.7 * 60 * 60,
  Uranus: 17.2 * 60 * 60,
  Neptune: 16.1 * 60 * 60,
};

function setPlanetSpeed(planet) {
  let planet_day_length = planetDaysInSeconds[planet] || 86400; // Default to Earth if not found

  // Calculate the target number of waves based on the planet's day length
  targetWaves = (86400 / planet_day_length) * 30; // Adjust the multiplier (30) as needed

  // Set the speed of the stopwatch relative to the Earth's seconds per day
  stopwatchSpeed = 86400 / planet_day_length;

  // Reset transition progress for smooth interpolation
  transitionProgress = 0;
}

function cyclePlanet(direction) {
  // Get the current selected planet
  let currentPlanet = planetSelect.value();
  // Find the index of the current planet
  let index = planets.indexOf(currentPlanet);
  // Calculate the new index
  index = (index + direction + planets.length) % planets.length;
  // Get the new planet
  let newPlanet = planets[index];
  // Update the dropdown selection
  planetSelect.selected(newPlanet);
  // Update the planet speed and other parameters
  setPlanetSpeed(newPlanet);
  console.log("Active planet:", planetSelect.value());
}

function updateTransition(deltaTime) {
  // Increment transition progress based on the elapsed time
  transitionProgress += deltaTime / transitionDuration;

  // Clamp transition progress between 0 and 1
  transitionProgress = constrain(transitionProgress, 0, 1);

  // Smoothly interpolate between the current and target number of waves
  currentWaves = lerp(currentWaves, targetWaves, transitionProgress);
}

function draw() {
  background(220);

  // Calculate deltaTime for smooth animation
  let currentTime = millis();
  let deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  // Update the smooth transition for the sine wave
  updateTransition(deltaTime);

  // Draw the sine wave
  stroke(4);
  noFill();
  beginShape();

  // Calculate frequency based on the interpolated currentWaves value
  var frequency = (1 * PI * currentWaves) / width;

  for (var x = 0; x < width; x++) {
    var angle = offset + frequency * x;

    // Amplitude envelope (e.g., a Gaussian or linear function)
    var amplitudeEnvelope = sin((PI * x) / width); // Adjust as needed

    // Modulate the amplitude
    var y = map(
      sin(angle) * amplitudeEnvelope,
      -strum,
      strum,
      height / 2 - 100, // Increase amplitude range
      height / 2 + 100
    );

    vertex(x, y);
  }
  endShape();

  // Adjust the offset to animate the wave
  offset += 0.0016 * currentWaves;

  // Draw the stopwatch
  stopwatch.update(deltaTime); // Pass deltaTime to the update function
  stopwatch.display();
}

class Stopwatch {
  constructor() {
    this.time = 0;
    this.radius = 100;
  }

  update(deltaTime) {
    // Increment time based on deltaTime and the current stopwatchSpeed
    this.time += deltaTime * stopwatchSpeed;
  }

  display() {
    // Get the current planet image based on the selected planet
    let planetImage = planetImages[planetSelect.value()];

    // If the image is available, display it as the background of the stopwatch
    if (planetImage) {
      image(
        planetImage,
        (width - this.radius * 2) / 2,
        (height - this.radius * 2) / 2,
        this.radius * 2,
        this.radius * 2
      );
    }

    // Calculate the angle of the hand
    let angle = map(this.time % 60, 0, 60, 0, TWO_PI) - HALF_PI;

    // Draw the hand
    stroke(0);
    strokeWeight(4);
    line(
      width / 2,
      height / 2,
      width / 2 + this.radius * cos(angle),
      height / 2 + this.radius * sin(angle)
    );

    // Draw stopwatch label (optional)
    // noStroke();
    // fill(0);
    // textAlign(CENTER, CENTER);
    // textSize(18);
    // text(planetSelect.value() + " Stopwatch", width / 2, height / 2 + 120);
  }
}
