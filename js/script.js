var select_lines = document.getElementById('set_lines');
var startButton = document.getElementById('start');
var add_line = document.getElementById('add_line');
var remove_line = document.getElementById('remove_line');
var raise_stakes = document.getElementById('raise_stakes');
var reduce_stakes = document.getElementById('reduce_stakes');
var select_bet = document.getElementById('set_bet');

var player_blance = document.getElementById('player_balance');
var money = 500;
var BET_LIST = [0.20, 0.50, 1.00, 2.50, 5.00];
var currrent_bet = BET_LIST[0];
var counterBetList = 0;
var active_lines_count = 1;

var symbolsSprite;
var blurSprite;
var drawLinesTimeoutId;
var drawWinLinesTimeoutId;

var SYMBOLS_COUNT = [ 7, 6, 5, 4, 4, 3, 3, 2, 1 ];
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
var STROKE_WIDTH = 6;
var SYMBOL_MARGIN = 5;
var ROUNDED_RECT_RADIUS = 8;
var BLUR_FPS = 25;
var BLUR_FRAMES_COUNT = SYMBOLS_COUNT.length * 2;
var SYMBOL_WIDTH = 138;
var SYMBOL_HEIGHT = 138;
var symbolsCanvas = document.getElementById("slot");
    symbolsCanvas.width = SYMBOL_WIDTH * REELS_COUNT;
    symbolsCanvas.height = SYMBOL_HEIGHT * ROWS_COUNT;
var linesCanvas = document.getElementById("lines");
    linesCanvas.width = symbolsCanvas.width;
    linesCanvas.height = symbolsCanvas.height;
var contextSymbols = symbolsCanvas.getContext("2d");
var contextLines = linesCanvas.getContext("2d");
    contextLines.lineWidth = STROKE_WIDTH;
    contextLines.lineCap = "round";
    contextLines.lineJoin = "round";
    contextLines.shadowOffsetX = 2;
    contextLines.shadowOffsetY = 2;
    contextLines.shadowBlur = 5;
    contextLines.shadowColor = 'rgba(0, 0, 0, 0.25)';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function shuffleArray(arr) {
    var i = arr.length, j, x;
    for (; i; i--) {
        j = Math.floor(Math.random() * i);
        x = arr[i - 1];
        arr[i - 1] = arr[j];
        arr[j] = x;
    }
    return arr;
}

function fillReelSymbols(arrReelSymbols, arrSymbolsCount) {
    var arReelSymbols = arrReelSymbols;
    var arSymbolsCount = arrSymbolsCount;
    for (var i = 0; i < arSymbolsCount.length; i++) {
        for (var n = 0; n < arSymbolsCount[i]; n++) {
            arReelSymbols.push(i);
        }
    }
    return shuffleArray(arReelSymbols);
}

function getReelsSymbos(arrSymbolsCout) {
    var arReelSymbols  = [];
    var arSymbolsCount = arrSymbolsCout;
    for (var i = 0; i < arSymbolsCount.length; i++) {
        for (var n = 0; n < arSymbolsCount[i]; n++) {
            arReelSymbols.push(i);
        }
    }
    return fillReelSymbols(arReelSymbols, arSymbolsCount);
}

function getRandomSymbols(arrReelSymbols, reelsCount, rowsCount) {
    var symbols = [];
    var shift;
    var reel;
    for (var i = 0; i < reelsCount; i++) {
        shift = getRandomInt(0, arrReelSymbols.length - 1);
        reel = arrReelSymbols.slice(shift, shift + rowsCount);
        if (reel.length < rowsCount) {
            reel = reel.concat(arrReelSymbols.slice(0, rowsCount - reel.length));
        }
        symbols[i] = reel;
    }
    return symbols;
}

function checkWinLines(symbols) {
    var result = [];
    var lines = [];
    var smbls = symbols;
    var active_lines = PAY_LINES.slice(0, active_lines_count);
    for (var line = 0; line < active_lines.length; line++) {
        lines[line] = [];
        for (var reel = 0; reel < active_lines[line].line.length; reel++) {
            lines[line].push(smbls[reel][active_lines[line].line[reel]]);
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
                    multiplier: WIN_COMB[first_symbol][comb][1], // коэфициент
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
            if (loaded_count === imgSources.length) {
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

function clearLines() {
    clearTimeout(drawLinesTimeoutId);
    clearTimeout(drawWinLinesTimeoutId);
    contextLines.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
}

function clearSymbols() {
    contextSymbols.clearRect(0, 0, symbolsCanvas.width, symbolsCanvas.height);
}

function clearCanvas() {
    clearLines();
    clearSymbols();
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

function drawLines(index) {
    for (var i = 0; i < index; i++) {
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
    drawLinesTimeoutId = setTimeout("clearLines()", 1000);
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

function drawSymbols(symbols, reel) {
    contextSymbols.clearRect(
      reel * SYMBOL_WIDTH,
      0,
      SYMBOL_WIDTH,
      SYMBOL_HEIGHT * ROWS_COUNT
    );
    for (var y = 0; y < ROWS_COUNT; y++) {
        contextSymbols.drawImage(
          symbolsSprite,
          0,
          symbols[y] * SYMBOL_HEIGHT,
          SYMBOL_WIDTH,
          SYMBOL_HEIGHT,
          reel * SYMBOL_WIDTH,
          y * SYMBOL_HEIGHT,
          SYMBOL_WIDTH,
          SYMBOL_HEIGHT
        );
    }
}

function drawWinSymbol(symbol, x, y) {
    contextSymbols.drawImage(
      symbolsSprite, // картинка с символами
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

function drawBlur(progressCallback, totalCallback) {
    for (var i = 0; i < REELS_COUNT; i++) {
        ;(function(i) {
            setTimeout(function() {
                var l = 0;
                var intervalId = setInterval(function() {
                    contextSymbols.drawImage(
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

function spin(element, arrReelsSymbols, reelsCount, rowsCount) {
    var el = element;
    var arSymbols = arrReelsSymbols;
    var numReels = reelsCount;
    var numRows = rowsCount;
    if (typeof element !== "undefined") {
        var randomSymbols = getRandomSymbols(arSymbols, numReels, numRows);
        var winLines = checkWinLines(randomSymbols);
        var current_win = document.getElementById('current_win');
        var win = 0;
        money -= currrent_bet * active_lines_count;
        player_blance.innerHTML = money.toFixed(2);
        current_win.innerHTML = win.toFixed(2);
        drawBlur(
          function(i) {
              drawSymbols(randomSymbols[i], i);
          },
          function() {
              if (winLines.length > 0) {
                  for (var i = 0; i < winLines.length; i++) {
                      for (var l = 0; l < winLines[i].count; l++) {
                          drawWinSymbol(winLines[i].symbol, l, winLines[i].line[l]);
                      }
                      drawWinLines(winLines);
                      win += currrent_bet * winLines[i].multiplier;
                  }
                  money += win;
                  player_blance.innerHTML = money.toFixed(2);
                  current_win.innerHTML = win.toFixed(2);
              }
          }
        );
        el.disabled = true;
    }
}

function init(images) {
    player_blance.innerHTML = money.toFixed(2);
    clearCanvas();
    symbolsSprite = images[0];
    blurSprite = images[1];

    REEL_SYMBOLS = getReelsSymbos(SYMBOLS_COUNT);

    var randomSymbols = getRandomSymbols(REEL_SYMBOLS, REELS_COUNT, ROWS_COUNT);
    for (var x = 0; x < REELS_COUNT; x++) {
        drawSymbols(randomSymbols[x], x);
    }

    startButton.addEventListener("click", function (e) {
        e.disabled = false;
        clearLines();
        if(money < currrent_bet * active_lines_count) {
            alert("Не хватает денег на совершение ставки");
            return false;
        }
        spin(e, REEL_SYMBOLS,  REELS_COUNT, ROWS_COUNT);
    });
}

loadImages([
    "./images/sprites.jpg",
    "./images/blur.jpg"
], function(images) {
    init(images);
});

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
        if (counterBetList <= 0) {
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
        if (counter >= PAY_LINES.length) {
            counter = 1;
        }
        else {
            counter++;
        }
    }
    if (val === "remove_line") {
        if (counter <= 1) {
            counter = PAY_LINES.length;
        } else {
            counter--;
        }
    }
    drawLines(counter);

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