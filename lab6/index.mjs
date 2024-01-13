const APP_PARAMS = {
  speed: 15,
  minBalls: 10,
  maxBalls: 25,
  lineColor: "black",
  lineWidth: 2,
  cursorGrabDistance: 250,
  cursorGravity: -0.2,
  radiusToMassRatio: 0.01,
  speedToMomentumRatio: 0.01,
  massExchangeRate: 0.1,
};

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const balls = [];

const initBall = () => {
  const ball = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: Math.random() * 10 - 5,
    dy: Math.random() * 10 - 5,
    radius: Math.random() * 10 + 10,
    color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    })`,
  };
  balls.push(ball);
};

const drawBall = (ball) => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
};

let lastTimestamp = 0;

const moveBall = (ball, deltaTime) => {
  ball.x += ball.dx * deltaTime;
  ball.y += ball.dy * deltaTime;
};

const bounceBall = (ball, deltaTime) => {
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
  ball.x += ball.dx * deltaTime;
  ball.y += ball.dy * deltaTime;
};

const getDistance = (ball1, ball2) => {
  const xDistance = ball1.x - ball2.x;
  const yDistance = ball1.y - ball2.y;
  return Math.sqrt(xDistance ** 2 + yDistance ** 2);
};

const drawLine = (ball1, ball2) => {
  ctx.beginPath();
  ctx.moveTo(ball1.x, ball1.y);
  ctx.lineTo(ball2.x, ball2.y);
  ctx.strokeStyle = APP_PARAMS.lineColor;
  ctx.lineWidth = APP_PARAMS.lineWidth;
  ctx.stroke();
};

const connectBalls = (ball1, ball2) => {
  const distance = getDistance(ball1, ball2);
  const overlap = ball1.radius + ball2.radius - distance;

  if (overlap > 0) {
    const massChange =
      Math.min(ball1.radius, ball2.radius) * APP_PARAMS.massExchangeRate;
    ball1.radius += massChange;
    ball2.radius -= massChange;

    const tempDx = ball1.dx;
    const tempDy = ball1.dy;
    ball1.dx = ball2.dx;
    ball1.dy = ball2.dy;
    ball2.dx = tempDx;
    ball2.dy = tempDy;

    const angle = Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);
    ball1.x -= overlap * Math.cos(angle);
    ball1.y -= overlap * Math.sin(angle);
    ball2.x += overlap * Math.cos(angle);
    ball2.y += overlap * Math.sin(angle);
  }
};

const handleMouseMove = (e) => {
  const mouse = {
    x: e.clientX,
    y: e.clientY,
  };

  balls.forEach((ball) => {
    if (getDistance(mouse, ball) < APP_PARAMS.cursorGrabDistance) {
      const angle = Math.atan2(mouse.y - ball.y, mouse.x - ball.x);
      ball.dx += Math.cos(angle) * APP_PARAMS.cursorGravity;
      ball.dy += Math.sin(angle) * APP_PARAMS.cursorGravity;
    }
  });
};

const handleMouseClick = (e) => {
  const mouse = {
    x: e.clientX,
    y: e.clientY,
  };

  balls.forEach((ball) => {
    if (getDistance(mouse, ball) < ball.radius) {
      balls.splice(balls.indexOf(ball), 1);
      initBall();
      initBall();
    }
  });
};

const animate = () => {
  const time = new Date().getTime();
  const deltaTime = (time - lastTimestamp) / (1000 / APP_PARAMS.speed);
  lastTimestamp = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach((ball) => {
    drawBall(ball);
    moveBall(ball, deltaTime);
    bounceBall(ball, deltaTime);

    balls.forEach((otherBall) => {
      if (ball !== otherBall) {
        if (getDistance(ball, otherBall) < ball.radius + otherBall.radius) {
          drawLine(ball, otherBall);
          connectBalls(ball, otherBall);
        }
      }
    });
  });
  requestAnimationFrame(animate);
};

const init = () => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("click", handleMouseClick);
  const numberOfBalls =
    Math.floor(Math.random() * APP_PARAMS.maxBalls) + APP_PARAMS.minBalls;
  for (let i = 0; i < numberOfBalls; i++) {
    initBall();
  }
  animate();
};

init();
