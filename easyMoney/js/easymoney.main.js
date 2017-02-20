"use strict"; //Strict JS Mode
var CANVAS_WINNINGS_FONT = "Old-Town";
var CANVAS_WINNINGS_FONT_SIZE = 60;
var CANVAS_STROKES_ROUNDNESS = 0;
var CANVAS_LINES_AND_STROKES_WIDTH = 8;
var CANVAS_SHADOW_BLUR = 3;
var BETS = [1, 5, 10, 25, 50, 100, 200, 300, 500];
var REELS_ANIM_FPS = 45;
var SYMBOLS_ANIM_FPS = 30;
var REELS_COUNT = 5;
var ROWS_COUNT = 3;
var SYMBOL_TYPES_COUNT = 8;
var REEL_BLUR_FRAMES_COUNT = 16;
var REEL_BLUR_ANIM_MIN_DURATION = 50;
var SYMBOL_W = 127;
var SYMBOL_H = 127;
var REEL_LEFT_MARGIN = 53;
var REEL_TOP_MARGIN = 13;
var REEL_BOTTOM_MARGIN = 13;
var SYMBOL_VERTICAL_MARGIN = 25;
var REEL_W = SYMBOL_W;
var REEL_H = (SYMBOL_H + SYMBOL_VERTICAL_MARGIN) * ROWS_COUNT - SYMBOL_VERTICAL_MARGIN + REEL_TOP_MARGIN + REEL_BOTTOM_MARGIN;
var BONUS_GAMES = [
    { symbol_id: 7, screen: "bonus_A" },
    { symbol_id: 8, screen: "bonus_B" }
];
var SAFE_WIDTH = 216;
var SAFE_FRAMES_AMOUNT = 16;
var SAFE_FPS = 15;
var LINES = [
    { vertexes: [0, 0, 0, 0, 0], color: "#fff100" },
    { vertexes: [1, 1, 1, 1, 1], color: "#00adee" },
    { vertexes: [2, 2, 2, 2, 2], color: "#bed63a" },
    { vertexes: [0, 1, 2, 1, 0], color: "#ab61a6" },
    { vertexes: [2, 1, 0, 1, 2], color: "#d91c5c" },
    { vertexes: [0, 1, 0, 1, 0], color: "#fff100" },
    { vertexes: [1, 0, 1, 0, 1], color: "#0099cc" },
    { vertexes: [1, 2, 1, 2, 1], color: "#e44044" },
    { vertexes: [2, 1, 2, 1, 2], color: "#ab61a6" }
];
var SYMBOLS_ANIM_FRAMES = [40, 52, 36, 25, 50, 50, 55, 38];
var SOUNDS_DATA = [
    {
        name: "background_sound",
        loop: true
    },
    {
        name: "bet_change_sound",
        multiplay: true
    },
    {
        name: "bonusA_start_sound"
    },
    {
        name: "bonusB_start_sound"
    },
    {
        name: "button_collect_sound"
    },
    {
        name: "button_double_sound"
    },
    {
        name: "button_game_sound"
    },
    {
        name: "button_lines_sound",
        multiplay: true
    },
    {
        name: "button_paytable_sound"
    },
    {
        name: "comb_symbol1_sound"
    },
    {
        name: "comb_symbol2_sound"
    },
    {
        name: "comb_symbol3_sound"
    },
    {
        name: "comb_symbol4_sound"
    },
    {
        name: "comb_symbol5_sound"
    },
    {
        name: "lines_all_sound",
        multiplay: true
    },
    {
        name: "reels_start_sound"
    },
    {
        name: "reels_stop3_sound"
    },
    {
        name: "reels_stop4_sound"
    },
    {
        name: "reels_stop5_sound"
    },
    {
        name: "autogame_end_sound",
        path: "../common/sounds/"
    },
    {
        name: "autogame_start_sound",
        path: "../common/sounds/"
    },
    {
        name: "autogame_stop_sound",
        path: "../common/sounds/"
    },
    {
        name: "autogame_window_change_sound",
        multiplay: true,
        path: "../common/sounds/"
    },
    {
        name: "autogame_window_exit_sound",
        path: "../common/sounds/"
    },
    {
        name: "autogame_window_open_sound",
        path: "../common/sounds/"
    },
    {
        name: "autogame_window_options_sound",
        multiplay: true,
        path: "../common/sounds/"
    }
];
var REELS_STOP_SOUNDS_ARR = ["reels_stop3_sound", "reels_stop4_sound", "reels_stop5_sound"];
var safeInterval;
var safe;
$(function() {
    _log(top._sessionData.game.name + ".main::_init()");
    savedState = top.flushSavedState(top._sessionData.game.name + ".main");
    gameData = null;
    isModuleLoaded = false;
    safe = $("#safe");
    reelsCanvas = $("#reels_canvas")[0];
    linesCanvas = $("#lines_canvas")[0];
    strokesCanvas = $("#strokes_canvas")[0];
    winningsCanvas = $("#winnings_canvas")[0];
    symbolsCoords = new Array();
    initEventHandlers();
    for (var i = 0; i < REELS_COUNT; i++) {
        symbolsCoords[i] = new Array();
        for (var j = 0; j < ROWS_COUNT; j++) {
            var symbolX = (SYMBOL_W + REEL_LEFT_MARGIN) * i;
            var symbolY = (SYMBOL_H + SYMBOL_VERTICAL_MARGIN) * j + REEL_TOP_MARGIN;
            symbolsCoords[i].push({ x: symbolX, y: symbolY });
        }
    }
    hideElements($("#skip_btn, #double_btn, #collect_btn, #stop_btn"));
    showElements($("#spin_btn, #autoplay_btn"));
    disableElements($("#spin_btn, #autoplay_btn, #paytable_btn, .line_btn, .selector .btn"));
    initStaticLangTexts();
    top.setResponseCallback(onServerResponse);
    if (!savedState) {
        var linesToSelect = LINES.length;
        for (var i = LINES.length; i > 1; i--) {
            if (BETS[DEFAULT_BET_INDEX] * i <= top._sessionData.user.cash) break;
            linesToSelect--;
        }
        selectLines(linesToSelect, false);
        selectBet(DEFAULT_BET_INDEX);
        top.doStart(top._sessionData.game.server_id);
        top.setHCModuleParams(top._sessionData.game.group + REELS_COUNT, REELS_COUNT, 1, 17);
    } else {
        _autoplayModule.autoplay_data = savedState.autoplay_data;
        gameData = savedState.game_data;
        selectLines(savedState.lines_selected, false);
        selectBet(BETS.indexOf(savedState.selected_bet));
        if (_autoplayModule.autoplay_data) {
            onUpdateAutoplay();
            hideElements($("#autoplay_btn"));
            showElements($("#stop_btn, #autoplay_tables"));
        }
        if (savedState._last_screen != "paytable") {
            gameData.status = top.openedModuleData.status;
            gameData.user_cash = top.openedModuleData.user_cash;
            gameData.user_free = top.openedModuleData.user_free;
            if (top.openedModuleData.win_cash !== undefined) {
                top.pushToGameLog({ total_win: (gameData.win_cash + top.openedModuleData.win_cash) / 100 });
            }
        }
    }
    $(window).trigger("load_images");
});
function initEventHandlers() {
    _log("DOCUMENT READY STATE > " + document.readyState);
    $(window).one("load_images", function() {
        var images = [
            "images/main_bg.jpg",
            "images/reel_symbols.png",
            "images/reels_tint.png",
            "images/main_titles.jpg",
            "images/assets.png"
        ];
        if (top._sessionData.user.games_anim) {
            images = images.concat([
                "images/main_reel_symbols_anim_1.jpg",
                "images/main_reel_symbols_anim_6.jpg",
                "images/main_reel_blur.jpg"
            ]);
        }
        loadImages(images, function(result) {
            loadedImages = result;
            loadSounds(SOUNDS_DATA, function() {
                isModuleLoaded = true;
                if (gameData) initModule();
            });
        });
    });
    $("#spin_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_game_sound");
        setVolume("background_sound", 1);
        if (winAnimInterval) stopWinAnim(false);
        else if (clearLinesCanvasTimeout) clearLinesCanvas();
        if (isFreegSpins) hideFreegPlate();
        doSpin();
        stopSafeAnim();
        disableElements($("#spin_btn, #autoplay_btn, #paytable_btn, .line_btn, .selector .btn"));
    });
    $("#skip_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_game_sound");
        stopSound("reels_start_sound"); // костыль
        stopReelsBlurAnim(true);
        disableElements($("#skip_btn"));
    });
    $("#double_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_double_sound");
        destroySound("background_sound");
        if (winAnimInterval) stopWinAnim(true);
        gameData.chang = null;
        gameData.win_lines = null;
        if (isFreegSpins) hideFreegPlate();
        top.openGameScreen(
            top._sessionData.game.name,
            top._sessionData.game.group,
            "chance",
            {
                lines_selected: linesSelected.length,
                selected_bet: selectedBet,
                game_data: gameData,
                autoplay_data: _autoplayModule.autoplay_data
            },
            {
                cash_bet: gameData.cash_bet
            }
        );
        disableElements($(".game_btn, .line_btn, .selector .btn"));
    });
    $("#collect_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_collect_sound");
        setVolume("background_sound", 1);
        if (winAnimInterval) stopWinAnim(true);
        top.doPlayChang(false);
        disableElements($("#double_btn, #collect_btn, #paytable_btn"));
        stopSafeAnim();
    });
    $("#autoplay_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("autogame_window_open_sound");
        if (winAnimInterval) stopWinAnim(true);
        _autoplayModule.showAutoplayWindow();
    });
    $("#stop_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("autogame_stop_sound");
        _autoplayModule.cancelAutoplay();
        disableElements($("#stop_btn"));
    });
    $("#paytable_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_paytable_sound");
        destroySound("background_sound");
        if (winAnimInterval) stopWinAnim(true);
        top.openGameScreen(
            top._sessionData.game.name,
            top._sessionData.game.group,
            "paytable",
            {
                lines_selected: linesSelected.length,
                selected_bet: selectedBet,
                game_data: gameData,
                autoplay_data: _autoplayModule.autoplay_data
            },
            {
                lines_selected: linesSelected.length,
                win_lines: (gameData && gameData.win_lines ? gameData.win_lines : null),
                disorder: gameData.disorder,
                special: gameData.special
            }
        );
        disableElements($(".game_btn, .line_btn, .selector .btn"));
    });
    $(".line_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_lines_sound");
        if (winAnimInterval) {
            stopWinAnim(true);
            $(".line_btn").css("opacity", "");
        }
        var lineID = $(this).data("line");
        selectLines(lineID, true);
        checkIsEnoughBalance();
    });
    $("#lines_selector").find(".minus_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_lines_sound");
        if (winAnimInterval) stopWinAnim(true);
        if (linesSelected.length > 1) selectLines(linesSelected.length - 1, true);
        else selectLines(LINES.length, true);
        checkIsEnoughBalance();
    });
    $("#lines_selector").find(".plus_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("button_lines_sound");
        if (winAnimInterval) stopWinAnim(true);
        if (linesSelected.length < LINES.length) selectLines(linesSelected.length + 1, true);
        else selectLines(1, true);
        checkIsEnoughBalance();
    });
    $("#lines_selector").find(".max_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("lines_all_sound");
        if (winAnimInterval) stopWinAnim(true);
        selectLines(LINES.length, true);
        checkIsEnoughBalance();
    });
    $("#bet_selector").find(".minus_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("bet_change_sound");
        if (winAnimInterval) stopWinAnim(true);
        var betIndex = BETS.indexOf(selectedBet);
        if (betIndex > 0) selectBet(betIndex - 1);
        else selectBet(BETS.length - 1);
        checkIsEnoughBalance();
    });
    $("#bet_selector").find(".plus_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("bet_change_sound");
        if (winAnimInterval) stopWinAnim(true);
        var betIndex = BETS.indexOf(selectedBet);
        if (betIndex < BETS.length - 1) selectBet(betIndex + 1);
        else selectBet(0);
        checkIsEnoughBalance();
    });
    $("#bet_selector").find(".max_btn").on(POINTER_EVENTS.click, function(e) {
        if ($(this).attr("disabled")) return;
        playSound("bet_change_sound");
        if (winAnimInterval) stopWinAnim(true);
        var tempLines = 0;
        var tempBetIndex = 0;
        var tempTotalBet = 0;
        for (var i = 0; i < BETS.length; i++) {
            for (var j = 0; j <= LINES.length; j++) {
                if (j * BETS[i] <= top._sessionData.user.cash && j * BETS[i] > tempTotalBet) {
                    tempTotalBet = j * BETS[i];
                    tempLines = j;
                    tempBetIndex = i;
                }
            }
        }
        if (tempTotalBet > 0) {
            selectLines(tempLines, true);
            selectBet(tempBetIndex);
            checkIsEnoughBalance();
        }
    });
    $("#gestures_area").on(POINTER_EVENTS.click, function() {
        $("#skip_btn").trigger(POINTER_EVENTS.click);
    });
    $("#gestures_area").swipe({
        swipe: function(event, direction, distance, duration, fingerCount) {
            isSwipeAction = true;
            switch (direction) {
                case "down":
                    if (gameData && gameData.status == "chang") {
                        gameData.swipe_auto_spin = true;
                        $("#collect_btn").trigger(POINTER_EVENTS.click);
                    } else $("#spin_btn").trigger(POINTER_EVENTS.click);
                    break;
                case "up":
                    if (gameData && gameData.status == "chang") $("#double_btn").trigger(POINTER_EVENTS.click);
                    break;
            }
        }
    });
}
function startSafeAnim() {
    _log(top._sessionData.game.name + ".main::startSafeAnim");
    var step = 0;
    safeInterval = setInterval(function() {
        step++;
        if (top._sessionData.user.games_anim || step == SAFE_FRAMES_AMOUNT - 1) {
            safe.css({ backgroundPosition: -SAFE_WIDTH * step + "px " + "0" });
        }
        if (step == SAFE_FRAMES_AMOUNT - 1) {
            clearInterval(safeInterval);
        }
    }, top._sessionData.user.games_anim ? 1000 / SAFE_FPS : 0);
}
function stopSafeAnim() {
    clearInterval(safeInterval);
    safe.css({ backgroundPosition: "0 0" });
}
function setState(state) {
    _log(top._sessionData.game.name + ".main::setState() state: " + state);
    switch (state) {
        case "bet" :
            if (_autoplayModule.autoplay_data) {
                _autoplayModule.checkAutoplay(gameData.win_cash, linesSelected.length, selectedBet);
            }
            if (!_autoplayModule.autoplay_data) {
                hideElements($("#skip_btn, #double_btn, #collect_btn"));
                showElements($("#spin_btn, #autoplay_btn"));
                enableElements($("#paytable_btn, .line_btn, .selector .btn"));
                checkIsEnoughBalance();
                onNewGameState();
            } else onNewGameState(true);
            break;
        case "chang" :
            if (_autoplayModule.autoplay_data) {
                _autoplayModule.checkAutoplay(gameData.win_cash, linesSelected.length, selectedBet, true);
            }
            if (!_autoplayModule.autoplay_data) {
                hideElements($("#spin_btn, #skip_btn, #autoplay_btn, #stop_btn"));
                showElements($("#double_btn, #collect_btn"));
                enableElements($("#collect_btn, #paytable_btn"));
                startSafeAnim();
            } else top.doPlayChang(false);
            break;
        case "bong":
            if (gameData.win_lines == null) startWinAnim("bong_anim");
            else if (_autoplayModule.autoplay_data) startWinAnim("lines_anim");
            if (!_autoplayModule.autoplay_data) {
                disableElements($("#skip_btn"));
                startSafeAnim();
            }
            break;
    }
    if (!_autoplayModule.autoplay_data) {
        if (gameData.win_lines != null) startWinAnim("lines_anim");
    }
}
function onResponseCommand_bet(status, data) {
    _log(top._sessionData.game.name + ".main::onResponseCommand_bet()");
    var reelsXML = data.find("reel");
    var usercashXML = data.find("usercash");
    var winsXML = data.find("win");
    gameData = new Object();
    gameData.status = status;
    gameData.symbols = new Array();
    gameData.win_cash = parseInt(data.find("game").attr("cash-win") || 0);
    gameData.cash_bet = parseInt(data.find("chang").attr("cash-bet") || 0);
    gameData.bong_id = parseInt(data.find("bong[action=start]").attr("id") || 1);
    reelsXML.each(function() {
        var reel = $(this).attr("symbols").split(",");
        $.each(reel, function(index, value) {
            reel[index] = parseInt(value);
        });
        gameData.symbols.push(reel);
    });
    if (winsXML.length) {
        gameData.win_lines = new Array();
        winsXML.each(function() {
            var winXML = $(this);
            var winLine = new Object();
            winLine.line = parseInt(winXML.attr("line"));
            winLine.cash = parseInt(winXML.attr("cash"));
            winLine.comb = parseInt(winXML.attr("comb"));
            winLine.comb_symbol = parseInt(winXML.attr("comb-symbol"));
            winLine.jokers = parseInt(winXML.attr("jokers"));
            winLine.layout = winXML.attr("layout").split("");
            $.each(winLine.layout, function(index, value) {
                winLine.layout[index] = parseInt(value);
            });
            gameData.win_lines.push(winLine);
        });
    } else gameData.win_lines = null;
    if (status == "chang") {
        gameData.chang = new Object();
    } else {
        gameData.chang = null;
    }
    if (status == "bet") {
        gameData.user_cash = parseInt(usercashXML.attr("real"));
        gameData.user_free = parseInt(usercashXML.attr("free"));
    } else {
        gameData.user_cash = top._sessionData.user.cash;
        gameData.user_free = top._sessionData.user.free;
    }
    startReelsBlurAnim();
}