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
    4,//10 [0]
    1,//A [1]
    7,//6 [2]
    3,//J [3]
    2,//K [4]
    4,//9 [5]
    6,//7 [6]
    5,//8 [7]
    3//Q [8]
];
//спрайт или путь к спрайту с картинами канваса
var symbolsSprite = [
    "./images/sprites.png"
];

// лента слота, из которой будут браться случайные символы
var REEL_SYMBOLS = [];

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
        symbols[i] = reel;
    }
    return symbols;
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

    // перемешиваем массив
    shuffleArray(REEL_SYMBOLS);

    // запучкаем спин
    spin();

    // и потом каждую секунду
    setInterval(spin, 1000);
}

function spin() {
    // получаем набор символов для спина
    var symbols = getRandomSymbols();

    // очищаем канвас
    context.clearRect(0, 0, canvas.width, canvas.height);

    // рисуем все символы из массива
    for (var x = 0; x < REELS_COUNT; x++) {
        for (var y = 0; y < ROWS_COUNT; y++) {
            // рисуем один конкретный символ
            context.drawImage(
                symbolsSprite, // картинка с символами
                0, // расположение символа на спрайте по оси x
                symbols[x][y] * (SYMBOL_HEIGHT + 138), // расположение символа на спрайте по оси y
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

// сначала загружаем все нужные картинки
loadImages([
    symbolsSprite
], function(images) {
    // и лишь потом запускаем скрипт
    init(images);
});