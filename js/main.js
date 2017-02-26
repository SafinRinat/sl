//run game
var startButton = document.getElementById('start');
var remove_line = document.getElementById('remove_line');
var add_line = document.getElementById('add_line');
var select_bet = document.getElementById('set_bet');
var reduce_stakes = document.getElementById('reduce_stakes');
var raise_stakes = document.getElementById('raise_stakes');

// кол-во барабанов
var REELS_COUNT = 5;
// кол-во линий
var ROWS_COUNT = 3;
// ссылка на canvas
var canvas = document.getElementById("slot");
var lines = document.getElementById("lines");
// ширина символа
var SYMBOL_WIDTH = 138;
// высота символа
var SYMBOL_HEIGHT = 138;
// выставляем ширину
canvas.width = SYMBOL_WIDTH * REELS_COUNT;
// и высоту канваса
canvas.height = SYMBOL_HEIGHT * ROWS_COUNT;
// получаем его контекст для рисования
var context = canvas.getContext("2d");
var contextLines = lines.getContext("2d");

var STROKE_WIDTH = 6;
var SYMBOL_MARGIN = 5;
var ROUNDED_RECT_RADIUS = 8;

contextLines.lineWidth = STROKE_WIDTH;
contextLines.lineCap = "round";
contextLines.lineJoin = "round";
contextLines.shadowOffsetX = 2;
contextLines.shadowOffsetY = 2;
contextLines.shadowBlur = 5;
contextLines.shadowColor = 'rgba(0, 0, 0, 0.25)';

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
//спрайт или путь к спрайту с картинами канваса
var symbolsSprite = [
    "./images/sprites.jpg"
];

// линии, по которым проверять выигрыш
var PAY_LINES = [
    [0, 0, 0, 0, 0],// 2 индекс
    [1, 1, 1, 1, 1], // 1 индекс символов на барабане
    [2, 2, 2, 2, 2],// 3 индекс
    [0, 1, 2, 1, 0],//4
    [2, 1, 0, 1, 2]//5
];

var COLOR_LINES = [
    "#f00",//line1
    "#0f0",//line2
    "#00f",//line3
    "#ff0",//line4
    "#0ff"//line5
];

var SELECT_LINES = [
    //линия 1
    { line: PAY_LINES[0], count: 0, color: COLOR_LINES[0] },
    //линия 2
    { line: PAY_LINES[1], count: 0, color: COLOR_LINES[1] },
    //линия 3
    { line: PAY_LINES[2], count: 0, color: COLOR_LINES[2] },
    //линия 4
    { line: PAY_LINES[3], count: 0, color: COLOR_LINES[3] },
    //линия 5
    { line: PAY_LINES[4], count: 0, color: COLOR_LINES[4] }
];

// var WIN_LINES = [
//     { line: PAY_LINES[0], count: 2, color: "#f00" },
//     { line: PAY_LINES[0], count: 3, color: "#f00" },
//     { line: PAY_LINES[0], count: 4, color: "#f00" },
//     { line: PAY_LINES[0], count: 5, color: "#f00" },
//
//     { line: PAY_LINES[1], count: 2, color: "#0f0" },
//     { line: PAY_LINES[1], count: 3, color: "#0f0" },
//     { line: PAY_LINES[1], count: 4, color: "#0f0" },
//     { line: PAY_LINES[1], count: 5, color: "#0f0" },
//
//     { line: PAY_LINES[2], count: 2, color: "#00f" },
//     { line: PAY_LINES[2], count: 3, color: "#00f" },
//     { line: PAY_LINES[2], count: 4, color: "#00f" },
//     { line: PAY_LINES[2], count: 5, color: "#00f" },
//
//     { line: PAY_LINES[3], count: 2, color: "#ff0" },
//     { line: PAY_LINES[3], count: 3, color: "#ff0" },
//     { line: PAY_LINES[3], count: 4, color: "#ff0" },
//     { line: PAY_LINES[3], count: 5, color: "#ff0" },
//
//     { line: PAY_LINES[4], count: 2, color: "#0ff" },
//     { line: PAY_LINES[4], count: 3, color: "#0ff" },
//     { line: PAY_LINES[4], count: 4, color: "#0ff" },
//     { line: PAY_LINES[4], count: 5, color: "#0ff" }
// ];

// Линии:
//
//1.
//     [-][-][-][-][-]
//     [ ][ ][ ][ ][ ]
//     [ ][ ][ ][ ][ ]
// 2.
//     [ ][ ][ ][ ][ ]
//     [-][-][-][-][-]
//     [ ][ ][ ][ ][ ]
// 3.
//     [ ][ ][ ][ ][ ]
//     [ ][ ][ ][ ][ ]
//     [-][-][-][-][-]
// 4.
//     [-][-][ ][ ][ ]
//     [ ][ ][-][ ][ ]
//     [ ][ ][ ][-][-]
// 5.
//     [ ][ ][ ][-][-]
//     [ ][ ][-][ ][ ]
//     [-][-][ ][ ][ ]

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
        [2, 12], [3, 24], [4, 48], [5, 96]
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

var money = 500; // деньги игрока
var BET_LIST = [0.00, 0.2, 0.5, 1.0, 2.5, 5]; // ставка
var currrent_bet = parseFloat(0.00);//default 0.00
var active_lines_count = 1; // кол-во активных линий, т.е. по которым играет игрок

// лента слота, из которой будут браться случайные символы
var REEL_SYMBOLS = [];

var counter_bet_list = 0;

function setBet(val) {
    var select_lines = document.getElementById('set_bet');

    if(typeof val !== undefined) {
        if (val === "raise" && counter_bet_list < 5) {
            counter_bet_list++;
        }
        if (val === "reduce" && counter_bet_list > 0) {
            counter_bet_list--;
        }
    }

    select_bet.innerHTML = parseFloat(BET_LIST[counter_bet_list]).toFixed(2);

    currrent_bet = parseFloat(BET_LIST[counter_bet_list]);
}



raise_stakes.addEventListener("click", function () {
    setBet("raise");
});

reduce_stakes.addEventListener("click", function () {
    setBet("reduce");
});

// var select_bet = document.getElementById('set_bet');
// var reduce_stakes = document.getElementById('reduce_stakes');
// var raise_stakes = document.getElementById('raise_stakes');
function setLines(val) {
    var select_lines = document.getElementById('set_lines');
    var counter = parseInt(select_lines.innerHTML);

    if (counter < 0 || counter > 5) {
        return false;
    } else {
        if(typeof val !== undefined) {
            if (val === "add" && counter < 5) {
                counter++;
            }
            if (val === "remove" && counter > 0) {
                counter--;
            }
        }

        active_lines_count = counter;
        select_lines.innerHTML = counter;
        if(counter === 0 ) {
            drawWinLine(
                PAY_LINES[counter],
                0,
                COLOR_LINES[counter]
            );
        } else {
            drawWinLine(
                PAY_LINES[counter -1],
                0,
                COLOR_LINES[counter -1]
            );
        }
    }
}

add_line.addEventListener("click", function () {
    setLines("add");
});

remove_line.addEventListener("click", function () {
    setLines("remove");
});

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

// получаем набор символов для спина
function getRandomSymbols() {
    // массив с барабанами
    var symbols = [];
    // сдвиг на ленте символов
    var shift;
    // барабан
    var reel;
    // для каждого барабана
    for (var i = 0; i < REELS_COUNT; i++) {
        // получаем случайный сдвиг
        shift = getRandomInt(0, REEL_SYMBOLS.length - 1);
        // из всей ленты берем срез, начиная со сдвига shift + 2 символа
        // то есть получаем срез из трех подряд символов с ленты
        reel = REEL_SYMBOLS.slice(shift, shift + ROWS_COUNT);

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
        // 0 => Gold(6)
        // 1 => 10
        // 2 => J
        // 3 => Q
        // 4 => K
        // 5 => A
        // 6 => Prince (хотел на оборот, 6 принцесса, 7 принц)
        // 7 => Princess
        // 8 => Castle

        symbols[i] = reel;
    }
    return symbols;
}

function checkWinLines(symbols) {
    // результат
    var result = [];
    // промежуьочный массив,
    // соберем туда символы по играющим линиям
    var lines = [];
    // выберем линии, которые сейчас играют, по которым,
    // соответственно, будем искать выигрышь
    var active_lines = PAY_LINES.slice(0, active_lines_count);
    //цвет выигрышных линий
    var check_color_lines = [];
    // для всех активных линий выбираем символы из барабанов
    for (var line = 0; line < active_lines.length; line ++) {
        // линия для проверки
        lines[line] = [];
        // для всех позиций проверяемой линии выбираем символы
        // из выпавших символов на барабанах
        for (var reel = 0; reel < active_lines[line].length; reel++) {
            lines[line].push(symbols[reel][active_lines[line][reel]]);
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
        while (lines[line][counter] === first_symbol) {
            counter++;
        }
        // дальше, берем коэфициенты символа (first_symbol),
        // проходимся по ним в цикле
        //WIN_COMB[first_symbol].length - количество первых символов с каждой линии по 1, то есть 5 линий 5 первых символов
        for (var comb = 0; comb < WIN_COMB[first_symbol].length; comb++) {
            // и прверяем, есть ли выигрышная комбинация для полученого кол-ва (counter)
            if (WIN_COMB[first_symbol][comb][0] === counter) {
                check_color_lines.push(PAY_LINES.indexOf(active_lines[line]));
                // если есть, записываем все нужные данные в объект
                //  и добавляем его к результату
                result.push({
                    symbol: first_symbol, // номер символа
                    count: counter, // сколько раз повторился
                    line: active_lines[line], // расположение линии
                    multiplier: WIN_COMB[first_symbol][comb][1], // коэфициент
                    lineColor: check_color_lines
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

function roundedRect(x, y, width, height) {
    context.beginPath();
    context.moveTo(x, y + ROUNDED_RECT_RADIUS);
    context.lineTo(x, y + height - ROUNDED_RECT_RADIUS);
    context.arcTo(x, y + height, x + ROUNDED_RECT_RADIUS, y + height, ROUNDED_RECT_RADIUS);
    context.lineTo(x + width - ROUNDED_RECT_RADIUS, y + height);
    context.arcTo(x + width, y + height, x + width, y + height-ROUNDED_RECT_RADIUS, ROUNDED_RECT_RADIUS);
    context.lineTo(x + width, y + ROUNDED_RECT_RADIUS);
    context.arcTo(x + width, y, x + width - ROUNDED_RECT_RADIUS, y, ROUNDED_RECT_RADIUS);
    context.lineTo(x + ROUNDED_RECT_RADIUS, y);
    context.arcTo(x, y, x, y + ROUNDED_RECT_RADIUS, ROUNDED_RECT_RADIUS);
    context.stroke();
}

function drawWinLine(line, count, color) {
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(0, SYMBOL_HEIGHT * line[0] + SYMBOL_HEIGHT / 2);
    for (var x = 0; x < line.length; x++) {
        context.lineTo(
            SYMBOL_WIDTH * x + SYMBOL_WIDTH / 2,
            SYMBOL_HEIGHT * line[x] + SYMBOL_HEIGHT / 2
        );
    }
    context.lineTo(
        SYMBOL_WIDTH * line.length,
        SYMBOL_HEIGHT * line[line.length - 1] + SYMBOL_HEIGHT / 2
    );
    context.stroke();
    for (var i = 0; i < count; i++) {
        //TODO: сделать отрисовку выигрышного символа и линий, но перед этим реализовать таймаут для отрисовки.
        // context.clearRect(
        //     SYMBOL_WIDTH * i + SYMBOL_MARGIN + STROKE_WIDTH,
        //     line[i] * SYMBOL_HEIGHT + SYMBOL_MARGIN + STROKE_WIDTH,
        //     SYMBOL_WIDTH - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2,
        //     SYMBOL_HEIGHT - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2
        // );
        roundedRect(
            SYMBOL_WIDTH * i + SYMBOL_MARGIN + STROKE_WIDTH,
            line[i] * SYMBOL_HEIGHT + SYMBOL_MARGIN + STROKE_WIDTH,
            SYMBOL_WIDTH - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2,
            SYMBOL_HEIGHT - SYMBOL_MARGIN * 2 - STROKE_WIDTH * 2
        )
    }
}

function spin(clicked) {
    if(typeof clicked === "boolean") {
        var init_from_user = true;
    }

    // получаем набор символов для спина
    var randomSymbols = getRandomSymbols();
    var winLines = checkWinLines(randomSymbols);
    var player_blance = document.getElementById('player_balance');
    var current_win = document.getElementById('current_win');
    // очищаем канвас
    context.clearRect(0, 0, canvas.width, canvas.height);
    // рисуем все символы из массива
    for (var x = 0; x < REELS_COUNT; x++) {
        for (var y = 0; y < ROWS_COUNT; y++) {
            // рисуем один конкретный символ
            context.drawImage(
                symbolsSprite, // картинка с символами
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

    if (init_from_user) {
        // выигрыш
        var win = 0;
        // проверяем, есть ли деньги совершить ставку
        if (money < currrent_bet * active_lines_count) {
            return printText('Не хватает денег на совершение ставки');
        }
        // делаем ставку, отнимает ставку от баланса
        money -= currrent_bet * active_lines_count;
        printText('---');
        // проверяем, есть ли выигрышные линии
        if (winLines.length) {
            printText('  Выпали линии:');
            for (var i = 0; i < winLines.length; i++) {
                drawWinLine(
                    winLines[i].line,
                    winLines[i].count,
                    COLOR_LINES[winLines[i].lineColor[i]]
                );

                win += currrent_bet * winLines[i].multiplier;

                printText('  ' + winLines[i].line + '; символ: ' + winLines[i].symbol +
                    '; кол-во символов: ' + winLines[i].count + '; коэфициент: ' + winLines[i].multiplier)
            }
        }
        // win = win.toFixed(2);
        // добавляем выигрыш к балансу
        money += win;
        current_win.innerHTML = win.toFixed(2);
        printText('Ставка: ' + currrent_bet + ' x ' + active_lines_count + ';\t Выигрыш: ' + win.toFixed(2) + ';\t' + 'Баланс: ' + money);
        //autogame
        // setTimeout(spin(true), 1000);
    }

    player_blance.innerHTML = money.toFixed(2);
}

function init(images) {
    // в images хранятся загруженые картинки, по порядку
    // первая и единственныя - это картинка с символами
    symbolsSprite = images[0];
    // заполняем нашу виртуальную ленту символами
    // согласно их колличеству
    for (var i = 0; i < SYMBOLS_COUNT.length; i++) {
        for (var n = 0; n < SYMBOLS_COUNT[i]; n++) {
            REEL_SYMBOLS.push(i);
        }
    }
    // заполняем симвоалми барабан
    fillReelSymbols();
    // запучкаем спин
    spin();

    startButton.addEventListener("click", function () {
        console.log(currrent_bet);
        if (currrent_bet === 0.00) {
            return printText('Сделайте Вашу ставку!.')
        } else  {
            // заполняем симвоалми барабан
            fillReelSymbols();
            // запучкаем спин
            spin(true);
        }
    });

    // и потом каждую секунду
    // setInterval(spin, 1000);
}

// сначала загружаем все нужные картинки
loadImages([
    symbolsSprite
], function(images) {
    // и лишь потом запускаем скрипт
    init(images);
});