var select_lines = document.getElementById('set_lines');
var startButton = document.getElementById('start');
var add_line = document.getElementById('add_line');
var remove_line = document.getElementById('remove_line');
var raise_stakes = document.getElementById('raise_stakes');
var reduce_stakes = document.getElementById('reduce_stakes');
var select_bet = document.getElementById('set_bet');

var money = 500;
var BET_LIST = [0.20, 0.50, 1.00, 2.50, 5.00];
var currrent_bet = BET_LIST[0];
var counterBetList = 0;
var active_lines_count = 1;
var symbolsSprite = [ "./images/sprites.jpg"];
var drawLinesTimeoutId;
var drawWinLinesTimeoutId;

var SYMBOLS_COUNT = [
    7, // 6 - Gold
    6, // 7 - Princess
    5, // 8 - Prince
    4, // 9 - Castle
    4, // 10
    3, // J
    3, // Q
    2, // K
    1 // A
];

var PAY_LINES = [
    { line: [0, 0, 0, 0, 0], color: "#f00" },
    { line: [1, 1, 1, 1, 1], color: "#0f0" },
    { line: [2, 2, 2, 2, 2], color: "#00f" },
    { line: [0, 1, 2, 1, 0], color: "#ff0" },
    { line: [2, 1, 0, 1, 2], color: "#0ff" }
];

var WIN_COMB = [
    [ [2, 4], [3, 8], [4, 16], [5, 32] ],
    [ [2, 12],[3, 24], [4, 48], [5, 96] ],
    [ [2, 14], [3, 28], [4, 56], [5, 112] ],
    [ [2, 16], [3, 32], [4, 64], [5, 128] ],
    [ [2, 18], [3, 36], [4, 72], [5, 144] ],
    [ [2, 20], [3, 40], [4, 80], [5, 160] ],
    [ [2, 6], [3, 12], [4, 24], [5, 48] ],
    [ [2, 8], [3, 16], [4, 32], [5, 64] ],
    [ [2, 10], [3, 20], [4, 40], [5, 80] ]
];
var REEL_SYMBOLS = [];
var REELS_COUNT = 5;
var ROWS_COUNT = 3;

var symbolsCanvas = document.getElementById("slot");
var linesCanvas = document.getElementById("lines");
var contextSymbols = symbolsCanvas.getContext("2d");
var contextLines = linesCanvas.getContext("2d");
var SYMBOL_WIDTH = 138;
var SYMBOL_HEIGHT = 138;

symbolsCanvas.width = SYMBOL_WIDTH * REELS_COUNT;
symbolsCanvas.height = SYMBOL_HEIGHT * ROWS_COUNT;
linesCanvas.width = symbolsCanvas.width;
linesCanvas.height = symbolsCanvas.height;

var STROKE_WIDTH = 6;
var SYMBOL_MARGIN = 5;
var ROUNDED_RECT_RADIUS = 8;
var BLUR_FPS = 25;
var BLUR_FRAMES_COUNT = SYMBOLS_COUNT.length * 2;

contextLines.lineWidth = STROKE_WIDTH;
contextLines.lineCap = "round";
contextLines.lineJoin = "round";
contextLines.shadowOffsetX = 2;
contextLines.shadowOffsetY = 2;
contextLines.shadowBlur = 5;
contextLines.shadowColor = 'rgba(0, 0, 0, 0.25)';

function clearLines() {
    // clearTimeout(drawLinesTimeoutId);
    // clearTimeout(drawWinLinesTimeoutId);
    contextLines.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
}

function clearSymbols() {
    contextSymbols.clearRect(0, 0, symbolsCanvas.width, symbolsCanvas.height);
}

function clearCanvas() {
    clearLines();
    clearSymbols();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function printText(text) {
  document.querySelector('#output').textContent += text + "\n\n";
}

function shuffleArray(arr) {
    var i = arr.length, j, x;
    for (; i; i--) {
        j = Math.floor(Math.random() * i);
        x = arr[i - 1];
        arr[i - 1] = arr[j];
        arr[j] = x;
    }
}

function roundedRect(x, y, width, height) {
    contextLines.beginPath();
    contextLines.moveTo(x, y + ROUNDED_RECT_RADIUS);
    contextLines.lineTo(x, y + height - ROUNDED_RECT_RADIUS);
    contextLines.arcTo(x, y + height, x + ROUNDED_RECT_RADIUS, y + height, ROUNDED_RECT_RADIUS);
    contextLines.lineTo(x + width - ROUNDED_RECT_RADIUS, y + height);
    contextLines.arcTo(x + width, y + height, x + width, y + height-ROUNDED_RECT_RADIUS, ROUNDED_RECT_RADIUS);
    contextLines.lineTo(x + width, y + ROUNDED_RECT_RADIUS);
    contextLines.arcTo(x + width, y, x + width - ROUNDED_RECT_RADIUS, y, ROUNDED_RECT_RADIUS);
    contextLines.lineTo(x + ROUNDED_RECT_RADIUS, y);
    contextLines.arcTo(x, y, x, y + ROUNDED_RECT_RADIUS, ROUNDED_RECT_RADIUS);
    contextLines.stroke();
}

function fillReelSymbols() {
    for (var i = 0; i < SYMBOLS_COUNT.length; i++) {
        for (var n = 0; n < SYMBOLS_COUNT[i]; n++) {
            REEL_SYMBOLS.push(i);
        }
    }
    shuffleArray(REEL_SYMBOLS);
}

function drawLines(index) {
    for (var i = 0; i <= index; i++) {
        contextLines.strokeStyle = PAY_LINES[i].color;
        contextLines.beginPath();
        contextLines.moveTo(0, SYMBOL_HEIGHT * PAY_LINES[i].line[0] + SYMBOL_HEIGHT / 2);
        for (var x = 0; x < PAY_LINES[i].line.length; x++) {
            contextLines.lineTo(
                SYMBOL_WIDTH * x + SYMBOL_WIDTH / 2,
                SYMBOL_HEIGHT * PAY_LINES[i].line[x] + SYMBOL_HEIGHT / 2
            );
        }
        contextLines.lineTo(
            SYMBOL_WIDTH * PAY_LINES[i].line.length,
            SYMBOL_HEIGHT * PAY_LINES[i].line[PAY_LINES[i].line.length - 1] + SYMBOL_HEIGHT / 2
        );
        contextLines.stroke();
    }
    drawLinesTimeoutId = setTimeout(clearLines(), 1000);
}

function setBet(val) {
    if (typeof val === "undefined") {
        return false;
    }
    if (val === "raise_stakes") {
        if (counterBetList >= BET_LIST.length -1) {
            counterBetList = 0;
        }
        else {
            counterBetList++;
        }
    }
    if (val === "reduce_stakes") {
        if (counterBetList <= BET_LIST[0]) {
            counterBetList = BET_LIST.length -1;
        } else {
            counterBetList--;
        }
    }

    select_bet.innerHTML = BET_LIST[counterBetList];
    currrent_bet = BET_LIST[counterBetList];
}

function setLines(val) {
    if (typeof val === "undefined") {
        return false;
    }
    clearLines();
    var counter = parseInt(select_lines.innerHTML);// читаем текущее содержимое
    if (val === "add_line") {
        if (counter === REELS_COUNT) {
            counter = 1;
        }
        else {
            counter++;
        }
    }
    if (val === "remove_line") {
        if (counter === 1) {
            counter = REELS_COUNT;
        } else {
            counter--;
        }
    }
    clearLines();
    drawLines(counter -1);

    active_lines_count = counter;
    select_lines.innerHTML = active_lines_count;
}

raise_stakes.addEventListener("click", function () {
    setBet(this.id);
});
reduce_stakes.addEventListener("click", function () {
    setBet(this.id);
});

add_line.addEventListener("click", function () {
    setLines(this.id);
});
remove_line.addEventListener("click", function () {
    setLines(this.id);
});

function getRandomSymbols() {
    var symbols = [];
    var shift;
    var reel;
    for (var i = 0; i < REELS_COUNT; i++) {
        shift = getRandomInt(0, REEL_SYMBOLS.length - 1);
        reel = REEL_SYMBOLS.slice(shift, shift + ROWS_COUNT);
        if (reel.length < ROWS_COUNT) {
            reel = reel.concat(REEL_SYMBOLS.slice(0, ROWS_COUNT - reel.length));
        }
        symbols[i] = reel;
    }
    return symbols;
}

function checkWinLines(symbols) {
    var result = [];
    var lines = [];
    var active_lines = PAY_LINES.slice(0, active_lines_count);
    for (var line = 0; line < active_lines.length; line++) {
        lines[line] = [];
        for (var reel = 0; reel < active_lines[line].line.length; reel++) {
            lines[line].push(symbols[reel][active_lines[line].line[reel]]);
        }
    }
    for (line = 0; line < lines.length; line++) {
        var first_symbol = lines[line][0];
        var counter = 1;
        while (counter < lines[line].length && lines[line][counter] === first_symbol) {
            counter++;
        }
        for (var comb = 0; comb < WIN_COMB[first_symbol].length; comb++) {
            if (WIN_COMB[first_symbol][comb][0] === counter) {
                result.push({
                    symbol: first_symbol,
                    count: counter,
                    line: active_lines[line].line,
                    color: active_lines[line].color,
                    multiplier: WIN_COMB[first_symbol][comb][1]
                })
            }
        }
    }

    return result;
}
function loadImages(imgSources, callback) {
    var result = [];
    var loaded_count = 0;
    imgSources.forEach(function(path) {
        var image = new Image();
        image.src = path;
        result.push(image);
        if (image.complete || image.readyState == 4) {
            loaded_count++;
            // входного массива с ссылками
            if (loaded_count === imgSources.length) {
                // можем вызывать callback, если он есть
                if (callback) {
                    callback(result)
                }
            }
        } else {
            image.onload = function() {
                loaded_count++;
                if (loaded_count === imgSources.length) {
                    if (callback) {
                        callback(result)
                    }
                }
            }
        }
    })
}
function drawWinLines(winlines) {
    var i = 0;
    function draw() {
        clearLines();
        if (winlines.length === 1) {
            if (!(i % 2)) {
                drawWinLine(
                    winlines[0].line,
                    winlines[0].count,
                    winlines[0].color
                );
            }
        } else {
            drawWinLine(
                winlines[i % winlines.length].line,
                winlines[i % winlines.length].count,
                winlines[i % winlines.length].color
            );
        }
        i++;
        drawWinLinesTimeoutId = setTimeout(draw, 600);
    }
    draw();
}

function drawWinLine(line, count, color) {
    contextLines.strokeStyle = color;
    contextLines.beginPath();
    contextLines.moveTo(0, SYMBOL_HEIGHT * line[0] + SYMBOL_HEIGHT / 2);
    for (var x = 0; x < line.length; x++) {
        contextLines.lineTo(
            SYMBOL_WIDTH * x + SYMBOL_WIDTH / 2,
            SYMBOL_HEIGHT * line[x] + SYMBOL_HEIGHT / 2
        );
    }

    contextLines.lineTo(
        SYMBOL_WIDTH * line.length,
        SYMBOL_HEIGHT * line[line.length - 1] + SYMBOL_HEIGHT / 2
    );

    contextLines.stroke();
    for (var i = 0; i < count; i++) {
        contextLines.clearRect(
            SYMBOL_WIDTH * i + SYMBOL_MARGIN + STROKE_WIDTH,
            line[i] * SYMBOL_HEIGHT + SYMBOL_MARGIN + STROKE_WIDTH,
            SYMBOL_WIDTH - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2,
            SYMBOL_HEIGHT - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2
        );
        roundedRect(
            SYMBOL_WIDTH * i + SYMBOL_MARGIN + STROKE_WIDTH,
            line[i] * SYMBOL_HEIGHT + SYMBOL_MARGIN + STROKE_WIDTH,
            SYMBOL_WIDTH - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2,
            SYMBOL_HEIGHT - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2
        );
    }
}

function drawBlur(progressCallback, totalCallback) {
    for (var i = 0; i < REELS_COUNT; i++) {
        ;(function(i) {
            setTimeout(function() {
                var l = 0;
                var intervalId = setInterval(function() {
                    symbolsContext.drawImage(
                        blurSprite,
                        l % BLUR_FRAMES_COUNT * SYMBOL_WIDTH,
                        0,
                        SYMBOL_WIDTH,
                        SYMBOL_HEIGHT * ROWS_COUNT,
                        i * SYMBOL_WIDTH,
                        0,
                        SYMBOL_WIDTH,
                        SYMBOL_HEIGHT * ROWS_COUNT
                    );
                    l++;
                    if (l === BLUR_FRAMES_COUNT * 2) {
                        clearInterval(intervalId);
                        if (progressCallback) progressCallback(i);
                        if (i === REELS_COUNT - 1) totalCallback();
                    }
                }, 1000 / BLUR_FPS);
            }, i * 100);
        })(i)
    }
}

function drawReelsSymbols(randomSymbols) {
    for (var x = 0; x < REELS_COUNT; x++) {
        for (var y = 0; y < ROWS_COUNT; y++) {
            contextSymbols.drawImage(
                symbolsSprite,
                0,
                randomSymbols[x][y] * (SYMBOL_HEIGHT),
                SYMBOL_WIDTH,
                SYMBOL_HEIGHT,
                x * SYMBOL_WIDTH,
                y * SYMBOL_HEIGHT,
                SYMBOL_WIDTH,
                SYMBOL_HEIGHT
            );
        }
    }
}

function drawWinSymbol(symbol, x, y) {
    contextSymbols.drawImage(
        symbolsSprite,
        SYMBOL_WIDTH,
        symbol * SYMBOL_HEIGHT,
        SYMBOL_WIDTH,
        SYMBOL_HEIGHT,
        x * SYMBOL_WIDTH,
        y * SYMBOL_HEIGHT,
        SYMBOL_WIDTH,
        SYMBOL_HEIGHT
    );
}

function getWon(winLines, win) {
    for (var i = 0; i < winLines.length; i++) {
        printText('  ' + winLines[i].line + '; символ: ' + winLines[i].symbol +
            '; кол-во символов: ' + winLines[i].count + '; коэфициент: ' + winLines[i].multiplier);
        win += currrent_bet * winLines[i].multiplier;
    }

    return win
}

function spin(clicked) {
    if(typeof clicked === "boolean") {
        var init_from_user = true;
    }
    clearLines();
    // получаем набор символов для спина
    var randomSymbols = getRandomSymbols();
    var winLines = checkWinLines(randomSymbols);
    var player_blance = document.getElementById('player_balance');
    var current_win = document.getElementById('current_win');
    var win = 0;//default
    // рисуем все символы из массива
    drawReelsSymbols(randomSymbols);

    if (init_from_user) {
        // проверяем, есть ли деньги совершить ставку
        if (money < currrent_bet * active_lines_count) {
            return printText('Не хватает денег на совершение ставки');
        }
        // делаем ставку, отнимает ставку от баланса
        money -= currrent_bet * active_lines_count;
        printText('---');
        // проверяем, есть ли выигрышные линии
        if (winLines.length) {
            for (var i = 0; i < winLines.length; i++) {
                for (var l = 0; l < winLines[i].count; l++) {
                    drawWinLines(winLines);
                    drawWinSymbol(winLines[i].symbol, l, winLines[i].line[l])
                }
                win += currrent_bet * winLines[i].multiplier;
            }
        }

        current_win.innerHTML = win.toFixed(2);
        // printText('Ставка: ' + currrent_bet + ' x ' + active_lines_count + ';\t Выигрыш: ' + win.toFixed(2) + ';\t' + 'Баланс: ' + money);
        //autogame init example
        // setTimeout(spin(true), 1000);
    }

    player_blance.innerHTML = money.toFixed(2);
}

function init(images) {
    clearCanvas();
    symbolsSprite = images[0];
    for (var i = 0; i < SYMBOLS_COUNT.length; i++) {
        for (var n = 0; n < SYMBOLS_COUNT[i]; n++) {
            REEL_SYMBOLS.push(i);
        }
    }
    fillReelSymbols();
    spin();

    startButton.addEventListener("click", function () {
        fillReelSymbols();
        spin(true);
    });
    // и потом каждую секунду
    // setInterval(spin, 1000);
}

loadImages([
    symbolsSprite
], function(images) {
    // и лишь потом запускаем скрипт
    init(images);
});