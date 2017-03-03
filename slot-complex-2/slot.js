var REELS_COUNT = 5;
var ROWS_COUNT = 3;
var SYMBOL_WIDTH = 150;
var SYMBOL_HEIGHT = 140;
var SYMBOLS_COUNT = [6, 5, 4, 4,  3, 3, 2, 1];
var PAY_LINES = [
  { line: [1, 1, 1, 1, 1], color: '#f44336' },
  { line: [0, 0, 0, 0, 0], color: '#53f159' },
  { line: [2, 2, 2, 2, 2], color: '#2f5eff' },
  { line: [0, 1, 2, 1, 0], color: '#ffed36' },
  { line: [2, 1, 0, 1, 2], color: '#2cffff' },
  { line: [0, 1, 0, 1, 0], color: '#ff2cde' },
  { line: [2, 1, 2, 1, 2], color: '#e4f351' },
  { line: [0, 1, 1, 1, 0], color: '#ff5722' },
  { line: [2, 1, 1, 1, 2], color: '#a3e1ff' }
];
var WIN_COMB = [
  [ [3, 5], [4, 15], [5, 25]],
  [ [3, 5], [4, 15], [5, 25] ],
  [ [3, 10], [4, 25], [5, 50] ],
  [ [3, 25], [4, 50], [5, 100] ],
  [ [2, 25], [3, 50], [4, 100], [5, 250] ],
  [ [2, 25], [3, 50], [4, 100], [5, 500] ],
  [ [2, 50], [3, 150], [4, 250], [5, 500] ],
  [ [2, 50], [3, 250], [4, 500], [5, 1000] ],
];
var STROKE_WIDTH = 6;
var SYMBOL_MARGIN = 5;
var ROUNDED_RECT_RADIUS = 8;
var BLUR_FPS = 25;
var BLUR_FRAMES_COUNT = SYMBOLS_COUNT.length * 2;
var BETS = [1, 10, 25, 50, 100, 500];

var money = 10000;
var bet_index = 0;
var active_lines_count = 1;

var reelSymbols = [];
var symbolCanvas = document.getElementById("symbolCanvas");
var symbolsContext = symbolCanvas.getContext("2d");
var linesCanvas = document.getElementById("linesCanvas");
var linesContext = linesCanvas.getContext("2d");
var symbolsSprite;
var drawWinLinesTimeoutId;

symbolCanvas.width = SYMBOL_WIDTH * REELS_COUNT;
symbolCanvas.height = SYMBOL_HEIGHT * ROWS_COUNT;
linesCanvas.width = SYMBOL_WIDTH * REELS_COUNT;
linesCanvas.height = SYMBOL_HEIGHT * ROWS_COUNT;

function el(query, context) {
  return [].slice.call((context || document).querySelectorAll(query));
}

function on(eventName, nodeArray, callback) {
  if (isNaN(nodeArray.length)) nodeArray = [nodeArray];
  nodeArray.map(function(node) { node.addEventListener(eventName, callback) })
}

function roundedRect(x, y, width, height) {
  linesContext.beginPath();
  linesContext.moveTo(x, y + ROUNDED_RECT_RADIUS);
  linesContext.lineTo(x, y + height - ROUNDED_RECT_RADIUS);
  linesContext.arcTo(x, y + height, x + ROUNDED_RECT_RADIUS, y + height, ROUNDED_RECT_RADIUS);
  linesContext.lineTo(x + width - ROUNDED_RECT_RADIUS, y + height);
  linesContext.arcTo(x + width, y + height, x + width, y + height-ROUNDED_RECT_RADIUS, ROUNDED_RECT_RADIUS);
  linesContext.lineTo(x + width, y + ROUNDED_RECT_RADIUS);
  linesContext.arcTo(x + width, y, x + width - ROUNDED_RECT_RADIUS, y, ROUNDED_RECT_RADIUS);
  linesContext.lineTo(x + ROUNDED_RECT_RADIUS, y);
  linesContext.arcTo(x, y, x, y + ROUNDED_RECT_RADIUS, ROUNDED_RECT_RADIUS);
  linesContext.stroke();
}

function drawWinLine(line, count, color) {
  linesContext.strokeStyle = color;
  linesContext.beginPath();
  linesContext.moveTo(0, SYMBOL_HEIGHT * line[0] + SYMBOL_HEIGHT / 2);
  for (var x = 0; x < line.length; x++) {
    linesContext.lineTo(
      SYMBOL_WIDTH * x + SYMBOL_WIDTH / 2,
      SYMBOL_HEIGHT * line[x] + SYMBOL_HEIGHT / 2
    );
  }
  linesContext.lineTo(
    SYMBOL_WIDTH * line.length,
    SYMBOL_HEIGHT * line[line.length - 1] + SYMBOL_HEIGHT / 2
  );
  linesContext.stroke();
  for (var i = 0; i < count; i++) {
    linesContext.clearRect(
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
    )
  }
}

function drawWinLines(lines) {
  var i = 0;
  function draw() {
    clearWinLines();
    if (lines.length === 1) {
      if (!(i % 2)) {
        drawWinLine(lines[0].line, lines[0].count, lines[0].color);
      }
    } else {
      drawWinLine(
        lines[i % lines.length].line,
        lines[i % lines.length].count,
        lines[i % lines.length].color
      );
    }
    i++;
    drawWinLinesTimeoutId = setTimeout(draw, 600);
  }
  draw();
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
      }, i * 150);
    })(i)
  }
}

function clearWinLines() {
  linesContext.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffleArray(a) {
  var i = a.length, j, x;
  for (; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}

function getRandomSymbols() {
  var symbols = [];
  var shift;
  var reel;
  for (var i = 0; i < REELS_COUNT; i++) {
    shift = randInt(0, reelSymbols.length - 1);
    reel = reelSymbols.slice(shift, shift + ROWS_COUNT);
    if (reel.length < ROWS_COUNT) {
      reel = reel.concat(reelSymbols.slice(0, ROWS_COUNT - reel.length));
    }
    symbols[i] = reel;
  }
  return symbols;
}

function loadImages(imgSources, callback) {
  var result = [];
  var loadedCount = 0;
  imgSources.forEach(function(path) {
    var image = new Image();
    image.src = path;
    result.push(image);
    if (image.complete || image.readyState == 4) {
      loadedCount++;
      if (loadedCount === imgSources.length) {
        if (callback) {
          callback(result);
        }
      }
    } else {
      image.onload = function() {
        loadedCount++;
        if (loadedCount === imgSources.length) {
          if (callback) {
            callback(result);
          }
        }
      }
    }
  })
}

function drawSymbols(symbols, reel) {
  symbolsContext.clearRect(
    reel * SYMBOL_WIDTH,
    0,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT * ROWS_COUNT
  );
  for (var y = 0; y < ROWS_COUNT; y++) {
    symbolsContext.drawImage(
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
  symbolsContext.drawImage(
    winSymbolsSprite,
    0,
    symbol * SYMBOL_HEIGHT,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT,
    x * SYMBOL_WIDTH,
    y * SYMBOL_HEIGHT,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT
  );
}

function checkWinLines(symbols) {
  var result = [];
  var lines = [];
  var active_lines = PAY_LINES.slice(0, active_lines_count);
  for (var line = 0; line < active_lines.length; line ++) {
    lines[line] = [];
    for (var reel = 0; reel < active_lines[line].line.length; reel++) {
      lines[line].push(symbols[reel][active_lines[line].line[reel]])
    }
  }
  for (line = 0; line < lines.length; line++) {
    var first_symbol = lines[line][0];
    for (var i = 1; i < lines[line].length && lines[line][i] === first_symbol; i++) {}
    for (var comb = 0; comb < WIN_COMB[first_symbol].length; comb++) {
      if (WIN_COMB[first_symbol][comb][0] === i) {
        result.push({
          symbol: first_symbol,
          count: i,
          line: active_lines[line].line,
          color: active_lines[line].color,
          factor: WIN_COMB[first_symbol][comb][1]
        })
      }
    }
  }
  return result;
}

function init(images) {
  symbolsSprite = images[0];
  blurSprite = images[1];
  winSymbolsSprite = images[2];

  linesContext.lineWidth = STROKE_WIDTH;
  linesContext.lineCap = "round";
  linesContext.lineJoin = "round";
  linesContext.shadowOffsetX = 2;
  linesContext.shadowOffsetY = 2;
  linesContext.shadowBlur = 5;
  linesContext.shadowColor = 'rgba(0, 0, 0, 0.25)';

  for (var i = 0; i < SYMBOLS_COUNT.length; i++) {
    for (var n = 0; n < SYMBOLS_COUNT[i]; n++) {
      reelSymbols.push(i)
    }
  }
  shuffleArray(reelSymbols);

  var symbols = getRandomSymbols();
  for (var i = 0; i < REELS_COUNT; i++) {
    drawSymbols(symbols[i], i);
  }

  el('#money')[0].textContent = '$' + (money / 100).toFixed(2);
  el('#lines')[0].textContent = active_lines_count;
  el('#bet')[0].textContent = active_lines_count + ' x $' + (BETS[bet_index] / 100).toFixed(2);
}

function spin() {
  var symbols = getRandomSymbols();
  var winLines = checkWinLines(symbols);

  el('button').map(function(btn) { btn.disabled = true })

  clearInterval(drawWinLinesTimeoutId);
  clearWinLines();
  if (money < BETS[bet_index] * active_lines_count) {
    el('button').map(function(btn) { btn.disabled = false })
    return alert('Не хватает денег на совершение ставки')
  }
  money -= BETS[bet_index] * active_lines_count;
  el('#money')[0].textContent = '$' + (money / 100).toFixed(2)
  el('#win')[0].textContent = '$0.00'

  drawBlur(
    function(i) {
      drawSymbols(symbols[i], i);
    },
    function() {
      var win = 0;
      if (winLines.length) {
        for (var i = 0; i < winLines.length; i++) {
          for (var l = 0; l < winLines[i].count; l++) {
            drawWinSymbol(winLines[i].symbol, l, winLines[i].line[l])
          }
          win += BETS[bet_index] * winLines[i].factor;
        }
        drawWinLines(winLines);
      }
      money += win;
      el('#win')[0].textContent = '$' + (win / 100).toFixed(2)
      el('button').map(function(btn) { btn.disabled = false })
    }
  );
}

loadImages([
  "symbols.jpg",
  "blur.jpg",
  "win-symbols.jpg"
], function(images) {
  init(images);
});

on('click', el('#spin-btn'), spin);

on('click', el('#lines-dec'), function() {
  clearInterval(drawWinLinesTimeoutId);
  clearWinLines();
  active_lines_count = active_lines_count - 1;
  if (active_lines_count === 0) active_lines_count = PAY_LINES.length;
  el('#lines')[0].textContent = active_lines_count;
  el('#bet')[0].textContent = active_lines_count + ' x $' + (BETS[bet_index] / 100).toFixed(2);
  drawWinLine(PAY_LINES[active_lines_count - 1].line, 0, PAY_LINES[active_lines_count - 1].color);
  drawWinLinesTimeoutId = setTimeout(function() { clearWinLines() }, 500)
})

on('click', el('#lines-inc'), function() {
  clearInterval(drawWinLinesTimeoutId);
  clearWinLines();
  active_lines_count = active_lines_count + 1;
  if (active_lines_count > PAY_LINES.length) active_lines_count = 1;
  el('#lines')[0].textContent = active_lines_count;
  el('#bet')[0].textContent = active_lines_count + ' x $' + (BETS[bet_index] / 100).toFixed(2);
  drawWinLine(PAY_LINES[active_lines_count - 1].line, 0, PAY_LINES[active_lines_count - 1].color);
  drawWinLinesTimeoutId = setTimeout(function() { clearWinLines() }, 500)
})

on('click', el('#bet-dec'), function() {
  bet_index = bet_index - 1;
  if (bet_index < 0) bet_index = BETS.length - 1;
  el('#bet')[0].textContent = active_lines_count + ' x $' + (BETS[bet_index] / 100).toFixed(2);
})

on('click', el('#bet-inc'), function() {
  bet_index = bet_index + 1;
  if (bet_index === BETS.length) bet_index = 0;
  el('#bet')[0].textContent = active_lines_count + ' x $' + (BETS[bet_index] / 100).toFixed(2);
})

on('click', el('#max-bet'), function() {
  bet_index = BETS.length - 1;
  active_lines_count = PAY_LINES.length;
  el('#lines')[0].textContent = active_lines_count;
  el('#bet')[0].textContent = active_lines_count + ' x $' + (BETS[bet_index] / 100).toFixed(2);
  spin();
})