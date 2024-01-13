const APP_PARAMS = {
  minBalls: 10,
  maxBalls: 25,
  lineColor: "black",
  lineWidth: 2,
  cursorGrabDistance: 250,
  cursorGravity: -0.025,
  radiusToMassRatio: 0.01,
  speedToMomentumRatio: 0.01,
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

const moveBall = (ball) => {
  ball.x += ball.dx;
  ball.y += ball.dy;
};

const bounceBall = (ball) => {
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
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

const getBallMomentum = (ball) => {
  return (
    Math.sqrt(ball.dx ** 2 + ball.dy ** 2) *
    APP_PARAMS.speedToMomentumRatio *
    ball.radius *
    APP_PARAMS.radiusToMassRatio
  );
};

const connectBalls = (ball1, ball2) => {
  const ball1Momentum = getBallMomentum(ball1);
  const ball2Momentum = getBallMomentum(ball2);

  const strongerBall = ball1Momentum > ball2Momentum ? ball1 : ball2;
  const weakerBall = ball1Momentum > ball2Momentum ? ball2 : ball1;

  const massChange =
    Math.abs(ball1Momentum - ball2Momentum) * weakerBall.radius;

  if (weakerBall.radius - massChange > 1) {
    weakerBall.radius -= massChange;
  } else {
    balls.splice(balls.indexOf(weakerBall), 1);
  }

  strongerBall.radius += massChange;

  strongerBall.dx *= 0.99;
  strongerBall.dy *= 0.99;
  weakerBall.dx *= 1.01;
  weakerBall.dy *= 1.01;
};

const handleMouseMove = (e) => {
  const mouse = {
    x: e.clientX,
    y: e.clientY,
  };

  balls.forEach((ball) => {
    if (getDistance(mouse, ball) < APP_PARAMS.cursorGrabDistance) {
      ball.x += (mouse.x - ball.x) * APP_PARAMS.cursorGravity;
      ball.y += (mouse.y - ball.y) * APP_PARAMS.cursorGravity;
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach((ball) => {
    drawBall(ball);
    moveBall(ball);
    bounceBall(ball);

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
