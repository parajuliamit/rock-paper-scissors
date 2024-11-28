let video;
let handPose;
let hands = [];

let playStat = "none";
let currentMode;
let computerScore = 0;
let playerScore = 0;

function preload() {
  handPose = ml5.handPose();
}

function gotHands(results) {
  hands = results;
}
const playButton = document.getElementById("play");
const playWithAIButton = document.getElementById("playAI");
const playerScoreDiv = document.getElementById("playerScore");
const computerScoreDiv = document.getElementById("computerScore");
const resultDiv = document.getElementById("result");

function onPlay() {
  loop();
  playButton.style.display = "none";
  playWithAIButton.style.display = "none";
  playStat = "rock";

  setTimeout(() => {
    playStat = "paper";
  }, 600);
  setTimeout(() => {
    playStat = "scissors";
  }, 1200);
  setTimeout(() => {
    playStat = "go";
  }, 1800);
  setTimeout(() => {
    playStat = "result";
  }, 2200);
  setTimeout(() => {
    playButton.style.display = "inline";
    playWithAIButton.style.display = "inline";
    if (currentMode == "single") {
      playWithAIButton.innerText = "Play Again";
      playButton.innerText = "Two Players";
    } else {
      playButton.innerText = "Play Again";
      playWithAIButton.innerText = "One Player";
    }
    playStat = "none";
  }, 5000);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  document.getElementById("loading-screen").style.display = "none";
  playButton.style.display = "inline";
  playWithAIButton.style.display = "inline";
  playWithAIButton.addEventListener("click", () => {
    currentMode = "single";
    onPlay();
  });
  playButton.addEventListener("click", () => {
    currentMode = "double";
    onPlay();
  });
  const resetButton = document.getElementById("reset");
  resetButton.addEventListener("click", () => {
    if (!confirm("Are you sure you want to reset the scores?")) return;
    playerScore = 0;
    computerScore = 0;
    playerScoreDiv.innerText = playerScore;
    computerScoreDiv.innerText = computerScore;
  });

  noLoop();
}

function drawCountdown() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  if (playStat == "rock") {
    background(255, 0, 0);
    text("🪨\nRock", width / 2, height / 2);
  } else if (playStat == "paper") {
    background(0, 255, 255);
    textSize(32);
    text("📄\nPaper", width / 2, height / 2);
  } else if (playStat == "scissors") {
    background(0, 0, 255);
    textSize(32);
    text("✂️\nScissors", width / 2, height / 2);
  } else {
    background(0, 255, 0);
    textSize(32);
    text("GO", width / 2, height / 2);
  }
}

function draw() {
  resultDiv.style.display = "none";
  if (!currentMode || currentMode == "single") {
    resultDiv.style.display = "block";
  } else {
    resultDiv.style.display = "none";
  }
  background(0);
  if (playStat == "none") {
    textSize(24);
    textAlign(CENTER, CENTER);
    fill(255);
    text("Let's Play !", width / 2, height / 2 - 50);
  } else if (playStat == "result") {
    drawResultHand();
    noLoop();
  } else {
    drawCountdown();
    tint(255, 50);
    image(video, 0, 0, width, height, 0, 0, video.width, video.height, CONTAIN);
    noTint();
  }
}

async function drawResultHand() {
  push();
  const img = video.get();
  await handPose.detect(img, gotHands);
  tint(100);
  image(img, 0, 0, width, height, 0, 0, img.width, img.height, CONTAIN);
  tint(255);
  const scaleFactor = min(width / img.width, height / img.height);
  if (currentMode == "single") {
    onePlayerResult(scaleFactor);
  } else {
    twoPlayerResult(scaleFactor);
  }
}

function onePlayerResult(scaleFactor) {
  if (!hands.length) {
    drawResultText("No hands found");
    return;
  }
  const mostConfidentHand = hands.reduce((a, b) =>
    a.confidence > b.confidence ? a : b
  );

  const computerChoice = random(["ROCK", "PAPER", "SCISSORS"]);
  fill(255);
  stroke(0);
  strokeWeight(4);
  textAlign(CENTER, TOP);
  textSize(16);
  text("Computer's Choice", width / 2, height / 2 - 160);
  textSize(100);
  text(
    computerChoice == "ROCK" ? "🪨" : computerChoice == "PAPER" ? "📄" : "✂️",
    width / 2,
    height / 2 - 130
  );
  textSize(24);
  text(computerChoice, width / 2, height / 2 - 80);

  translate(
    (width - video.width * scaleFactor) / 2,
    (height - video.height * scaleFactor) / 2
  );
  scale(scaleFactor);

  strokeWeight(5);
  stroke(255, 0, 255);
  const playerGuess = drawHandLines(mostConfidentHand);
  const winner = getWinner(playerGuess, computerChoice);
  textSize(28);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
  let result = winner;
  if (winner == "player1") {
    result = "PLAYER WINS";
    textSize(16);
    textStyle(BOLD);
    fill(0, 255, 0);
    text(
      "WINNER 👍",
      mostConfidentHand.keypoints[0].x,
      mostConfidentHand.keypoints[0].y + 20
    );
    playerScore++;
    playerScoreDiv.innerText = playerScore;
  } else if (winner == "player2") {
    result = "COMPUTER WINS";
    textSize(16);
    fill(0, 255, 0);
    textStyle(BOLD);
    text(
      "LOSER 👎",
      mostConfidentHand.keypoints[0].x,
      mostConfidentHand.keypoints[0].y + 20
    );
    computerScore++;
    computerScoreDiv.innerText = computerScore;
  }
  drawResultText(result);
}

function twoPlayerResult(scaleFactor) {
  const confidentHands = hands.sort((a, b) => b.confidence - a.confidence);

  translate(
    (width - video.width * scaleFactor) / 2,
    (height - video.height * scaleFactor) / 2
  );
  scale(scaleFactor);

  strokeWeight(5);
  stroke(255, 0, 255);

  if (confidentHands.length < 2) {
    textAlign(CENTER, CENTER);
    fill(255);
    if (confidentHands.length == 1) {
      drawHandLines(confidentHands[0]);
      drawResultText("Only one hand found");
    } else {
      drawResultText("No hands found");
      if (!!hands.length) {
        for (let hand of hands) {
          drawHandLines(hand);
        }
      }
    }
    return;
  }
  const pos1 = drawHandLines(confidentHands[0]);
  stroke(255, 255, 0);
  strokeWeight(5);
  const pos2 = drawHandLines(confidentHands[1]);
  const winner = getWinner(pos1, pos2);
  textSize(28);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
  let result = winner;
  if (winner == "player1") {
    result = pos1 + " WINS";
    textSize(16);
    textStyle(BOLD);
    fill(0, 255, 0);
    text(
      "WINNER 👍",
      confidentHands[0].keypoints[0].x,
      confidentHands[0].keypoints[0].y + 20
    );
    fill(255, 0, 0);
    text(
      "LOSER 👎",
      confidentHands[1].keypoints[0].x,
      confidentHands[1].keypoints[0].y + 20
    );
  } else if (winner == "player2") {
    result = pos2 + " WINS";
    textSize(16);
    fill(0, 255, 0);
    textStyle(BOLD);
    text(
      "WINNER 👍",
      confidentHands[1].keypoints[0].x,
      confidentHands[1].keypoints[0].y + 20
    );
    fill(255, 0, 0);
    text(
      "LOSER 👎",
      confidentHands[0].keypoints[0].x,
      confidentHands[0].keypoints[0].y + 20
    );
  }
  drawResultText(result);
}

function drawResultText(result) {
  pop();
  fill(255, 255, 0);
  stroke(0);
  strokeWeight(4);
  textSize(32);
  textStyle(BOLD);
  textAlign(CENTER);
  text(result, width / 2, height / 2 + 50);
}

function getWinner(pos1, pos2) {
  if (pos1 == pos2) {
    return "DRAW";
  }
  if (pos1 == "ROCK") {
    if (pos2 == "SCISSORS") {
      return "player1";
    } else if (pos2 == "PAPER") {
      return "player2";
    }
  } else if (pos1 == "PAPER") {
    if (pos2 == "ROCK") {
      return "player1";
    }
    if (pos2 == "SCISSORS") {
      return "player2";
    }
  } else if (pos1 == "SCISSORS") {
    if (pos2 == "PAPER") {
      return "player1";
    }
    if (pos2 == "ROCK") {
      return "player2";
    }
  }
  return "NO RESULT";
}

function drawHandLines(hand) {
  for (let j = 0; j < 4; j++) {
    line(
      hand.keypoints[j].x,
      hand.keypoints[j].y,
      hand.keypoints[j + 1].x,
      hand.keypoints[j + 1].y
    );
  }
  for (let i = 5; i < hand.keypoints.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      line(
        hand.keypoints[i + j].x,
        hand.keypoints[i + j].y,
        hand.keypoints[i + j + 1].x,
        hand.keypoints[i + j + 1].y
      );
    }
  }
  let gesture = detectGesture(hand);
  strokeWeight(2);
  stroke(0);
  fill(255);
  textSize(16);
  text(gesture, hand.keypoints[0].x, hand.keypoints[0].y - 10);
  return gesture;
}

function getAngles(hand) {
  const indexFingerTipVector = createVector(
    hand.index_finger_tip.x - hand.index_finger_pip.x,
    hand.index_finger_tip.y - hand.index_finger_pip.y
  );
  const indexFingerBaseVector = createVector(
    hand.index_finger_mcp.x - hand.index_finger_pip.x,
    hand.index_finger_mcp.y - hand.index_finger_pip.y
  );
  const index_angle = indexFingerTipVector.angleBetween(indexFingerBaseVector);
  const middleFingerTipVector = createVector(
    hand.middle_finger_tip.x - hand.middle_finger_pip.x,
    hand.middle_finger_tip.y - hand.middle_finger_pip.y
  );
  const middleFingerBaseVector = createVector(
    hand.middle_finger_mcp.x - hand.middle_finger_pip.x,
    hand.middle_finger_mcp.y - hand.middle_finger_pip.y
  );
  const middle_angle = middleFingerTipVector.angleBetween(
    middleFingerBaseVector
  );

  const ringFingerTipVector = createVector(
    hand.ring_finger_tip.x - hand.ring_finger_pip.x,
    hand.ring_finger_tip.y - hand.ring_finger_pip.y
  );
  const ringFingerBaseVector = createVector(
    hand.ring_finger_mcp.x - hand.ring_finger_pip.x,
    hand.ring_finger_mcp.y - hand.ring_finger_pip.y
  );
  const ring_angle = ringFingerTipVector.angleBetween(ringFingerBaseVector);

  const pinkyFingerTipVector = createVector(
    hand.pinky_finger_tip.x - hand.pinky_finger_pip.x,
    hand.pinky_finger_tip.y - hand.pinky_finger_pip.y
  );

  const pinkyFingerBaseVector = createVector(
    hand.pinky_finger_mcp.x - hand.pinky_finger_pip.x,
    hand.pinky_finger_mcp.y - hand.pinky_finger_pip.y
  );

  const pinky_angle = pinkyFingerTipVector.angleBetween(pinkyFingerBaseVector);
  return { index_angle, middle_angle, ring_angle, pinky_angle };
}

function detectGesture(hand) {
  const { index_angle, middle_angle, ring_angle, pinky_angle } =
    getAngles(hand);
  if (
    abs(index_angle) < PI / 2 &&
    abs(middle_angle) < PI / 2 &&
    abs(ring_angle) < PI / 2 &&
    abs(pinky_angle) < PI / 2
  ) {
    return "ROCK";
  } else if (
    abs(index_angle) > (3 * PI) / 4 &&
    abs(middle_angle) > (3 * PI) / 4 &&
    abs(ring_angle) > (3 * PI) / 4 &&
    abs(pinky_angle) > (3 * PI) / 4
  ) {
    return "PAPER";
  } else if (
    abs(index_angle) > PI / 2 &&
    abs(middle_angle) > PI / 2 &&
    abs(ring_angle) < PI / 2 &&
    abs(pinky_angle) < PI / 2
  ) {
    return "SCISSORS";
  } else if (
    abs(middle_angle) > PI / 2 &&
    abs(ring_angle) < PI / 2 &&
    abs(index_angle) < PI / 2 &&
    abs(pinky_angle) < PI / 2
  ) {
    return "🤬";
  } else {
    return "NONE";
  }
}
