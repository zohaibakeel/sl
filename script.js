// DOM elements
const balanceAmount = document.getElementById('balanceAmount');
const resultDisplay = document.querySelector('.result');
const lights = [
    document.getElementById('light1'),
    document.getElementById('light2'),
    document.getElementById('light3')
];
const headerLight = document.getElementById('headerLight');
const outputPaper = document.querySelector('.output-paper');

// Canvas setup
const canvas = document.getElementById('slotMachineCanvas');
const ctx = canvas.getContext('2d');
const reelWidth = 90;
const reelHeight = 95;
const symbols = ['🍒', '🍋', '🍉', '⭐', '🔔'];
const reels = [
    { y: 0, speed: 0, stopTime: 0, symbolIndex: 0 },
    { y: 0, speed: 0, stopTime: 0, symbolIndex: 0 },
    { y: 0, speed: 0, stopTime: 0, symbolIndex: 0 }
];

// Balance initialization
let balance = 100; // Starting balance, adjust as needed

// Update balance display
function updateBalanceDisplay() {
    balanceAmount.innerHTML = `$${balance.toFixed(2)}`;
}

// Drawing functions
function drawReel(reel, x) {
    const y = reel.y % reelHeight;
    const symbolIndex = reel.symbolIndex;

    // Blink effect for the reel
    const blinkColor = (Math.floor(Date.now() / 500) % 2 === 0) ? 'rgba(155, 155, 155, 0.1)' : 'rgba(100, 100, 100, 0.1)';
    ctx.fillStyle = blinkColor;
    ctx.fillRect(x, 100, reelWidth, reelHeight);

    // Draw symbols
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const positions = [-reelHeight, 0, reelHeight];
    positions.forEach(offset => {
        const posY = y + offset;
        const symbol = symbols[(symbolIndex + 1) % symbols.length];
        ctx.fillText(symbol, x + reelWidth / 2, posY + reelHeight / 2);
    });
}

function drawSlotMachine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    reels.forEach((reel, index) => drawReel(reel, index * reelWidth));
}

// Update reels
function updateReels() {
    const currentTime = Date.now();
    reels.forEach(reel => {
        if (reel.speed > 0) {
            reel.y += reel.speed;
            if (reel.y > reelHeight) {
                reel.y = 0;
                reel.symbolIndex = Math.floor(Math.random() * symbols.length);
            }
            if (currentTime >= reel.stopTime) {
                reel.speed *= 0.95;
                if (reel.speed < 0.1) {
                    reel.speed = 0;
                    reel.y = 0;
                }
            }
        }
    });
    drawSlotMachine();
}

// Spin the reels
function spinReels() {
    lights.forEach(light => light.classList.add('on'));
    const currentTime = Date.now();
    const speed = Math.random() * 20 + 10;
    reels.forEach(reel => {
        reel.speed = speed;
        reel.stopTime = currentTime + 5000;
        reel.symbolIndex = Math.floor(Math.random() * symbols.length);
    });
    document.getElementById('spinSound').play();
}

// Check win/loss
function checkWin(betAmount) {
    const win = Math.random() < 0.60;
    let multiplier = 0.0;
    let winnings = 0;

    if (win) {
        const winMultipliers = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 2.0];
        multiplier = winMultipliers[Math.floor(Math.random() * winMultipliers.length)];
        winnings = betAmount * multiplier;
        balance += winnings; // Add winnings to the balance
        resultDisplay.innerHTML = `🎉 You win!<br><br>Multiplier: x<span class="multiplier">${multiplier.toFixed(1)}</span>.<br>Balance: $${balance.toFixed(2)}`;
        outputPaper.classList.remove('lose');
        outputPaper.classList.add('win');
    } else {
        balance -= betAmount; // Deduct bet amount if player loses
        resultDisplay.innerHTML = `😢 You lose!<br><br>Multiplier: x<span class="multiplier">0.0</span>.<br>Balance: $${balance.toFixed(2)}`;
        outputPaper.classList.remove('win');
        outputPaper.classList.add('lose');
    }

    updateBalanceDisplay();
    outputPaper.classList.add('show');
    headerLight.classList.add('blinking');
}

// Event listeners
document.getElementById('spinButton').addEventListener('click', () => {
    const betInput = document.getElementById('betAmount');
    const betAmount = parseInt(betInput.value, 10);

    // Check for valid bet amount
    if (isNaN(betAmount) || betAmount < 1) {
        resultDisplay.innerHTML = "Invalid Bet Amount!";
        return;
    }

    // Check if balance is sufficient
    if (balance < betAmount) {
        resultDisplay.innerHTML = "Insufficient Balance!";
        return;
    }

    // Spin the reels
    spinReels();

    // Update reels and check result after the spin
    setTimeout(() => {
        updateReels();
        checkWin(betAmount);
        lights.forEach(light => light.classList.remove('on'));
    }, 5100);
});

// Close result output
function closeOutputPaper() {
    outputPaper.classList.remove('show');
    headerLight.classList.remove('blinking');
}

// Animation loop
function animate() {
    updateReels();
    requestAnimationFrame(animate);
}

animate();
