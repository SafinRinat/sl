"use strict"; //Strict JS Mode
var BETS = [1, 10, 25, 100, 500];
var DEFAULT_BET_INDEX = 1;
var DEFAULT_COIN = 1;
var COINS_COUNT = 3;
var REEL_SYMBOLS_ANIM_SPRITE_ROWS_COUNT = 5;
var WIN_ANIM_INTERVAL = 500;
var DISORDER_STROKE_COLOR = "#ffffff";
var loadedImages;
var reelsCanvas;
var linesCanvas;
var strokesCanvas;
var winningsCanvas;
var symbolsCoords;
var symbolsImage;
var symbolsAnimImages;
var reelBlurImage;
var linesSelected;
var selectedBet;
var selectedCoin;
var gameData;
var isFreegSpins;
var isFreegBonusGame;
var isModuleLoaded;
var symbolsStrokesRoundness;
var winningTextFontSize;
var winningTextFont;
var reelsBlurAnimFrame;
var reelsBlurAnimInterval;
var symbolAnimFrame;
var symbolAnimInterval;
var clearLinesCanvasTimeout;
var winAnimInterval;
var savedState;
var isReelsStarted;
var isSwipeAction; // for iOS purpose
var REELS_STOP_SOUNDS_ARR = [];
$(function() {
    _log("slots.common::_init()");
    selectedCoin = DEFAULT_COIN;
    if (!top._sessionData.user.games_anim) {
        $(document.body).addClass("no-anim");
    }
});
function initModule() {
    _log("games.slots.common::initModule()");
    symbolsImage = loadedImages["images/reel_symbols.png"];
    reelBlurImage = loadedImages["images/main_reel_blur.jpg"];
    symbolsAnimImages = new Array();
    var tempImage = null;
    for (var i = 0; i < SYMBOL_TYPES_COUNT; i++) {
        var loadedImage = loadedImages["images/main_reel_symbols_anim_" + (i + 1) + ".jpg"];
        if (loadedImage) tempImage = loadedImage;
        symbolsAnimImages[i] = tempImage;
    }
    drawReelsSymbols(gameData.symbols);
    if (gameData.status != "freeg") {
        setUserBalance(gameData.user_cash, gameData.user_free);
    }
    setState(gameData.status);
    initCanvases(
        CANVAS_WINNINGS_FONT,
        CANVAS_WINNINGS_FONT_SIZE,
        CANVAS_STROKES_ROUNDNESS,
        CANVAS_LINES_AND_STROKES_WIDTH,
        CANVAS_SHADOW_BLUR
    );
    if (isFreegSpins) startFreegBGSound();
    else startBGSound();
    top.onInitModule();
}
function initCanvases(winningsFont, winningsFontSize, strokesRoundness, linesAndStrokesWidth, shadowBlur) {
    var linesCanvasCtx = linesCanvas.getContext("2d");
    var strokesCanvasCtx = strokesCanvas.getContext("2d");
    var winningsCanvasCtx = winningsCanvas.getContext("2d");
    winningTextFont = winningsFont;
    winningTextFontSize = winningsFontSize;
    symbolsStrokesRoundness = strokesRoundness;
    linesCanvasCtx.lineCap = strokesCanvasCtx.lineCap = "round";
    linesCanvasCtx.lineJoin = strokesCanvasCtx.lineJoin = "round";
    linesCanvasCtx.lineWidth = strokesCanvasCtx.lineWidth = linesAndStrokesWidth;
    linesCanvasCtx.shadowOffsetX = strokesCanvasCtx.shadowOffsetX = winningsCanvasCtx.shadowOffsetX = 0;
    linesCanvasCtx.shadowOffsetY = strokesCanvasCtx.shadowOffsetY = winningsCanvasCtx.shadowOffsetY = 0;
    linesCanvasCtx.shadowBlur = strokesCanvasCtx.shadowBlur = winningsCanvasCtx.shadowBlur = shadowBlur;
    linesCanvasCtx.shadowColor = strokesCanvasCtx.shadowColor = winningsCanvasCtx.shadowColor = "#000000";
    winningsCanvasCtx.fillStyle = "#ffffff";
    winningsCanvasCtx.strokeStyle = "#000000";
    winningsCanvasCtx.lineWidth = 3;
    if (strokesRoundness == 0) {
        strokesCanvasCtx.lineCap = "square";
        strokesCanvasCtx.lineJoin = "miter";
    }
}
function getRandomReelsSymbols() {
    var symbolsIDArr = new Array();
    for (var i = 0; i < REELS_COUNT; i++) {
        symbolsIDArr[i] = new Array();
        for (var j = 0; j < ROWS_COUNT; j++) {
            symbolsIDArr[i].push(Math.round(Math.random() * (SYMBOL_TYPES_COUNT - 1)) + 1);
        }
    }
    return symbolsIDArr;
}
function getSymbolsPos(symbol_id) {
    var symbols = new Array();
    for (var i = 0; i < REELS_COUNT; i++) {
        for (var j = 0; j < ROWS_COUNT; j++) {
            var symbol = gameData.symbols[i][j];
            if (symbol == symbol_id) {
                symbols.push({ reel: i, row: j });
            }
        }
    }
    return symbols;
}
function clearCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (getBrowser() == "aosp") {
        //TODO Костыль для Android Browser :(
        //В Android Browser - бывают проблемы с очисткой канваса через clearRect
        redrawElementHack(canvas);
    }
}
function clearReelsCanvas() {
    clearCanvas(reelsCanvas);
}
function clearLinesCanvas() {
    clearCanvas(linesCanvas);
}
function clearStrokesCanvas() {
    clearCanvas(strokesCanvas);
}
function clearWinningsCanvas() {
    clearCanvas(winningsCanvas);
}
function checkIsEnoughBalance() {
    if (top._sessionData.user.cash < selectedBet * selectedCoin * linesSelected.length) {
        disableElements($("#spin_btn, #autoplay_btn"));
    } else {
        enableElements($("#spin_btn, #autoplay_btn"));
    }
}
function selectLines(linesCount, isShow) {
    linesSelected = new Array();
    if (isShow) clearLinesCanvas();
    for (var i = 1; i <= LINES.length; i++) {
        var lineButtons = $(".line_btn_" + i);
        if (i <= linesCount) {
            lineButtons.addClass("selected").prop("selected", "selected");
            linesSelected.push(i);
            if (isShow) drawLine(i - 1);
        } else {
            lineButtons.removeClass("selected").removeProp("selected");
        }
    }
    if (isShow) {
        clearTimeout(clearLinesCanvasTimeout);
        clearLinesCanvasTimeout = setTimeout(function() {
            clearLinesCanvasTimeout = null;
            clearLinesCanvas();
        }, 2000);
    }
    if (!!gameData && isShow) gameData.win_lines = null;
    $("#lines_selector .value span").html(linesCount);
}
function selectBet(betIndex, useCoins, removeAnim) {
    selectedBet = BETS[betIndex] ? BETS[betIndex] : BETS[0];
    if (useCoins) $("#bet_selector .value span").html(selectedCoin + " x " + getMoneyString(selectedBet));
    else $("#bet_selector .value span").html(getMoneyString(selectedBet));
    if (removeAnim && !!gameData && !!gameData.win_lines) gameData.win_lines = null;
}
function doSpin() {
    _log("games.slots.common::doSpin()");
    gameData = null;
    changeUserBalance(-(selectedBet * selectedCoin * linesSelected.length));
    top.pushToGameLog({ bet: selectedBet * selectedCoin / 100, lines: linesSelected.length });
    top.doSlotBet(selectedBet, selectedCoin, linesSelected, top.getHCModuleShifts());
    top.disableLobbyPanel();
    top.resetUserWinOnPanel();
}
function drawLine(lineID) {
    var linesCanvasCtx = linesCanvas.getContext("2d");
    var lineObj = LINES[lineID];
    linesCanvasCtx.strokeStyle = lineObj.color;
    linesCanvasCtx.beginPath();
    for (var i = 0; i < lineObj.vertexes.length; i++) {
        var coords = symbolsCoords[i][lineObj.vertexes[i]];
        var symbolCenterX = coords.x + SYMBOL_W / 2;
        var symbolCenterY = coords.y + SYMBOL_H / 2;
        if (i == 0) {
            var coordsLast = symbolsCoords[lineObj.vertexes.length - 1][lineObj.vertexes[lineObj.vertexes.length - 1]];
            var lastSymbolCenterX = coordsLast.x + SYMBOL_W / 2;
            var lastSymbolCenterY = coordsLast.y + SYMBOL_H / 2;
            linesCanvasCtx.arc(symbolCenterX, symbolCenterY, linesCanvasCtx.lineWidth, 0, 2 * Math.PI, false);
            linesCanvasCtx.moveTo(lastSymbolCenterX, lastSymbolCenterY);
            linesCanvasCtx.arc(lastSymbolCenterX, lastSymbolCenterY, linesCanvasCtx.lineWidth, 0, 2 * Math.PI, false);
            linesCanvasCtx.moveTo(symbolCenterX, symbolCenterY);
        } else {
            linesCanvasCtx.lineTo(symbolCenterX, symbolCenterY);
        }
    }
    linesCanvasCtx.stroke();
    linesCanvasCtx.stroke();
}
function drawSymbolsStrokes(symbols) {
    var linesCanvasCtx = linesCanvas.getContext("2d");
    var strokesCanvasCtx = strokesCanvas.getContext("2d");
    strokesCanvasCtx.strokeStyle = ( arguments[1] == "disorder" ? DISORDER_STROKE_COLOR : LINES[arguments[1]].color );
    strokesCanvasCtx.beginPath();
    for (var i in symbols) {
        var symbol = symbols[i];
        var coords = symbolsCoords[symbol.reel][symbol.row];
        var margin = strokesCanvasCtx.lineWidth + strokesCanvasCtx.shadowBlur;
        linesCanvasCtx.clearRect(coords.x + margin / 2, coords.y + margin / 2, SYMBOL_W - margin, SYMBOL_H - margin);
        if (symbolsStrokesRoundness != 0) {
            strokesCanvasCtx.roundedRect(
                coords.x + margin / 2,
                coords.y + margin / 2,
                SYMBOL_W - margin,
                SYMBOL_H - margin,
                symbolsStrokesRoundness
            );
        } else {
            strokesCanvasCtx.rect(
                coords.x + margin / 2,
                coords.y + margin / 2,
                SYMBOL_W - margin,
                SYMBOL_H - margin
            );
        }
    }
    strokesCanvasCtx.stroke();
    strokesCanvasCtx.stroke();
}
function drawWinnings(money, lineID, isDisorder) {
    var winningsCanvasCtx = winningsCanvas.getContext("2d");
    var lineObj = LINES[lineID];
    var centralReel = (symbolsCoords.length - 1) / 2;
    var coords = isDisorder ? symbolsCoords[centralReel][1] : symbolsCoords[centralReel][lineObj.vertexes[centralReel]];
    var moneyString = getMoneyString(money);
    var textX = coords.x + SYMBOL_W / 2 - winningsCanvasCtx.measureText(moneyString).width / 2;
    var textY = coords.y + SYMBOL_H / 2 + winningTextFontSize / 2 - 5;
    winningsCanvasCtx.fillStyle = increaseColorBrightness(( isDisorder ? DISORDER_STROKE_COLOR : lineObj.color ), 75);
    winningsCanvasCtx.strokeText(moneyString, textX, textY);
    winningsCanvasCtx.fillText(moneyString, textX, textY);
}
function drawReelsSymbols(symbols) {
    var reelsCanvasCtx = reelsCanvas.getContext("2d");
    if (!symbols) {
        //For debug purposes
        var a = 0;
        symbols = new Array();
        for (var i = 0; i < REELS_COUNT; i++) {
            symbols[i] = new Array();
            for (var j = 0; j < ROWS_COUNT; j++) {
                symbols[i][j] = (a++ % SYMBOL_TYPES_COUNT) + 1;
            }
        }
        gameData.symbols = symbols;
    }
    for (var i = 0; i < symbols.length; i++) {
        for (var j = 0; j < symbols[i].length; j++) {
            var coords = symbolsCoords[i][j];
            reelsCanvasCtx.drawImage(
                symbolsImage,
                0,
                (symbols[i][j] - 1) * SYMBOL_H,
                SYMBOL_W,
                SYMBOL_H,
                coords.x,
                coords.y,
                SYMBOL_W,
                SYMBOL_H
            );
        }
    }
}
function startReelsBlurAnim() {
    _log("games.slots.common::startReelsBlurAnim()");
    isReelsStarted = true;
    if (!top._sessionData.user.games_anim) {
        stopReelsBlurAnim(true);
        return;
    }
    _log("games.slots.common::startReelsBlurAnim() isSwipeAction = " + isSwipeAction);
    if (isSwipeAction) {
        if (getPlatform() != "ios") playSound("reels_start_sound");
    } else playSound("reels_start_sound");
    var reelsCanvasCtx = reelsCanvas.getContext("2d");
    var stopReels = false;
    var stopFrame;
    reelsBlurAnimFrame = 0;
    reelsBlurAnimInterval = setInterval(function() {
        if (reelsBlurAnimFrame == 0) {
            if (!_autoplayModule.autoplay_data && !isFreegSpins) {
                hideElements($("#spin_btn"));
                showElements($("#skip_btn"));
            }
        }
        for (var i = 0; i < REELS_COUNT; i++) {
            var reelX = (REEL_W + REEL_LEFT_MARGIN) * i;
            if ((gameData == null || reelsBlurAnimFrame < REEL_BLUR_ANIM_MIN_DURATION || i != 0) && !stopReels) {
                if (reelsBlurAnimFrame >= i * 10) {
                    reelsCanvasCtx.drawImage(
                        reelBlurImage,
                        REEL_W * ((reelsBlurAnimFrame + i * 3) % REEL_BLUR_FRAMES_COUNT),
                        0,
                        REEL_W,
                        REEL_H,
                        reelX,
                        0,
                        REEL_W,
                        REEL_H
                    );
                }
            } else {
                if (!stopReels) {
                    stopReels = true;
                    stopFrame = reelsBlurAnimFrame;
                }
                if (reelsBlurAnimFrame - stopFrame == i * 10) {
                    reelsCanvasCtx.clearRect(reelX, 0, REEL_W, REEL_H);
                    if (getBrowser() == "aosp") {
                        //TODO Костыль для Android Browser :(
                        //В Android Browser - бывают проблемы с очисткой канваса через clearRect
                        redrawElementHack(reelsCanvas);
                    }
                    for (var j = 0; j < ROWS_COUNT; j++) {
                        var coords = symbolsCoords[i][j];
                        reelsCanvasCtx.drawImage(
                            symbolsImage,
                            0,
                            (gameData.symbols[i][j] - 1) * SYMBOL_H,
                            SYMBOL_W,
                            SYMBOL_H,
                            coords.x,
                            coords.y,
                            SYMBOL_W,
                            SYMBOL_H
                        );
                    }
                    if (i > 1 && REELS_STOP_SOUNDS_ARR.length > 1) playSound("reels_stop" + (i + 1) + "_sound");
                    if (i == REELS_COUNT - 1) stopReelsBlurAnim(false);
                } else if (reelsBlurAnimFrame - stopFrame < i * 10) {
                    reelsCanvasCtx.drawImage(
                        reelBlurImage,
                        REEL_W * ((reelsBlurAnimFrame + i * 3) % REEL_BLUR_FRAMES_COUNT),
                        0,
                        REEL_W,
                        REEL_H,
                        reelX,
                        0,
                        REEL_W,
                        REEL_H
                    );
                }
            }
        }
        reelsBlurAnimFrame++;
    }, 1000 / REELS_ANIM_FPS);
}
function stopReelsBlurAnim(isRedrawSymbols) {
    _log("games.slots.common::stopReelsBlurAnim()");
    isReelsStarted = false;
    stopSound("reels_start_sound");
    isSwipeAction = false;
    if (REELS_STOP_SOUNDS_ARR.length == 1) playSound(REELS_STOP_SOUNDS_ARR[0]);
    clearInterval(reelsBlurAnimInterval);
    reelsBlurAnimInterval = null;
    if (isRedrawSymbols) {
        clearReelsCanvas();
        drawReelsSymbols(gameData.symbols);
    }
    if (gameData.status == "bet" || gameData.status == "ok") {
        setUserBalance(gameData.user_cash, gameData.user_free);
    }
    top.pushToGameLog({ win: gameData.win_cash / 100 });
    setTimeout(setState, DEFERRED_RUN_TIMEOUT, gameData.status);
}
function startSymbolsAnim(symbols) {
    var reelsCanvasCtx = reelsCanvas.getContext("2d");
    if (!symbols) {
        //For debug purposes
        symbols = new Array();
        for (var i = 0; i < REELS_COUNT; i++) {
            for (var j = 0; j < ROWS_COUNT; j++) {
                symbols.push({ reel: i, row: j });
            }
        }
    }
    symbolAnimFrame = 0;
    if (top._sessionData.user.games_anim) {
        var symbolID = 0;
        symbolAnimInterval = setInterval(function() {
            for (var i in symbols) {
                var symbol = symbols[i];
                symbolID = gameData.symbols[symbol.reel][symbol.row] - 1;
                var coords = symbolsCoords[symbol.reel][symbol.row];
                reelsCanvasCtx.clearRect(coords.x, coords.y, SYMBOL_W, SYMBOL_H);
                reelsCanvasCtx.drawImage(
                    symbolsAnimImages[symbolID],
                    (symbolAnimFrame % SYMBOLS_ANIM_FRAMES[symbolID]) * SYMBOL_W,
                    symbolID % REEL_SYMBOLS_ANIM_SPRITE_ROWS_COUNT * SYMBOL_H,
                    SYMBOL_W,
                    SYMBOL_H,
                    coords.x,
                    coords.y,
                    SYMBOL_W,
                    SYMBOL_H
                );
            }
            symbolAnimFrame++;
        }, 1000 / SYMBOLS_ANIM_FPS);
        if (arguments[1]) playSound("comb_symbol" + arguments[1] + "_sound");
        setVolume("background_sound", 0.2);
    }
}
function stopSymbolsAnim(isRedrawSymbols) {
    clearInterval(symbolAnimInterval);
    symbolAnimInterval = null;
    if (isRedrawSymbols) {
        clearReelsCanvas();
        drawReelsSymbols(gameData.symbols);
    }
}
function startWinAnim(type) {
    _log("games.slots.common::startWinAnim() type: " + type);
    var isNew = true;
    var counter = 0;
    var index = 0;
    winAnimInterval = setInterval(function() {
        counter++;
        switch (type) {
            case "lines_anim":
                var winLine = gameData.win_lines[index];
                if ((counter & 1) != 0) {
                    var winSymbols = new Array();
                    for (var i = 0; i < winLine.layout.length; i++) {
                        if (winLine.layout[i] != 0) {
                            winSymbols.push({ reel: i, row: winLine.layout[i] - 1 })
                        }
                    }
                    if (isNew) {
                        isNew = false;
                        clearLinesCanvas();
                        clearStrokesCanvas();
                        clearWinningsCanvas();
                        stopSymbolsAnim(true);
                        startSymbolsAnim(winSymbols, winLine.comb_symbol);
                    }
                    if (top._sessionData.user.games_anim || (!top._sessionData.user.games_anim && counter == 1)) {
                        drawLine(winLine.line - 1);
                        drawSymbolsStrokes(winSymbols, winLine.line - 1);
                        drawWinnings(winLine.cash, winLine.line - 1);
                        $(".line_btn").css("opacity", DISABLED_ELEMENT_OPACITY);
                        $(".line_btn_" + winLine.line).css("opacity", 1);
                    }
                } else {
                    if (top._sessionData.user.games_anim) {
                        clearLinesCanvas();
                        clearStrokesCanvas();
                        clearWinningsCanvas();
                        $(".line_btn").css("opacity", DISABLED_ELEMENT_OPACITY);
                    }
                }
                if (counter >= 6 && (counter & 1) == 0) {
                    if (index < gameData.win_lines.length - 1) {
                        isNew = true;
                        counter = 0;
                        index++;
                    } else {
                        if (gameData.disorder) {
                            stopWinAnim(true);
                            startWinAnim("disorder_anim");
                        } else if (gameData.status == "bong") {
                            stopWinAnim(true);
                            startWinAnim("bong_anim");
                        } else if (gameData.status == "freeg") {
                            stopWinAnim(true);
                            startWinAnim("freeg_anim");
                        } else {
                            isNew = true;
                            counter = 0;
                            index = 0;
                        }
                    }
                }
                break;
            case "disorder_anim":
                if (counter < 6) {
                    var disorderSymbols = getSymbolsPos(DISORDER_SYMBOL_ID);
                    if (isNew) {
                        isNew = false;
                        clearLinesCanvas();
                        clearStrokesCanvas();
                        clearWinningsCanvas();
                        stopSymbolsAnim(true);
                        playSound("scatter_sound");
                        startSymbolsAnim(disorderSymbols);
                    }
                    if (top._sessionData.user.games_anim) {
                        if (counter & 1) {
                            drawSymbolsStrokes(disorderSymbols, "disorder");
                            drawWinnings(gameData.disorder.cash, 0, true);
                        } else {
                            clearStrokesCanvas();
                            clearWinningsCanvas();
                        }
                    } else {
                        if (!top._sessionData.user.games_anim && counter == 1) {
                            drawSymbolsStrokes(disorderSymbols, "disorder");
                            drawWinnings(gameData.disorder.cash, 0, true);
                        }
                    }
                } else {
                    if (!top._sessionData.user.games_anim) {
                        clearStrokesCanvas();
                        clearWinningsCanvas();
                    }
                    if (gameData.status == "bong") {
                        stopWinAnim(true);
                        startWinAnim("bong_anim");
                    } else if (gameData.status == "freeg") {
                        stopWinAnim(true);
                        if (!disorderIsFreeg) startWinAnim("freeg_anim");
                        else {
                            if (!isFreegSpins) showFreegPlate();
                            setFreegTotalWinnings(freegTotalWinnings);
                            setFreegTotalCount(freegTotalCount);
                            setFreegFactor(gameData.freeg_factor);
                            doFreeg();
                        }
                    } else if (gameData.win_lines) {
                        stopWinAnim(true);
                        startWinAnim("lines_anim");
                    } else {
                        counter = 0;
                        isNew = true;
                    }
                }
                break;
            case "bong_anim":
                if (counter < 6) {
                    if (isNew) {
                        isNew = false;
                        var bonusSymbols = new Array();
                        for (var i = 0; i < REELS_COUNT; i++) {
                            for (var j = 0; j < ROWS_COUNT; j++) {
                                var symbol = gameData.symbols[i][j];
                                if (symbol == BONUS_GAMES[gameData.bong_id - 1].symbol_id) {
                                    bonusSymbols.push({ reel: i, row: j });
                                }
                            }
                        }
                        if (BONUS_GAMES[gameData.bong_id - 1].screen === "bonus_A") playSound("bonusA_start_sound");
                        else if (BONUS_GAMES[gameData.bong_id - 1].screen === "bonus_B") playSound("bonusB_start_sound");
                        else if (BONUS_GAMES[gameData.bong_id - 1].screen === "bonus_C") playSound("bonusC_start_sound");
                        startSymbolsAnim(bonusSymbols);
                    }
                    if (!top._sessionData.user.games_anim && counter == 1) {
                        drawSymbolsStrokes(bonusSymbols, "disorder");
                    }
                } else {
                    clearStrokesCanvas();
                    nextScreen(BONUS_GAMES[gameData.bong_id - 1].screen);
                }
                break;
            case "freeg_anim":
                if (counter < 6) {
                    if (isNew) {
                        isNew = false;
                        var freegSymbols = getSymbolsPos(FREEG_SYMBOL_ID);
                        playSound("free_start_sound");
                        startSymbolsAnim(freegSymbols);
                    }
                    if (!top._sessionData.user.games_anim && counter == 1) {
                        drawSymbolsStrokes(freegSymbols, "disorder");
                    }
                } else {
                    clearStrokesCanvas();
                    stopWinAnim(true);
                    if (isFreegBonusGame) {
                        if (FREEG_BONUS_GAME) {
                            nextScreen(FREEG_BONUS_GAME);
                        } else {
                            freegBonusGame();
                        }
                    } else {
                        if (!isFreegSpins) showFreegPlate();
                        setFreegTotalWinnings(freegTotalWinnings);
                        setFreegTotalCount(freegTotalCount);
                        setFreegFactor(gameData.freeg_factor);
                        doFreeg();
                    }
                }
                break;
        }
    }, WIN_ANIM_INTERVAL / (top._sessionData.user.games_anim ? 1 : 2));
    if (gameData.jackpot_win) {
        startJackpotWinAnim();
    }
}
function startFreegBGSound() {
    _log("games.slots.common::startFreegBGSound()");
    ////Костыль для UC Browser-a , не воспроизводяться длинные звуки
    if (getBrowser() == "uc") return;
    stopSound("background_sound");
    playSound("free_background_sound");
}
function nextScreen(screen, data) {
    var savedState = {
        lines_selected: linesSelected.length,
        selected_bet: selectedBet,
        game_data: gameData,
        autoplay_data: _autoplayModule.autoplay_data
    };
    if (selectedCoin) {
        savedState.selected_coin = selectedCoin;
    }
    if (isFreegSpins) {
        savedState.is_freeg_spins = isFreegSpins;
        savedState.freeg_total_count = freegTotalCount;
        savedState.freeg_factor = freegFactor;
    }
    if (isFreegSpins || isFreegBonusGame) {
        savedState.freeg_total_win = freegTotalWinnings;
    }
    var moduleData = !!data ? data : new Object();
    moduleData.bonus_mode = gameData.bonus_mode;
    gameData.win_lines = null;
    gameData.disorder = null;
    stopWinAnim(false);
    top.openGameScreen(
        top._sessionData.game.name,
        top._sessionData.game.group,
        screen,
        savedState,
        moduleData
    );
}
function stopWinAnim(isRedrawSymbols) {
    _log("games.slots.common::stopWinAnim()");
    clearInterval(winAnimInterval);
    winAnimInterval = null;
    clearLinesCanvas();
    clearStrokesCanvas();
    clearWinningsCanvas();
    stopSymbolsAnim(isRedrawSymbols);
    $(".line_btn").css("opacity", DISABLED_ELEMENT_OPACITY);
    if (gameData.jackpot_win) {
        stopJackpotWinAnim();
        setJackpot(gameData.jackpot);
    }
}
function reelsSoundEnded(data) {
    _log("games.slots.common::reelsSoundEnded()");
    if (!isReelsStarted) stopSound("reels_start_sound");
}
function onInitModule() {
    _log("games.slots.common::onInitModule()");
    setTimeout(function() {
        var winningsCanvasCtx = winningsCanvas.getContext("2d");
        winningsCanvasCtx.font = winningTextFontSize + "px " + winningTextFont;
    }, DEFERRED_RUN_TIMEOUT);
    $(window).trigger("module_init");
}
function onResponseCommand_start(status, data) {
    _log("games.slots.common::onResponseCommand_start()");
    var usercashXML = data.find("usercash");
    var jackpotXML = data.find("jackpot");
    gameData = new Object();
    gameData.status = status;
    gameData.user_cash = parseInt(usercashXML.attr("real"));
    gameData.user_free = parseInt(usercashXML.attr("free"));
    gameData.symbols = getRandomReelsSymbols();
    if (jackpotXML.length) {
        gameData.jackpot = parseInt(jackpotXML.attr("cash"));
    }
    if (isModuleLoaded) initModule();
}
function onResponseCommand_leave(status, data) {
    _log("games.slots.common::onResponseCommand_leave()");
    var usercashXML = $(data).find("usercash");
    top._sessionData.user.cash = usercashXML.attr("real");
    top._sessionData.user.free = usercashXML.attr("free");
    destroySound();
    top.openLobby();
}
function onResponseCommand_chang(status, data) {
    _log("games.slots.common::onResponseCommand_chang()");
    var usercashXML = data.find("usercash");
    gameData.status = status;
    gameData.user_cash = parseInt(usercashXML.attr("real"));
    gameData.user_free = parseInt(usercashXML.attr("free"));
    gameData.win_lines = null;
    gameData.disorder = null;
    gameData.special = null;
    setUserBalance(gameData.user_cash, gameData.user_free);
    setState(status);
    if (gameData.swipe_auto_spin) {
        gameData.swipe_auto_spin = null;
        $("#spin_btn").trigger(POINTER_EVENTS.click);
    }
}