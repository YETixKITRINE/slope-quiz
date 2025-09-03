
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNonZeroInt(min, max) {
  let n = 0;
  while (n === 0) {
    n = getRandomInt(min, max);
  }
  return n;
}

function generatePointQuestion() {
  const x = getRandomInt(-9, 9);
  const y = getRandomInt(-9, 9);
  const correct = `(${x}, ${y})`;
  let choices = [correct];
  while (choices.length < 4) {
    let rx = getRandomInt(-10, 10);
    let ry = getRandomInt(-10, 10);
    let choice = `(${rx}, ${ry})`;
    if (!choices.includes(choice)) choices.push(choice);
  }
  choices = shuffle(choices);
  return {
    type: 'point',
    prompt: 'Which point is plotted on the graph?',
    point: {x, y},
    choices,
    answer: choices.indexOf(correct)
  };
}

function generateSlopeQuestion() {
  // Pick integer slope
  const m = getRandomNonZeroInt(-5, 5);
  const x1 = getRandomInt(-8, 8);
  const y1 = getRandomInt(-8, 8);
  let x2 = x1 + getRandomNonZeroInt(1, 5);
  if (x2 > 10) x2 = x1 - getRandomNonZeroInt(1, 5);
  const y2 = y1 + m * (x2 - x1);
  // Ensure y2 is in bounds
  if (y2 < -10 || y2 > 10) return generateSlopeQuestion();
  const correct = m.toString();
  let choices = [correct];
  while (choices.length < 4) {
    let fake = getRandomNonZeroInt(-5, 5).toString();
    if (!choices.includes(fake)) choices.push(fake);
  }
  choices = shuffle(choices);
  return {
    type: 'slope',
    prompt: 'What is the slope of the line shown?',
    line: {p1: {x: x1, y: y1}, p2: {x: x2, y: y2}},
    choices,
    answer: choices.indexOf(correct)
  };
}

function generateEquationQuestion() {
  // Pick integer m and b
  const m = getRandomNonZeroInt(-5, 5);
  const b = getRandomInt(-8, 8);
  // Pick two x values
  const x1 = getRandomInt(-8, 8);
  const x2 = x1 + getRandomNonZeroInt(1, 5);
  // Calculate y values
  const y1 = m * x1 + b;
  const y2 = m * x2 + b;
  // Ensure y1/y2 in bounds
  if (y1 < -10 || y1 > 10 || y2 < -10 || y2 > 10) return generateEquationQuestion();
  const correct = `y = ${m}x + ${b}`;
  let choices = [correct];
  while (choices.length < 4) {
    let fm = getRandomNonZeroInt(-5, 5);
    let fb = getRandomInt(-8, 8);
    let fake = `y = ${fm}x + ${fb}`;
    if (!choices.includes(fake)) choices.push(fake);
  }
  choices = shuffle(choices);
  return {
    type: 'equation',
    prompt: 'What is the equation of the line shown?',
    line: {p1: {x: x1, y: y1}, p2: {x: x2, y: y2}},
    choices,
    answer: choices.indexOf(correct)
  };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestions() {
  let questions = [];
  // At least 1 equation, 1 slope, 1 point, rest random
  questions.push(generateEquationQuestion());
  questions.push(generateSlopeQuestion());
  questions.push(generatePointQuestion());
  let types = ['equation', 'slope', 'point'];
  while (questions.length < 5) {
    let t = types[getRandomInt(0,2)];
    if (t === 'equation') questions.push(generateEquationQuestion());
    else if (t === 'slope') questions.push(generateSlopeQuestion());
    else questions.push(generatePointQuestion());
  }
  return questions;
}

let questions = generateQuestions();

function drawGraph(canvas, question) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(30, canvas.height/2);
  ctx.lineTo(canvas.width-30, canvas.height/2);
  ctx.moveTo(canvas.width/2, 30);
  ctx.lineTo(canvas.width/2, canvas.height-30);
  ctx.stroke();
  // Draw grid and axis numbers
  ctx.strokeStyle = '#ccc';
  ctx.font = '12px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for(let i=-10;i<=10;i++){
    let x = mapX(i, canvas);
    let y = mapY(i, canvas);
    // Grid lines
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x, canvas.height-30);
    ctx.moveTo(30, y);
    ctx.lineTo(canvas.width-30, y);
    ctx.stroke();
    // X axis numbers
    if (i !== 0) {
      ctx.fillText(i, x, canvas.height/2 + 18);
    }
    // Y axis numbers
    if (i !== 0) {
      ctx.fillText(i, canvas.width/2 - 18, y);
    }
  }
  // Draw 0 at origin
  ctx.fillText('0', canvas.width/2 - 18, canvas.height/2 + 18);
  // Draw question
  if(question.type==='point'){
    ctx.fillStyle = 'red';
    let px = mapX(question.point.x, canvas);
    let py = mapY(question.point.y, canvas);
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, 2*Math.PI);
    ctx.fill();
  } else if(question.type==='slope' || question.type==='equation'){
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    // Calculate slope and intercept from the two points
    let x1 = question.line.p1.x;
    let y1 = question.line.p1.y;
    let x2 = question.line.p2.x;
    let y2 = question.line.p2.y;
    let m = (y2 - y1) / (x2 - x1);
    let b = y1 - m * x1;
    // Draw line from x = -10 to x = 10
    let gx1 = mapX(-10, canvas);
    let gy1 = mapY(m * (-10) + b, canvas);
    let gx2 = mapX(10, canvas);
    let gy2 = mapY(m * (10) + b, canvas);
    ctx.beginPath();
    ctx.moveTo(gx1, gy1);
    ctx.lineTo(gx2, gy2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }
}
function mapX(x, canvas){
  return ((x+10)/20)*(canvas.width-60)+30;
}
function mapY(y, canvas){
  return ((-y+10)/20)*(canvas.height-60)+30;
}

function renderQuiz(){
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';
  questions.forEach((q, i) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question';
    const prompt = document.createElement('div');
    prompt.textContent = `Q${i+1}: ${q.prompt}`;
    qDiv.appendChild(prompt);
    const canvas = document.createElement('canvas');
    canvas.width = 350;
    canvas.height = 350;
    drawGraph(canvas, q);
    qDiv.appendChild(canvas);
    const choicesDiv = document.createElement('div');
    choicesDiv.className = 'choices';
    q.choices.forEach((choice, j) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${i}`;
      input.value = j;
      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + choice));
      choicesDiv.appendChild(label);
    });
    qDiv.appendChild(choicesDiv);
    quizDiv.appendChild(qDiv);
  });
  document.getElementById('submit').style.display = 'block';
}

function showResult(score){
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = `You scored ${score} out of ${questions.length}!`;
}

document.getElementById('submit').onclick = function(){
  let score = 0;
  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if(selected && parseInt(selected.value) === q.answer){
      score++;
    }
  });
  showResult(score);
  document.getElementById('submit').style.display = 'none';
};

renderQuiz();
