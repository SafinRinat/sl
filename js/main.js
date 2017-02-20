//strokeRect(x, y, ширина, высота) // Рисует прямоугольник
//fillRect(x, y, ширина, высота)   // Рисует закрашенный прямоугольник
//clearRect(x, y, ширина, высота)  // Очищает область на холсте размер с прямоугольник заданного размера

/**
 * base canvas element
 * @type {Element}
 */
var canvas = document.getElementById("slot");
/**
 * width & height
 * @type {number}
 */
canvas.width = 640;
canvas.height = 384;

/**
 * make context
 */
var context = canvas.getContext("2d");

/**
 * CONSTANT's from draw canvas
 * @type {number}
 */
var REELS_COUNT = 5;
var ROWS_COUNT = 3;
var SYMBOL_WIDTH = 128;
var SYMBOL_HEIGHT = 128;
var SYMBOLS_COUNT = {
    "6": 7,
    "7": 6,
    "8": 5,
    "9": 4,
    "10": 4,
    "J": 3,
    "Q": 3,
    "K": 2,
    "A": 1
};

var IMAGES_PATHS = {
   "6": "./images/Castle.png",
   "7": "./images/Princ.png",
   "8": "./images/Princess.png",
   "9": "./images/Money.png",
   "10": "./images/10.png",
   "J": "./images/J.png",
   "Q": "./images/Q.png",
   "K": "./images/K.png",
   "A": "./images/A.png"
};

/**
 * random function
 * @param min
 * @param max
 * @returns {*}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * initialize
 */
function init() {
    var reels = [];
    var randomSymbols = [];

    for (var prop in SYMBOLS_COUNT) {
        for (var i = 0; i < SYMBOLS_COUNT[prop]; i++) {
            reels.push(prop);
        }
    }

    function getSourceImages(IMAGES_PATHS) {
        var sources = [];

        for (var prop in IMAGES_PATHS) {
            sources.push(IMAGES_PATHS[prop]);
        }

        return sources;
    }

    // reels[randomInt(0, reels.length - 1)]

    loadImages(getSourceImages(IMAGES_PATHS), function (images) {
        // console.log(images[IMAGES_PATHS[reels[getRandomInt(0, reels.length -1)]]]);
        context.drawImage(
            images[IMAGES_PATHS[reels[getRandomInt(0, reels.length -1)]]],
            0, 0
        );
    });


}

/**
 * function from draw all symbols om row
 * @param symbols
 */
function drawSymbols(symbols) {

}

/**
 * function draw one symbol from one drum unit
 * @param symbol
 * @param x
 * @param y
 */
function drawSymbol(symbol, x, y) {

}

/**
 *
 * @param imagesSources
 * @param callback
 */
function loadImages(imagesSources, callback) {
    var result = {};
    var loadedCount = 0;
    imagesSources.forEach(function(path) {
        var image = new Image();
        image.src = path;
        result[path] = image;
        if (image.complete || image.readyState == 4) {
            loadedCount++;
            if (loadedCount === imagesSources.length) {
                if (callback) {
                    callback(result)
                }
            }
        } else {
            image.onload = function() {
                loadedCount++;
                if (loadedCount === imagesSources.length) {
                    if (callback) {
                        callback(result);
                    }
                }
            }
        }
    })
}

//run initialaze
init();