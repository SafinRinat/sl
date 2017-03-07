// get controls
var select_lines = document.getElementById('set_lines');
var startButton = document.getElementById('start');
var add_line = document.getElementById('add_line');
var remove_line = document.getElementById('remove_line');
var raise_stakes = document.getElementById('raise_stakes');
var reduce_stakes = document.getElementById('reduce_stakes');
var select_bet = document.getElementById('set_bet');

// init config
var money = 500; // деньги игрока
var BET_LIST = [0.20, 0.50, 1.00, 2.50, 5.00];// ставка
var currrent_bet = BET_LIST[0];//default 0.20
// индекс дефолтной ставки
var counterBetList = 0;
var active_lines_count = 1; // кол-во активных линий, т.е. по которым играет игрок

//canvas
var symbolsSprite = [
  "./images/sprites.jpg",
  "./images/blur.jpg"
];//спрайт или путь к спрайту с картинами канваса
var drawLinesTimeoutId;
var drawWinLinesTimeoutId;

// кол-во символов в ленте
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

// линии, по которым проверять выигрыш
var PAY_LINES = [
    { line: [0, 0, 0, 0, 0], color: "#f00" },
    { line: [1, 1, 1, 1, 1], color: "#0f0" },
    { line: [2, 2, 2, 2, 2], color: "#00f" },
    { line: [0, 1, 2, 1, 0], color: "#ff0" },
    { line: [2, 1, 0, 1, 2], color: "#0ff" }
];

// выигрышные комбинации
var WIN_COMB = [
    // для первого символа, то есть 6 (gold)
    [
        // первое число - колличество одинаковых символов подряд
        // второе - коэфициент выплат
        [2, 4],// если две подрят - ставка х 4
        [3, 8],// если три шестерки подряд - ставка x 8
        [4, 16],// если четыре шестерки подряд - ставка x 16
        [5, 32] // и т. д.
    ],
    // для символа 10
    [
        [2, 12],[3, 24], [4, 48], [5, 96]
    ],
    // для символа J
    [
        [2, 14], [3, 28], [4, 56], [5, 112]
    ],
    // для символа Q
    [
        [2, 16], [3, 32], [4, 64], [5, 128]
    ],
    // для второго символа K
    [
        [2, 18], [3, 36], [4, 72], [5, 144]
    ],
    // для символа A
    [
        [2, 20], [3, 40], [4, 80], [5, 160]
    ],
    // для символа 7 - Prince
    [
        [2, 6], [3, 12], [4, 24], [5, 48]
    ],
    // для символа 8 - Princess
    [
        [2, 8], [3, 16], [4, 32], [5, 64]
    ],
    // для символа 9 - Castle
    [
        [2, 10], [3, 20], [4, 40], [5, 80]
    ]
];
var REEL_SYMBOLS = [];// лента слота, из которой будут браться случайные символы
var REELS_COUNT = 5;// кол-во барабанов
var ROWS_COUNT = 3;// кол-во линий

// get canvas from draw
// получаем его контекст для рисования
var symbolsCanvas = document.getElementById("slot");
var linesCanvas = document.getElementById("lines");
var contextSymbols = symbolsCanvas.getContext("2d");
var contextLines = linesCanvas.getContext("2d");
var SYMBOL_WIDTH = 138;// ширина символа
var SYMBOL_HEIGHT = 138;// высота символа

symbolsCanvas.width = SYMBOL_WIDTH * REELS_COUNT;// выставляем ширину
symbolsCanvas.height = SYMBOL_HEIGHT * ROWS_COUNT;// и высоту канваса
linesCanvas.width = symbolsCanvas.width;
linesCanvas.height = symbolsCanvas.height;

var STROKE_WIDTH = 6;// ширина линии px
var SYMBOL_MARGIN = 5;//отступ с каждой стороны при обведение линией символа
var ROUNDED_RECT_RADIUS = 8;// border-radius stroke
var BLUR_FPS = 25;
var BLUR_FRAMES_COUNT = SYMBOLS_COUNT.length * 2;

contextLines.lineWidth = STROKE_WIDTH;
contextLines.lineCap = "round";//Определяет оформление концов линий. butt(используется по умолчанию), round, square отрисвоки концов линии
contextLines.lineJoin = "round";//Определяет оформление соединений линий. miter (используется по умолчанию), round, bevel. http://xiper.net/manuals/canvas/2D-api/lineJoin
contextLines.shadowOffsetX = 2;
contextLines.shadowOffsetY = 2;
contextLines.shadowBlur = 5;
contextLines.shadowColor = 'rgba(0, 0, 0, 0.25)';

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

// получаем набор символов для спина
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// перемешивает массив
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
  // заполняем нашу виртуальную ленту символами
  // согласно их колличеству
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
  drawLinesTimeoutId = setTimeout("clearLines()", 1000);
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
        if (counter === PAY_LINES.length) {
            counter = 1;
        }
        else {
            counter++;
        }
    }
    if (val === "remove_line") {
        if (counter === 1) {
            counter = PAY_LINES.length;
        } else {
            counter--;
        }
    }
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

// получаем набор символов для спина
function getRandomSymbols() {
  var symbols = []; // массив с барабанами
  var shift;// сдвиг на ленте символов
  var reel;// барабан
  // для каждого барабана
  for (var i = 0; i < REELS_COUNT; i++) {
      shift = getRandomInt(0, REEL_SYMBOLS.length - 1); // получаем случайный сдвиг

      reel = REEL_SYMBOLS.slice(shift, shift + ROWS_COUNT);// из всей ленты берем срез, начиная со сдвига shift + 2 символа
      // то есть получаем срез из трех подряд символов с ленты
      // на случай, если сдвиг был слишком велик,
      // на 1 или 2 символа меньше чем длина всей ленты, то тогда
      // результат среза вернет нам меньше символов, чем 3
      // то есть, допустим длина всей ленты 10 символов,
      // а сдвиг у нас, допустим, 9, тогда срез будет из одного последнего
      // символа ленты
      // поэтому проверяем длину получившегося среза
      if (reel.length < ROWS_COUNT) {
          // и если он, в нашем случае, меньше 3 (ROWS_COUNT = 3)
          // о дополняем его из начала ленты недостающими символами
          reel = reel.concat(REEL_SYMBOLS.slice(0, ROWS_COUNT - reel.length));
      }
      // 0 => Gold(6) // 1 => 10 // 2 => J // 3 => Q // 4 => K // 5 => A // 6 => Prince // 7 => Princess // 8 => Castle
      symbols[i] = reel;
  }
  return symbols;
}

function checkWinLines(symbols) {
  var result = [];// результат
  var lines = [];// промежуьочный массив, соберем туда символы по играющим линиям
  var active_lines = PAY_LINES.slice(0, active_lines_count);// выберем линии, которые сейчас играют, по которым, соответственно, будем искать выигрышь

  // для всех активных линий выбираем символы из барабанов
  for (var line = 0; line < active_lines.length; line++) {
    lines[line] = [];// линия для проверки
    // для всех позиций проверяемой линии выбираем символы из выпавших символов на барабанах
    for (var reel = 0; reel < active_lines[line].line.length; reel++) {
      lines[line].push(symbols[reel][active_lines[line].line[reel]]);
    }
  }
    // для всех активных (проверяемых) линий
  for (line = 0; line < lines.length; line++) {
    // берем первый символ проверяемой линии
    var first_symbol = lines[line][0];
    // дальше проверяем, сколько раз он встречается подряд (lines[line][i] === first_symbol)
    // то есть мы начинаем проверять со второго символа в линии, равняется ли он первому
    // если да, идем дальше и увеличиваем число i на 1
    // если нет, условие lines[line][i] === first_symbol не выполняется и
    // соответственно цикл прерывается
    // for (var i = 1; i < lines[line].length && lines[line][i] === first_symbol; i++) {}

    var counter = 1;
    while (counter < lines[line].length && lines[line][counter] === first_symbol) {
      counter++;
    }
      // дальше, берем коэфициенты символа (first_symbol),
      // проходимся по ним в цикле
      //WIN_COMB[first_symbol].length - количество первых символов с каждой линии по 1, то есть 5 линий 5 первых символов
    for (var comb = 0; comb < WIN_COMB[first_symbol].length; comb++) {
      // и прверяем, есть ли выигрышная комбинация для полученого кол-ва (counter)
      if (WIN_COMB[first_symbol][comb][0] === counter) {
        // если есть, записываем все нужные данные в объект
        //  и добавляем его к результату
        result.push({
          symbol: first_symbol, // номер символа
          count: counter, // сколько раз повторился
          line: active_lines[line].line,// расположение линии
          color: active_lines[line].color,
          multiplier: WIN_COMB[first_symbol][comb][1], // коэфициент
        })
      }
    }
  }

  return result;
}

function printText(text) {
    document.querySelector('#output').textContent += text + "\n\n";
}

function loadImages(imgSources, callback) {
    // итоговый массив загруженых картинок
  var result = [];
  // кол-во уже загруженых картинок
  var loaded_count = 0;
  // для каждого элемента из массива ссылок на картинки
  imgSources.forEach(function(path) {
      // создаем картинку в js
    var image = new Image();
    // задаем еть src
    image.src = path;
    // добавляем ее в итоговый массив
    result.push(image);
    // проверяем, может картинка уже загружена
    // то есть, браузер ее взял из кеша
    if (image.complete || image.readyState == 4) {
        // если так, то увеличиваем счетчик на 1
      loaded_count++;
      // если кол-во загруженых картинок равно длине
      // входного массива с ссылками
      if (loaded_count === imgSources.length) {
          // можем вызывать callback, если он есть
          if (callback) {
              // а в него передаем массив с картинками
              callback(result)
          }
      }
    } else {
      // если картинка еще не загружена,
      // вешаем обработчик на загрузку картинки
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
      // рисуем один конкретный символ
      contextSymbols.drawImage(
        symbolsSprite[0], // картинка с символами
        0, // расположение символа на спрайте по оси x
        randomSymbols[x][y] * (SYMBOL_HEIGHT), // расположение символа на спрайте по оси y
        SYMBOL_WIDTH, // ширина вырезаемого куска со спрайта
        SYMBOL_HEIGHT, // высота вырезаемого куска со спрайта
        x * SYMBOL_WIDTH, // отступ на канвасе слева (по x)
        y * SYMBOL_HEIGHT, // отступ на канвасе сверху (по y)
        SYMBOL_WIDTH, // ширина рисуемой картинки
        SYMBOL_HEIGHT // высота рисуемой картинки
      );
    }
  }
}

function drawWinSymbol(symbol, x, y) {
  contextSymbols.drawImage(
    symbolsSprite[0], // картинка с символами
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
            // drawWinLines(winLines);
            // printText('  Выпали линии:');
            // // добавляем выигрыш к балансу
            // money += getWon(winLines, win);
        }

        current_win.innerHTML = win.toFixed(2);
        // printText('Ставка: ' + currrent_bet + ' x ' + active_lines_count + ';\t Выигрыш: ' + win.toFixed(2) + ';\t' + 'Баланс: ' + money);
        //autogame init example
        // setTimeout(spin(true), 1000);
    }

    player_blance.innerHTML = money.toFixed(2);
}

function init(images) {
  // очищаем канвас
  clearCanvas();
  // в images хранятся загруженые картинки, по порядку
  // первая и единственныя - это картинка с символами
  symbolsSprite = images;
  // заполняем нашу виртуальную ленту символами
  // согласно их колличеству
  for (var i = 0; i < SYMBOLS_COUNT.length; i++) {
    for (var n = 0; n < SYMBOLS_COUNT[i]; n++) {
      REEL_SYMBOLS.push(i);
    }
  }
  // заполняем симвоалми барабан
  fillReelSymbols();
  spin();

  startButton.addEventListener("click", function () {
    if(money < currrent_bet * active_lines_count) {
      printText('Не хватает денег на совершение ставки');
      return false;
    }
    // заполняем симвоалми барабан
    fillReelSymbols();
    // запучкаем спин
    spin(true);
  });

  // и потом каждую секунду
  // setInterval(spin, 1000);
}

// сначала загружаем все нужные картинки
loadImages([
    symbolsSprite[0],
    symbolsSprite[1]
], function(images) {
    // и лишь потом запускаем скрипт
    init(images);
});