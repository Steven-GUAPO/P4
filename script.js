const testWrapper = document.querySelector('.test-wrapper');
const testArea = document.querySelector('#test-area');
const originTextElement = document.querySelector('#origin-text p');
const resetButton = document.querySelector('#reset');
const theTimer = document.querySelector('.timer');
const wpmDisplay = document.querySelector('#wpm');
const errorCountDisplay = document.querySelector('#error-count');
const scoreList = document.querySelector('#score-list');

const PARAGRAPHS = [
    'Typing is a useful skill, and practice makes the process faster and smoother every day.',
    'A strong keyboard rhythm can help you write more clearly and build confidence in your digital work.',
    'The journey to fast typing begins with accuracy, patience, and frequent revision of mistakes.',
    'Good feedback and persistent practice will improve your typing speed more than rushing through each sentence.',
    'When the words flow with accuracy, your thoughts can be expressed with greater precision and speed.'
];

let timer = [0, 0, 0];
let interval = null;
let timerRunning = false;
let errors = 0;
let currentParagraph = '';
let lastInputWasError = false;

function leadingZero(time) {
    return time <= 9 ? `0${time}` : time;
}

function updateTimerDisplay() {
    const minutes = leadingZero(timer[0]);
    const seconds = leadingZero(timer[1]);
    const hundredths = leadingZero(timer[2]);

    theTimer.textContent = `${minutes}:${seconds}:${hundredths}`;
}

function runTimer() {
    timer[2] += 1;

    if (timer[2] >= 100) {
        timer[1] += 1;
        timer[2] = 0;
    }

    if (timer[1] >= 60) {
        timer[0] += 1;
        timer[1] = 0;
    }

    updateTimerDisplay();
    updateWPM();
}

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
    }
}

function resetTimer() {
    clearInterval(interval);
    interval = null;
    timer = [0, 0, 0];
    timerRunning = false;
    updateTimerDisplay();
}

function getElapsedSeconds() {
    return timer[0] * 60 + timer[1] + timer[2] / 100;
}

function calculateWPM(characters) {
    const elapsedSeconds = getElapsedSeconds();
    if (elapsedSeconds === 0) {
        return 0;
    }

    const words = characters / 5;
    return Math.round((words / elapsedSeconds) * 60);
}

function updateWPM() {
    const typedCharacters = testArea.value.length;
    wpmDisplay.textContent = calculateWPM(typedCharacters);
}

function formatTime(centiseconds) {
    const minutes = Math.floor(centiseconds / 6000);
    const seconds = Math.floor((centiseconds % 6000) / 100);
    const hundredths = centiseconds % 100;
    return `${leadingZero(minutes)}:${leadingZero(seconds)}:${leadingZero(hundredths)}`;
}

function saveTopScore(timeCentiseconds, wpm) {
    const stored = localStorage.getItem('typingTestTopScores');
    const scores = stored ? JSON.parse(stored) : [];

    scores.push({ time: timeCentiseconds, wpm });
    scores.sort((a, b) => a.time - b.time);

    const topScores = scores.slice(0, 3);
    localStorage.setItem('typingTestTopScores', JSON.stringify(topScores));
    displayTopScores();
}

function loadTopScores() {
    const stored = localStorage.getItem('typingTestTopScores');
    return stored ? JSON.parse(stored) : [];
}

function displayTopScores() {
    const topScores = loadTopScores();
    scoreList.innerHTML = '';

    if (topScores.length === 0) {
        scoreList.innerHTML = '<li>--</li><li>--</li><li>--</li>';
        return;
    }

    for (let i = 0; i < 3; i += 1) {
        const li = document.createElement('li');
        if (topScores[i]) {
            li.textContent = `${formatTime(topScores[i].time)} — ${topScores[i].wpm} WPM`;
        } else {
            li.textContent = '--';
        }
        scoreList.appendChild(li);
    }
}

function setOriginText() {
    const randomIndex = Math.floor(Math.random() * PARAGRAPHS.length);
    currentParagraph = PARAGRAPHS[randomIndex];
    originTextElement.textContent = currentParagraph;
}

function setBorderColor(color) {
    testWrapper.style.borderColor = color;
}

function updateErrorCount() {
    errorCountDisplay.textContent = errors;
}

function spellCheck() {
    const enteredText = testArea.value;
    const origin = currentParagraph;

    if (enteredText.length === 0) {
        setBorderColor('grey');
        lastInputWasError = false;
        return;
    }

    if (!timerRunning) {
        startTimer();
    }

    const originSubstring = origin.substring(0, enteredText.length);

    if (enteredText === origin) {
        setBorderColor('#1BAA51');
        clearInterval(interval);
        timerRunning = false;

        const totalCentiseconds = timer[0] * 6000 + timer[1] * 100 + timer[2];
        const finalWPM = calculateWPM(origin.length);
        wpmDisplay.textContent = finalWPM;

        saveTopScore(totalCentiseconds, finalWPM);
        lastInputWasError = false;
        return;
    }

    if (enteredText === originSubstring) {
        setBorderColor('#3B82F6');
        lastInputWasError = false;
    } else {
        setBorderColor('#F97316');
        if (!lastInputWasError) {
            errors += 1;
            updateErrorCount();
            lastInputWasError = true;
        }
    }
}

function resetTest() {
    resetTimer();
    testArea.value = '';
    errors = 0;
    updateErrorCount();
    updateWPM();
    setBorderColor('grey');
    lastInputWasError = false;
    setOriginText();
}

window.addEventListener('load', () => {
    setOriginText();
    displayTopScores();
});

testArea.addEventListener('input', spellCheck);
resetButton.addEventListener('click', resetTest);

