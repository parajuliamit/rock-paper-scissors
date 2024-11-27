let video;
let handPose;
let hands = [];

let playStat = "none";

function preload() {
  handPose = ml5.handPose();
}

function gotHands(results) {
  hands = results;
}
const playButton = document.getElementById("play");

function onPlay() {
  loop();
  playButton.style.display = "none";
  playStat = "rock";

  setTimeout(() => {
    playStat = "paper";
  }, 700);
  setTimeout(() => {
    playStat = "scissors";
  }, 1400);
  setTimeout(() => {
    playStat = "go";
  }, 2100);
  setTimeout(() => {
    playStat = "result";
  }, 2600);
  setTimeout(() => {
    playButton.style.display = "inline";
    playButton.innerText = "Play Again";
    playStat = "none";
    playButton.addEventListener("click", onPlay);
  }, 5000);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  document.getElementById("loading-screen").style.display = "none";
  playButton.style.display = "inline";
  playButton.addEventListener("click", onPlay);
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
  background(0);
  if (playStat == "none") {
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Press Play To Start", width / 2, height / 3);
  } else if (playStat == "result") {
    drawResultHand();
    noLoop();
  } else {
    drawCountdown();
    tint(255, 50);
    image(video, 0, 0);
    noTint();
  }
}

async function drawResultHand() {
  background(0);
  strokeWeight(5);
  stroke(255, 0, 255);
  const img = video.get();
  await handPose.detect(img, gotHands);
  image(img, 0, 0);
  console.log(hands);
  const confidentHands = hands.filter((hand) => hand.confidence > 0.5);
  if (confidentHands.length < 2) {
    textAlign(CENTER, CENTER);
    fill(255);
    if (confidentHands.length == 1) {
      drawHandLines(confidentHands[0]);
      textSize(32);
      text("Only one hand found", width / 2, height - 50);
    } else {
      textSize(32);
      text("No hands detected", width / 2, height - 50);
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
  const pos2 = drawHandLines(confidentHands[1]);
  const winner = getWinner(pos1, pos2);
  textSize(28);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
  if (winner == "player1") {
    fill(255, 0, 255);
    text(pos1 + " WINS", width / 2, height - 25);
    textSize(16);
    fill(0, 255, 0);
    text(
      "👍\nWINNER",
      confidentHands[0].middle_finger_mcp.x,
      confidentHands[0].middle_finger_mcp.y
    );
    fill(255, 0, 0);
    text(
      "👎\nLOSER",
      confidentHands[1].middle_finger_mcp.x,
      confidentHands[1].middle_finger_mcp.y
    );
  } else if (winner == "player2") {
    fill(255, 255, 0);
    text(pos2 + " WINS", width / 2, height - 25);
    textSize(16);
    fill(0, 255, 0);
    text(
      "👍\nWINNER",
      confidentHands[1].middle_finger_mcp.x,
      confidentHands[1].middle_finger_mcp.y
    );
    fill(255, 0, 0);
    text(
      "👎\nLOSER",
      confidentHands[0].middle_finger_mcp.x,
      confidentHands[0].middle_finger_mcp.y
    );
  } else {
    text(winner, width / 2, height - 25);
  }
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
  noStroke();
  fill(255);
  textSize(16);
  text(gesture, hand.keypoints[0].x, hand.keypoints[0].y);
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
