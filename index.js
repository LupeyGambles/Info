const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

const getRandomFloat = (min, max) => Math.random() * (max - min + 1) + min;
const getRandomInteger = (min, max) => Math.floor(getRandomFloat(min, max));
const createVector = (x, y) => { return { x, y } };

const clearCanvas = (x, y, height, width) => {
  rectHeight = height || canvasHeight;
  rectWidth = width || canvasWidth;
  context.clearRect(x || 0, y || 0, rectWidth, rectHeight);
  context.beginPath();
}

const circle = (x, y, radius, filled) => {
  const offset = radius / 2;
  x -= offset;
  y -= offset;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  if (filled) {
    context.stroke();
  }
  context.strokeStyle = '#fff';
  context.closePath();
}

const vectorAddition = (vectorA, vectorB) => {
  if (typeof vectorB === 'number') {
    return { x: vectorA.x + vectorB, y: vectorA.y + vectorB };
  }
  return { x: vectorA.x + vectorB.x, y: vectorA.y + vectorB.y };
}

const vectorSubtraction = (vectorA, vectorB) => {
  if (typeof vectorB === 'number') {
    return { x: vectorA.x - vectorB, y: vectorA.y - vectorB };
  }
  return { x: vectorA.x - vectorB.x, y: vectorA.y - vectorB.y };
}

const vectorMultiplication = (vectorA, vectorB) => {
  if (typeof vectorB === 'number') {
    return { x: vectorA.x * vectorB, y: vectorA.y * vectorB };
  }
  return { x: vectorA.x * vectorB.x, y: vectorA.y * vectorB.y };
}

const vectorDivision = (vectorA, vectorB) => {
  if (typeof vectorB === 'number') {
    return { x: vectorA.x / vectorB, y: vectorA.y / vectorB };
  }
  return { x: vectorA.x / vectorB.x, y: vectorA.y / vectorB.y };
}

const checkRaindropCollision = (location, radius) => {
  let rain = { collided: false, location: null }
  if ((location.y - canvasHeight) >= radius) {
    rain.collided = true;
    rain.location = createVector(getRandomInteger(radius, canvasWidth-radius), radius - 10)
  } else if ((location.x + radius) <= 0) {
    rain.collided = true;
    rain.location = createVector(canvasWidth - radius, location.y)
  } else if ((location.x + radius) >= canvasWidth) {
    rain.collided = true;
    rain.location = createVector(radius, location.y)
  } else {
    rain.collided = false;
    rain.location = null; 
  }
  return rain;
}

const raintype = {
  drizzle: { count: 30, speed: 0.27 },
  light: { count: 100, speed: 0.3 },
  medium: { count: 250, speed: 0.4 },
  downpour: { count: 500, speed: 0.5 },
  afteshower: { count: 3, speed: 0.4 }
}

const environment = {
  wind: createVector(-0.05, 0),
  raintype: raintype.medium,
}

class RainParticle {
  constructor(x, accX, accY){
    this.damping = 0.025;
    this.location = createVector(x, canvasHeight); 
    this.radius = 0.4;
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(accX, -(accY * this.damping));
    this.mass = 1;
  }

  draw(particles, index) {
    const { x, y } = this.location;
    if (this.acceleration.y >= 0.3) {
      delete particles[index];
      return particles.splice(index, 1)
    }
    return circle(x, y, this.radius, true);
  }

  splash() {
    this.velocity = vectorAddition(this.velocity, this.acceleration);
    this.location = vectorAddition(this.location, this.velocity);
    this.acceleration = vectorAddition(this.acceleration, { x: 0, y: 0.12 });
  }
}

class Raindrop {
  constructor(x, y, radius, accY){
    this.location = createVector(x, y); 
    this.radius = radius;
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, accY);
    this.mass = 1;

    this.wind = environment.wind;
    this.acceleration = vectorAddition(this.acceleration, this.wind);
  }

  draw() {
    const { x, y } = this.location;
    return circle(x, y, this.radius, true);
  }

  fall() { 
    if (this.velocity.y <= (environment.raintype.speed * 50)) {
      this.velocity = vectorAddition(this.velocity, this.acceleration);
    }
    this.location = vectorAddition(this.location, this.velocity);
  }

  relive(raindrop) {
    const { location } = raindrop;
    this.location = createVector(location.x, location.y); 
    this.velocity = createVector(0, 0);
  }
}

const particleX = [-0.12, 0.06, 0, 0.06, 0.12];
const getParticleX = function() {
  const index = Math.floor(Math.random() * particleX.length);
  return particleX[index];
}

// init all objects here
let raindrop = [];
let particles = [];
const raindropCount = environment.raintype.count;

for (let i = 0 ; i < raindropCount ; i++) {
  let x = getRandomInteger(2, canvasWidth - 2);
  let y = getRandomInteger(-2000 , 0);
  // let accY = getRandomFloat(1, 5) * 0.05;
  let accY = environment.raintype.speed;
  raindrop[i] = new Raindrop(x, y, 1.3, accY);
}

// initiate all draw functions here
const setup = function() {
  for (let i = 0 ; i < raindropCount ; i++) {
    raindrop[i].draw();
  }
}

// continuous animation loop
const animate = function() {
  clearCanvas(); // don't remove this

  for (let i = 0 ; i < raindropCount ; i++) {
    let { location, radius, velocity } = raindrop[i];
    let rain = checkRaindropCollision(location, radius);
    if (rain.collided) {
      let particle1 = new RainParticle(location.x, getParticleX(), velocity.y);
      particles.push(particle1);
      let particle4 = new RainParticle(location.x, getParticleX(), velocity.y);
      particles.push(particle4);

      raindrop[i].relive(rain);
    }
    raindrop[i].fall();
    raindrop[i].draw();
  }

  for (let i = 0; i < particles.length; i ++) {
    particles[i].splash();
    particles[i].draw(particles, i);
  }
  requestAnimationFrame(animate);
}

// animation initiate
setup();
requestAnimationFrame(animate);