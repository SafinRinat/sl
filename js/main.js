// кол-во барабанов
var REELS_COUNT = 5;
// кол-во линий
var ROWS_COUNT = 3;
// ссылка на canvas
var canvas = document.getElementById("slot");
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
// кол-во символов в ленте
var SYMBOLS_COUNT = [
    7, // 6
    6, // 7
    5, // 8
    4, // 9
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
    [1, 1, 1, 1, 1], // 1 индекс символов на барабане
    [0, 0, 0, 0, 0],// 2 индекс
    [2, 2, 2, 2, 2],// 3 индекс
    [0, 1, 2, 1, 0],//
    [2, 1, 0, 1, 2]
];

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
    // для первого символа, то есть 6
    [
        // первое число - колличество одинаковых символов подряд
        // второе - коэфициент выплат
        [3, 5], // если три шестерки подряд - ставка x 5
        [4, 10], // если четыре шестерки подряд - ставка x 10
        [5, 20] // и т. д.
    ],
    // для второго символа, то есть 7 и т.д.
    [
        [3, 5], [4, 15], [5, 25]
    ],
    [
        [3, 5], [4, 15], [5, 25]
    ],
    [
        [3, 10], [4, 25], [5, 50]
    ],
    [
        [3, 25], [4, 50], [5, 100]
    ],
    [
        [2, 25], [3, 50], [4, 100], [5, 250]
    ],
    [
        [2, 25], [3, 50], [4, 100], [5, 500]
    ],
    [
        [2, 50], [3, 150], [4, 250], [5, 500]
    ],
    [
        [2, 50], [3, 250], [4, 500], [5, 1000]
    ]
];
var money = 10000; // деньги игрока
var bet = [0.2, 0.5, 1.0, 2.5, 5]; // ставка

var active_lines_count = 5; // кол-во активных линий, т.е. по которым играет игрок

// лента слота, из которой будут браться случайные символы
var REEL_SYMBOLS = [];

// получаем набор символов для спина
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


// создаем пустой массив и проверяем поддерживается ли indexOf
var find;
if ([].indexOf) {

    find = function(array, value) {
        return array.indexOf(value);
    }

} else {
    find = function(array, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) return i;
        }

        return -1;
    }

}
// function getBet() {
//     currrentBet = document.getElementById();
// }

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
        // 6 => Prince
        // 7 => Princess
        // 8 => Castle
        // console.log(reel);
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
        console.log(lines[0]);
        // дальше проверяем, сколько раз он встречается подряд (lines[line][i] === first_symbol)
        // то есть мы начинаем проверять со второго символа в линии, равняется ли он первому
        // если да, идем дальше и увеличиваем число i на 1
        // если нет, условие lines[line][i] === first_symbol не выполняется и
        // соответственно цикл прерывается
        for (var i = 1; i < lines[line].length && lines[line][i] === first_symbol; i++) {}

        // дальше, берем коэфициенты символа (first_symbol),
        // проходимся по ним в цикле
        for (var comb = 0; comb < WIN_COMB[first_symbol].length; comb++) {
            // и прверяем, есть ли выигрышная комбинация для полученого кол-ва (i)
            if (WIN_COMB[first_symbol][comb][0] === i) {
                // если есть, записываем все нужные данные в объект
                //  и добавляем его к результату
                result.push({
                    symbol: first_symbol, // номер символа
                    count: i, // сколько раз повторился
                    line: active_lines[line], // расположение линии
                    factor: WIN_COMB[first_symbol][comb][1] // коэфициент
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
    var loadedCount = 0;
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
            loadedCount++;
            // если кол-во загруженых картинок равно длине
            // входного массива с ссылками
            if (loadedCount === imgSources.length) {
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
                loadedCount++;
                if (loadedCount === imgSources.length) {
                    if (callback) {
                        callback(result)
                    }
                }
            }
        }
    })
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

    // и потом каждую секунду
    // setInterval(spin, 1000);
}

function spin() {
    // получаем набор символов для спина
    var randomSymbols = getRandomSymbols();
    var winLines = checkWinLines(randomSymbols);
    var playerBlance = document.getElementById('playerBalance');
    var currentWin = document.getElementById('currentWin');
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

    // выигрыш
    var win = 0;
    // проверяем, есть ли деньги совершить ставку
    if (money < bet[0] * active_lines_count) {
        return printText('Не хватает денег на совершение ставки')
    }
    // делаем ставку, отнимает ставку от баланса
    money -= bet[0] * active_lines_count;
    printText('---');
    // проверяем, есть ли выигрышные линии
    if (winLines.length) {
        printText('  Выпали линии:');
        for (var i = 0; i < winLines.length; i++) {
            win += bet[0] * winLines[i].factor;
            printText('  ' + winLines[i].line + '; символ: ' + winLines[i].symbol +
                '; кол-во символов: ' + winLines[i].count + '; коэфициент: ' + winLines[i].factor)
        }
    }
    // добавляем выигрыш к балансу
    money += win;

    currentWin.innerHTML = win;
    playerBlance.innerHTML = money;

    printText('Ставка: ' + bet[0] + ' x ' + active_lines_count + ';\t Выигрыш: ' + win + ';\t' + 'Баланс: ' + money);
    // setTimeout(spin, 1000);
}

// сначала загружаем все нужные картинки
loadImages([
    symbolsSprite
], function(images) {
    // и лишь потом запускаем скрипт
    init(images);
});