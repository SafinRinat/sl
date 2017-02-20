"use strict"; //Strict JS Mode
var ENV_VARS = parseQuerySting(top.location.search);
var DEBUG = ENV_VARS["debug"];
var SERVER_ADDR = ENV_VARS["saddr"] !== undefined ? ENV_VARS["saddr"] : "193.105.200.32";
var WEBSOCKET_PORT = ENV_VARS["wsport"] !== undefined ? ENV_VARS["wsport"] : 8005;
var WEBSOCKET_SERVER_URL = "ws://" + SERVER_ADDR + ":" + WEBSOCKET_PORT;
var HTTP_SERVER_URL = "http://" + SERVER_ADDR + "/cgi/server.fcgi";
var CHAT_SERVER_ADDR = ENV_VARS["caddr"] !== undefined ? ENV_VARS["caddr"] : "webchat-services.com";
var CHAT_SERVER_URL = "http://" + CHAT_SERVER_ADDR + "/flash_proxy.php";
var AUTH_STAT_URL = "http://retarget.ssl-services.com/p/wv.php";
var ALL_STAT_URL = "https://get-only-stats.com/cashierstat.php";
var CASHIER_STAT_URL = ENV_VARS["saddr"] !== undefined ? "http://get-stat.test.lan/instat.php" : "http://get-stat.com/instat.php";
var BROKER_ID = "grand";
var BROKER_NAME = "Grand Casino";
var DEFAULT_SUPPORT_MAIL = "help@play.grand-casino.com";
var CASHIER_URL = ENV_VARS["curl"] !== undefined ? ENV_VARS["curl"] : "https://" + BROKER_ID + ".cashier.overcan.com";
var PRODUCTION_DOMAIN_PATTERN = /^(?:www\.)?(?:m|mobile)\.(.+)$/;
var ANDROID_APP_LINK = "http://emtetat.com/cl/grandcasino.apk";
var IS_TOUCH = isTouchDevice();
var POINTER_EVENTS = {
    press: IS_TOUCH ? "touchstart" : "mousedown",
    release: IS_TOUCH ? "touchend" : "mouseup",
    move: IS_TOUCH ? "touchmove" : "mousemove",
    leave: IS_TOUCH ? "touchleave" : "mouseleave",
    cancel: "touchcancel",
    click: "click"
};
var CURRENCY_SIGN = "$";
var DISABLED_ELEMENT_OPACITY = 0.45;
var USER_ICON_SPRITE_COLUMNS_COUNT = 5;
var USER_ICON_WIDTH = 74;
var USER_ICON_HEIGHT = 107;
var CARD_SPRITE_COLUMNS_COUNT = 13;
var MIN_FUN_BALANCE_ALERT = 100;
var DOUBLE_CLICK_TIMEOUT = 300;
var MOVE_GESTURE_DETECTION_DELAY = 100;
var PRELOADER_INIT_DELAY = 250;
var DEFERRED_RUN_TIMEOUT = 1;
var FIRST_CONNECTION_TIMEOUT = 10000;
var CONNECTION_TIMEOUT = 30000;
var RECONNECT_TIMEOUT = 5000;
var PING_INTERVAL = 30000;
var CHAT_PING_INTERVAL = 10000;
var CHAT_RECONNECT_TIMEOUT = 10000;
var LAYOUT_REDRAW_DELAY = 200;
var CHAT_HISTORY_MAX_LENGTH = 50;
var TYPE_BOOL = 1;
var TYPE_INTEGER = 2;
var TYPE_TEXT = 3;
var SWIPE_TRESHHOLD = 60;
var SWIPE_CLIERANCE = 20;
var MAX_FIO_CHARS = 100;
var highestZDepth = null;
var userDataProperty = {
    balance_blocked: TYPE_INTEGER,
    bonusoff: TYPE_INTEGER,
    cash: TYPE_INTEGER,
    country: TYPE_INTEGER,
    date: TYPE_TEXT,
    email: TYPE_TEXT,
    firsttime: TYPE_INTEGER,
    free: TYPE_INTEGER,
    game: TYPE_TEXT,
    icon: TYPE_INTEGER,
    id: TYPE_INTEGER,
    lang: TYPE_INTEGER,
    login: TYPE_TEXT,
    made_deposit: TYPE_INTEGER,
    nick: TYPE_TEXT,
    passwd: TYPE_TEXT,
    paymentgate_id: TYPE_INTEGER,
    phone: TYPE_TEXT,
    sex: TYPE_TEXT,
    test: TYPE_INTEGER,
    type: TYPE_TEXT,
    validmail: TYPE_INTEGER,
    validmailbonus: TYPE_INTEGER,
    is_fun_bonus_active: TYPE_INTEGER
};
var userDataAdditionalProperty = {
    lang_cards: TYPE_INTEGER,
    lang_game: TYPE_INTEGER,
    lang_table: TYPE_INTEGER,
    show_all: TYPE_INTEGER,
    status: TYPE_TEXT,
    fio: TYPE_TEXT
};
if (location.hostname.match("^(?:www\.)?m.grand-casino.mobi$")) {
    (function(i, s, o, g, r, a, m) {
        i["GoogleAnalyticsObject"] = r;
        i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
    ga("create", "UA-74946441-1", "auto");
    ga("send", "pageview");
}
$.extend($.event.special, {
    doubletap: {
        bindType: POINTER_EVENTS.release,
        delegateType: POINTER_EVENTS.release,
        handle: function(event) {
            var handleObj = event.handleObj;
            var targetData = $.data(event.target);
            var now = new Date().getTime();
            var delta = targetData.lastTouch ? now - targetData.lastTouch : 0;
            var delay = delay == null ? 300 : delay;
            if (delta < delay && delta > 30) {
                targetData.lastTouch = null;
                event.type = handleObj.origType;
                ["clientX", "clientY", "pageX", "pageY"].forEach(function(property) {
                    event[property] = event.originalEvent.changedTouches[0][property];
                });
                handleObj.handler.apply(this, arguments);
            } else {
                targetData.lastTouch = now;
            }
        }
    }
});
$.extend($.fn, {
    simpleSwipe: function(callback) {
        return $(this).on(POINTER_EVENTS.press, function(event) {
            event.target._touchStart = {
                x: IS_TOUCH ? event.originalEvent.touches[0].screenX : event.originalEvent.screenX,
                y: IS_TOUCH ? event.originalEvent.touches[0].screenY : event.originalEvent.screenY
            }
        }).on(POINTER_EVENTS.move, function(event) {
            var directions;
            if (event.target._touchStart) {
                var distanceX = event.target._touchStart.x - (IS_TOUCH ? event.originalEvent.touches[0].screenX : event.originalEvent.screenX);
                var distanceY = event.target._touchStart.y - (IS_TOUCH ? event.originalEvent.touches[0].screenY : event.originalEvent.screenY);
                var absoluteX = distanceX > 0 ? distanceX : -distanceX;
                var absoluteY = distanceY > 0 ? distanceY : -distanceY;
                if (absoluteX > absoluteY && absoluteX > SWIPE_TRESHHOLD && absoluteY < SWIPE_CLIERANCE) {
                    directions = distanceX > 0 ? "left" : "right";
                }
                if (absoluteX < absoluteY && absoluteY > SWIPE_TRESHHOLD && absoluteX < SWIPE_CLIERANCE) {
                    directions = distanceY > 0 ? "up" : "down";
                }
                if (directions) {
                    event.target._touchStart = null;
                    callback.call(this, event, directions);
                }
            }
        });
    }
});
$(function() {
    highestZDepth = 0;
    setupAjax();
    $(document.body).on("touchstart", function() { });
    $(window).on("popstate", function() {
        _log("Popstate event fired");
        history.pushState(null, top.document.title);
    }).on("error", function(e) {
        if (!DEBUG || !e.originalEvent.filename) return;
        var errorFile = e.originalEvent.filename.split("/");
        errorFile = errorFile[errorFile.length - 1];
        var errorText = [];
        errorText.push("Time: " + formatDate(new Date(), "d.m.Y h:i:s"));
        errorText.push("BrokerID: " + BROKER_ID);
        errorText.push("UserAgent: " + navigator.userAgent);
        if (top._sessionData.user && top._sessionData.user.login) {
            errorText.push("UserLogin: " + top._sessionData.user.login);
            errorText.push("UserID: " + top._sessionData.user.id);
            errorText.push(
                "UserBalance: " +
                getBalanceString(top._sessionData.user.cash, top._sessionData.user.free, top._sessionData.user.type)
            );
        } else errorText.push("User: Not authorized");
        errorText.push(
            "Module: " +
            top.openedModuleData._context.name +
            "." +
            top.openedModuleData._context.screen
        );
        if (top.openedModuleData._context.name != "lobby" && top.hcModuleData) {
            errorText.push("HCPub: " + top.hcModuleData.issue);
            errorText.push("HCGame: " + top.hcModuleData.copy);
        }
        errorText.push("File: " + errorFile + ":" + e.originalEvent.lineno);
        errorText.push("Message: " + e.originalEvent.message);
        var supportMailHref = "mailto:" +
            DEFAULT_SUPPORT_MAIL +
            "?subject=" +
            encodeURIComponent("Mobile Casino Error") +
            "&body=" +
            encodeURIComponent(errorText.join("\n").replace(/'/g, "\""));
        _log(
            "ERROR:\n" + errorText.join("\n"),
            "error"
        );
        top.showMessage(
            top._langData["codeError"] +
            "<br><br><a href='" +
            supportMailHref +
            "' target='_blank'>" +
            top._langData["sendToSupport"] +
            "</a><br><br>",
            true
        );
        return true;
    });
    document.title = BROKER_NAME;
    history.pushState(null, top.document.title);
});
CanvasRenderingContext2D.prototype.roundedRect = function(x, y, width, height, radius) {
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
};
CanvasRenderingContext2D.prototype.pieCircle = function(x, y, radius, cutAngle, isInverted) {
    var circleStartAngle = Math.PI * 1.5;
    cutAngle = Math.PI / 180 * cutAngle;
    this.beginPath();
    this.moveTo(x, y);
    if (isInverted) {
        this.lineTo(x, y - radius);
        this.arc(x, y, radius, circleStartAngle, circleStartAngle + cutAngle, false);
    } else {
        this.arc(x, y, radius, circleStartAngle + cutAngle, circleStartAngle, false);
        this.lineTo(x, y);
    }
};
function _log(data, type) {
    if (ENV_VARS.console) {
        switch (type) {
            case "main_protocol":
                console.groupCollapsed("MAIN PROTOCOL");
                console.log(formatXmlString(data));
                console.groupEnd();
                break;
            case "chat_protocol":
                console.groupCollapsed("CHAT PROTOCOL");
                console.log(formatXmlString(data));
                console.groupEnd();
                break;
            case "info":
                console.info(data);
                break;
            case "warn":
                console.warn(data);
                break;
            case "error":
                console.error(data);
                break;
            default:
                console.log(data);
                break;
        }
    }
    if (!DEBUG || !top.writeToDebugLog) return;
    var colors = {
        main_protocol: "#82fe58",
        chat_protocol: "#58fef8",
        error: "#ff7157",
        warn: "#fff357",
        info: "#57b8ff",
        log: "#ffffff"
    };
    switch (type) {
        case "main_protocol":
            top.writeToDebugLog(
                "<span style='color: " + colors["main_protocol"] + "'>\n" +
                formatXmlString(data, true) +
                "</span>",
                type
            );
            break;
        case "chat_protocol":
            top.writeToDebugLog(
                "<span style='color: " + colors["chat_protocol"] + "'>\n" +
                formatXmlString(data, true) +
                "</span>",
                type
            );
            break;
        default:
            var flag = typeof data == "object";
            if (flag) {
                try {
                    data = JSON.stringify(data, null, 4);
                } catch (e) {
                    top.writeToDebugLog("<span style='color: " + colors.error + "'>" +
                        "LOG > " +
                        e +
                        "; See detailed object explanation in console"
                        + "</span>",
                        type
                    );
                    console.log(data);
                    return;
                }
            }
            top.writeToDebugLog(
                "<span style='color: " + (colors[type] || (flag ? colors.info : colors.log)) + "'>" +
                (flag ? "\n" : "") +
                data +
                "</span>",
                type
            );
    }
}
function _debug(data) {
    var time = new Date();
    _log(data, "error");
    console.error("[%s]: %o", time.getSeconds() + ":" + time.getMilliseconds(), data);
}
function initStaticLangTexts(elem) {
    (elem || $("body")).find("*[data-lang_id]").each(function(i, el) {
        el.innerHTML = top._langData[el.getAttribute("data-lang_id")];
    });
    $("html").attr("lang", top._langData.$lang);
}
function setupAjax() {
    _log("common::setupAjax()");
    $.ajaxSetup({
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                _log("Ajax ERROR: Not connect.\n Verify Network.", "warn");
            } else if (jqXHR.status == 404) {
                _log("Ajax ERROR: Requested page not found. [404]", "warn");
            } else if (jqXHR.status == 500) {
                _log("Ajax ERROR: Internal Server Error [500].", "warn");
            } else if (exception === "parsererror") {
                _log("Ajax ERROR: Parse failed.", "warn");
            } else if (exception === "timeout") {
                _log("Ajax ERROR: Timeout error.", "warn");
            } else if (exception === "abort") {
                _log("Ajax ERROR: Ajax request aborted.", "warn");
            } else {
                _log("Ajax ERROR: Uncaught Error.\n" + jqXHR.responseText, "warn");
            }
        }
    });
}
function isTouchDevice() {
    return !!("ontouchstart" in window);
}
function isWebKitBrowser() {
    return !!(navigator.userAgent.match(/WebKit/i));
}
function isStandaloneWebApp() {
    return "standalone" in navigator && navigator.standalone;
}
function getPlatform() {
    //Очень важен порядок, в котором идут системы, т. к. Android, например, содержит и Android и Linux
    var platforms = [
        ["j2me", /J2ME/i],
        ["symbian", /Symbian|SymbOS|Series\s?\d\d/i],
        ["winphone", /Windows Phone/i],
        ["android", /Android/i],
        ["blackberry", /BlackBerry|RIM Tablet OS|BB\d\d/i],
        ["ios", /iPhone|iPad|iPod/i],
        ["windows", /Windows/i],
        ["linux", /Linux|X11/i],
        ["macos", /Macintosh|Mac OS/i]
    ];
    for (var i = 0; i < platforms.length; i++) {
        var pair = platforms[i];
        if (navigator.userAgent.match(pair[1])) return pair[0];
    }
    return null;
}
function getBrowser() {
    //Очень важен порядок, в котором идут браузеры, т.к. Сhrome, например, содержится чуть менее чем везде
    var browsers = [
        ["ie", /IEMobile|Trident/i],
        ["firefox", /Firefox|FxiOS/i],
        ["uc", /UCBrowser/i],
        ["puffin", /Puffin/i],
        ["nokia", /NokiaBrowser/i],
        ["baidu", /bdbrowser/i],
        ["maxthon", /MxBrowser/i],
        ["cheetah", /ACHEETAHI/i],
        ["yandex", /YaBrowser/i],
        ["opera", /Opera|OPR|OPiOS|Coast/i],
        ["chrome", /Chrome|CriOS/i],
        ["aosp", /Android/i],
        ["safari", /iPhone|iPad|iPod/i]
    ];
    for (var i = 0; i < browsers.length; i++) {
        var pair = browsers[i];
        if (navigator.userAgent.match(pair[1])) return pair[0];
    }
    return null;
}
function getZDepth(zLayerDepth) {
    //TODO Костыль для Android Browser :(
    //Cтандартный браузер ведроида не понимает глубину (z) больше 1000px или около того
    highestZDepth++;
    return highestZDepth * (getBrowser() == "aosp" ? 1 : zLayerDepth);
}
function getCssTransformProperty() {
    if ("webkitTransform" in top.document.body.style) return "webkitTransform";
    else if ("MozTransform" in top.document.body.style) return "MozTransform";
    return "transform";
}
function getMoneyString(money) {
    var dollars = Math.floor(money / 100);
    var cents = money - dollars * 100;
    var moneyString = dollars + ".";
    if (cents < 10) moneyString += "0" + cents;
    else moneyString += cents;
    return moneyString;
}
function getBalanceString(cash, free, type) {
    if (type == "real") {
        if (cash - free > 0) return getMoneyString(cash - free) + CURRENCY_SIGN + " " + getMoneyString(free) + " bon";
        else return getMoneyString(0) + CURRENCY_SIGN + " " + getMoneyString(cash) + " bon";
    } else return getMoneyString(cash) + " fun";
}
function setUserBalance(cash, free) {
    _log("common::setUserBalance() [REAL: " + cash + ", FUN: " + free + "]");
    top._sessionData.user.cash = cash;
    top._sessionData.user.free = free;
    if (free > cash) free = cash;
    if (top._sessionData.user.type === "real") {
        $(".user_balance").text(((cash - free) / 100).toFixed(2));
        $(".user_bonus").text((free / 100).toFixed(2));
        top.$(".user_balance").text(((cash - free) / 100).toFixed(2));
        top.$(".user_bonus").text((free / 100).toFixed(2));
    } else {
        $(".user_fun_balance").text((cash / 100).toFixed(2));
        top.$(".user_fun_balance").text((cash / 100).toFixed(2));
    }
}
function storageValue(key, val) {
    try {
        if (val === null) return localStorage.removeItem(key);
        if (val !== undefined) return localStorage.setItem(key, val);
        return localStorage.getItem(key);
    } catch (e) {
        _log("Cannot access Local Storage", "error");
        return null;
    }
}
function cookieValue(key, val, exp) {
    if (val !== undefined) {
        var expDate = new Date();
        if (val === null) exp = 0;
        else exp = isNaN(parseInt(exp)) ? null : expDate.getTime() + exp;
        expDate.setTime(exp);
        document.cookie = key + "=" + encodeURIComponent(val) +
            "; path=/" +
            (exp === null ? "" : "; expires=" + expDate.toUTCString());
        return true;
    }
    var cname = key + "=";
    var pairs = document.cookie.split(";");
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        while (pair.charAt(0) == " ") pair = pair.substring(1);
        if (pair.indexOf(cname) == 0) return decodeURIComponent(pair.substring(cname.length, pair.length));
    }
    return null;
}
function changeUserBalance(money) {
    _log("games.common::changeUserBalance() money: " + money);
    top._sessionData.user.cash += money;
    setUserBalance(top._sessionData.user.cash, top._sessionData.user.free);
    $(window).trigger("user_balance_change");
}
function createXML(object) {
    _log("common::createXML()", "error");
    function node(parent, obj) {
        var el = $("<" + obj.name + "/>", { attr: obj.attr, text: obj.text });
        parent && parent.append(el);
        $.each(obj.child || [], function(i, opt) { node(el, opt); });
        return el;
    }

    return node(null, object);
}
function loadImages(images, completeCallback, progressCallback) {
    _log("common::loadImages()");
    _log(images);
    var imagesLoaded = 0;
    var result = new Array();

    function loadImage(imgSrc) {
        var img = $(document.createElement("img"));
        img.attr("src", imgSrc);
        result[imgSrc] = img[0];
        if (img[0].complete || img[0].readyState == 4) {
            _log("-> loadImages > " + imgSrc + " [FETCHED FROM CACHE]", "info");
            imagesLoaded++;
            if (progressCallback) progressCallback(imagesLoaded / images.length);
            if (completeCallback && imagesLoaded == images.length) completeCallback(result);
        } else {
            img.one("load", function(e) {
                _log("-> loadImages > " + $(this).attr("src") + " [LOADED]", "info");
                imagesLoaded++;
                if (progressCallback) progressCallback(imagesLoaded / images.length);
                if (completeCallback && imagesLoaded == images.length) completeCallback(result);
            });
        }
    }

    images.forEach(function(elem) {
        loadImage(elem);
    });
}
function loadSounds(data, callback) {
    _log("common::loadSounds()");
    /*
     При необходимости (возможно в дальнейшем), не надо будет грузить звуки для игры.
     Предпологаю два варианта:
     1) Звук будет выключаться кнопкой в игре, аля флеш, тогда звуки грузить надо по любому
     2) В настройках игрока будет возможность выключение звука, тогда просто, проверка if (isSoundsDisabeld) {callback; return;}
     без инициализации плагина.
     */
    // return callback(); // sounds off
    ion.sound({
        sounds: data,
        volume: 1,
        path: "sounds/",
        preload: true,
        ready_callback: soundLoaded
    });
    var soundsLoaded = 0;

    function soundLoaded(e) {
        soundsLoaded++;
        _log("common::soundLoaded() soundsLoaded = " + soundsLoaded + " name = " + e.name);
        if (soundsLoaded == data.length) {
            callback();
            document.addEventListener("visibilitychange", visibilityChangeHandler);
        }
    }
}
function playSound(sound) {
    _log("common::playSound() sound = " + sound);
    // влепим проверку на необходимость воспроизводить звук, если это в дальнейшем будет задумано по ТЗ
    if ($.ionSound) $.ionSound.play(sound);
}
function stopSound(sound) {
    _log("common::stopSound() sound = " + sound);
    if ($.ionSound) $.ionSound.stop(sound);
}
function destroySound(sound) {
    _log("common::destroySound() sound = " + sound);
    if ($.ionSound) $.ionSound.destroy(sound);
}
function destroyAllSounds() {
    _log("common::destroyAllSounds()");
    if ($.ionSound) $.ionSound.destroy();
}
function setVolume(soundName, volume) {
    _log("common::setVolume() soundName = " + soundName);
    if ($.ionSound) $.ionSound.volume(soundName, { volume: volume });
}
function startBGSound() {
    _log("common::startBGSound()");
    //Костыль для UC Browser-a , не воспроизводяться длинные звуки
    if (getBrowser() == "uc") return;
    playSound("background_sound");
}
function visibilityChangeHandler() {
    _log("common::visibilityChangeHandler()");
    if ($.ionSound) {
        if (document.hidden) $.ionSound.volume(false, { volume: 0 });
        else $.ionSound.volume(false, { volume: 1 });
    }
}
function clearZDepth() {
    _log("common::clearZDepth()");
    highestZDepth = 0;
}
function swapElementsZIndex(elemA, elemB) {
    elemA.css("zIndex", getZDepth(1));
    elemB.css("zIndex", getZDepth(1));
}
function disableElements() {
    var opacity = DISABLED_ELEMENT_OPACITY;
    for (var i = 0; i < arguments.length; i++) {
        if (i == 0 && typeof arguments[i] == "number") {
            opacity = arguments[i];
            continue;
        }
        arguments[i]
            .css("opacity", opacity)
            .attr("disabled", "disabled");
    }
}
function enableElements() {
    for (var i = 0; i < arguments.length; i++) {
        arguments[i].css("opacity", "").removeAttr("disabled");
    }
}
function showElements() {
    for (var i = 0; i < arguments.length; i++) {
        arguments[i].css({ "opacity": "", "display": "block" }).removeAttr("disabled");
    }
}
function hideElements() {
    for (var i = 0; i < arguments.length; i++) {
        var elem = arguments[i];
        elem.attr("disabled", "disabled").hide();
    }
}
function increaseColorBrightness(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, "");
    if (hex.length == 3) hex = hex.replace(/(.)/g, "$1$1");
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    return "#" +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
function transliterate(text) {
    var rus = [
        "щ", "ш", "ч", "ц", "ю", "я", "ё", "ж", "ъ", "ы",
        "э", "а", "б", "в", "г", "д", "е", "з", "и", "й",
        "к", "л", "м", "н", "о", "п", "р", "с", "т", "у",
        "ф", "х", "ь", " ", "[^\\w\\d]"
    ];
    var eng = [
        "shh", "sh", "ch", "cz", "yu", "ya", "yo", "zh", "", "y",
        "e", "a", "b", "v", "g", "d", "e", "z", "i", "j",
        "k", "l", "m", "n", "o", "p", "r", "s", "t", "u",
        "f", "x", "", "_", "_"
    ];
    text = text.toLowerCase();
    for (var x = 0; x < rus.length; x++) {
        text = text.replace(new RegExp(rus[x], "g"), eng[x]);
    }
    return text;
}
function replaceHTMLEntities(str) {
    var htmlEntities = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
    var newStr = str;
    for (var i in htmlEntities) {
        newStr = newStr.replace(new RegExp(i, "gi"), htmlEntities[i]);
    }
    return newStr;
}
function formatDate(date, format, shift) {
    var y, m, d, h, i, s;
    if (shift) date.setTime(date.getTime() + shift);
    y = date.getFullYear().toString();
    m = (date.getMonth() + 1).toString();
    d = date.getDate().toString();
    h = date.getHours().toString();
    i = date.getMinutes().toString();
    s = date.getSeconds().toString();
    return format ? format
            .replace("Y", y)
            .replace("y", "" + y[2] + y[3])
            .replace("m", m[1] ? m : "0" + m[0])
            .replace("d", d[1] ? d : "0" + d[0])
            .replace("h", h[1] ? h : "0" + h[0])
            .replace("i", i[1] ? i : "0" + i[0])
            .replace("s", s[1] ? s : "0" + s[0])
        : date;
}
function formatXmlString(xml, isReplaceAllEntities) {
    var formattedXML = "";
    xml = xml.replace(/<!\[CDATA\[(.*?)\]\]>/gm, function(str, p1) {
        return "<![CDATA[" + replaceHTMLEntities(p1) + "]]>";
    });
    xml = xml.replace(/(>)[\r\n\s]*(<)(\/*)/gm, "$1\r\n$2$3");
    xml = xml.replace(/"\s{2,}(\w)/g, "\" $1");
    var pad = 0;
    var nodes = xml.split("\r\n");
    var nextNode = null;
    var newString = "";
    $.each(nodes, function(index, node) {
        var indent = 0;
        var padding = "";
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad != 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }
        if (newString != "") {
            for (var i = 0; i < pad; i++) {
                padding += "  ";
            }
        }
        newString = "\r\n";
        nextNode = index < nodes.length - 1 ? nodes[index + 1] : null;
        if (nextNode != null && node.match(/^<(\w*)[^\/]*>$/) && nextNode.match(/^<\/\w/)) {
            var nodeName = (/^<(\w*)[^\/]*>$/).exec(node)[1];
            var nextNodeName = (/^<\/(\w*)>/).exec(nextNode)[1];
            if (nodeName == nextNodeName) newString = "";
        }
        formattedXML += padding + node + (index == nodes.length - 1 ? "" : newString);
        pad += indent;
    });
    return isReplaceAllEntities ? replaceHTMLEntities(formattedXML) : formattedXML;
}
function parseQuerySting(query) {
    var envVars = {};
    var temp;
    var pair;
    if (query) {
        temp = query.toLowerCase().replace(/^\?/, "").split("&");
        for (var i = 0; i < temp.length; i++) {
            pair = temp[i].split("=");
            envVars[pair[0]] = pair[1] ? decodeURIComponent(pair[1]) : true;
        }
    }
    return envVars;
}
function objectToQueryString(obj) {
    var result = "";
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            result += (!obj[prop] ? "" : ((result ? "&" : "") + prop + (obj[prop] === true ? "" : ("=" + encodeURIComponent(obj[prop])))));
        }
    }
    return result;
}
function searchInArrayOn(prop, value, arr) {
    for (var i in arr) {
        if (arr[i][prop] !== undefined && arr[i][prop] == value) return arr[i];
    }
    return null;
}
function sortArrayOn(prop, arr) {
    arr.sort(function(a, b) {
        return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
    });
}
function restrictObject(targetObj, restrictObj) {
    for (var prop in targetObj) {
        if (!(prop in restrictObj)) delete targetObj[prop];
    }
    return targetObj;
}
function extendObjects(obj) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i]) {
            for (var prop in arguments[i]) {
                obj[prop] = arguments[i][prop];
            }
        }
    }
    return obj;
}
function shuffleArray(arr) {
    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}
function encodeURIComponent_CP1251(str, rev) {
    str = str || "";
    //TODO Костыль. По хорешему сервер должен принимать UTF8 URL Encoded строку :(
    var lit = [
        "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х",
        "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я", "а", "б", "в", "г", "д", "е", "ж", "з", "и", "й", "к", "л",
        "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я", "_", "-",
        "@", "\\.", "Ё", "ё"
    ];
    var win = [
        "%C0", "%C1", "%C2", "%C3", "%C4", "%C5", "%C6", "%C7", "%C8", "%C9", "%CA", "%CB", "%CC", "%CD", "%CE", "%CF",
        "%D0", "%D1", "%D2", "%D3", "%D4", "%D5", "%D6", "%D7", "%D8", "%D9", "%DA", "%DB", "%DC", "%DD", "%DE", "%DF",
        "%E0", "%E1", "%E2", "%E3", "%E4", "%E5", "%E6", "%E7", "%E8", "%E9", "%EA", "%EB", "%EC", "%ED", "%EE", "%EF",
        "%F0", "%F1", "%F2", "%F3", "%F4", "%F5", "%F6", "%F7", "%F8", "%F9", "%FA", "%FB", "%FC", "%FD", "%FE", "%FF",
        "%5F", "%2D", "%40", "%2E", "%A8", "%B8"
    ];
    for (var i = 0; i < win.length; i++) {
        str = str.replace(new RegExp(rev ? win[i] : lit[i], "g"), rev ? lit[i] : win[i])
    }
    return str;
}
function redrawElementHack(element) {
    //TODO Костыль :(
    //Принуждает браузер перерисовать элемент
    element = $(element);
    element.css({ visibility: "hidden" });
    element[0].offsetHeight;
    element.css({ visibility: "" });
}
function fixedPosHack(element) {
    //TODO Костыль для Safari :(
    //Принуждает браузер перерисовать fixed элемент
    element.css({ position: "absolute" });
    setTimeout(function() {
        element.css({ position: "fixed" });
    }, 0);
}
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function groupBy(source, prop) {
    var result = {};
    source.forEach(function(obj) {
        if (!result[obj[prop]]) {
            result[obj[prop]] = [];
        }
        result[obj[prop]].push(obj);
    });
    return result;
}
function onNewGameState(dontEnableLobby) {
    _log("common::onNewGameState()");
    if (!dontEnableLobby) {
        top.enableLobbyPanel();
    }
    if (top.hcModuleData) {
        top.updateHCModuleInfo();
    }
    if (top._sessionData.user.type == "fun" && top._sessionData.user.cash < MIN_FUN_BALANCE_ALERT) {
        top.showMessage(top._langData.funLittleMoney, true);
    }
    top.calculationGameProfit();
}
function stringReplace(string, params) {
    return string.replace(/\$\{([\s\S]+?)\}/g, function(match, match2) {
        match2 = match2.trim();
        return params[match2] != null ? params[match2] : "";
    });
}
function parseUserXML(xml, xml2) {
    var result = {};
    var prop;
    for (prop in userDataProperty) {
        if (xml.attr(prop) != null) {
            result[prop] = userDataProperty[prop] === TYPE_INTEGER ?
                parseInt(xml.attr(prop)) : xml.attr(prop);
        }
    }
    for (prop in userDataAdditionalProperty) {
        if (xml2.attr(prop) != null) {
            result[prop] = userDataAdditionalProperty[prop] === TYPE_INTEGER ?
                parseInt(xml2.attr(prop)) : xml2.attr(prop);
        }
    }
    if (result.fio) {
        result.fio = result.fio.slice(0, MAX_FIO_CHARS);
    }
    return result;
}
function onServerResponse(command, status, _data) {
    _log("common::onServerResponse() command: " + command + "; status: " + status);
    var data = $(_data);
    var sampleXML = data.find("sample");
    var setInfoXML = data.find("set_info");
    var moneyInXML = data.find("money[type='in']");
    var moneyOutXML = data.find("money[type='out']");
    var serverExit = data.find("server[command='exit']");
    var usercashXML = data.find("usercash");
    var pendingMoneyXML = data.find("pending_money");
    var payoutXML = data.find("payout");
    var isNoExitFlag = false;
    if (sampleXML.length) {
        top.hcModuleData.issue = parseInt(sampleXML.attr("issue"));
        top.hcModuleData.copy = parseInt(sampleXML.attr("copy"));
        top.hcModuleData.expired = sampleXML.attr("expired");
        top.updateHCModuleInfo();
    }
    if (setInfoXML.length) {
        var user = parseUserXML(data.find("user"), data.find("user_additional"));
        var isTypeChanged = user.type !== top._sessionData.user.type;
        extendObjects(top._sessionData.user, user);
        if (isTypeChanged) {
            if (top.openedModuleData._context.name == "lobby") {
                if (user.type) {
                    top.showMessage(user.type == "real" ? top._langData.enterReal : top._langData.enterFun, true);
                }
                setLobbyContent();
            } else {
                isNoExitFlag = true;
                top.showPreloader();
                top.doLeave();
            }
        }
        setUserBalance(top._sessionData.user.cash, top._sessionData.user.free);
    }
    if (moneyInXML.length) {
        var cash = 0;
        var bonus = 0;
        top._sessionData.user.is_fun_bonus_active = 0;
        moneyInXML.each(function() {
            var moneyIn = $(this);
            bonus = parseInt(moneyIn.attr("free"));
            cash = parseInt(moneyIn.attr("cash"));
            if (moneyIn.attr("is_fun_bonus_active")) {
                top._sessionData.user.is_fun_bonus_active = parseInt(moneyIn.attr("is_fun_bonus_active"));
            }
        });
        if (command == "register") {
            var userEmail = data.find("user").attr("email");
            var regCongratulationText = userEmail.length ? top._langData.congratulationRegistrationWithMailConfirm
                    .replace("#val_0#", BROKER_NAME)
                    .replace("#val_1#", userEmail) :
                top._langData.congratulationRegistration;
            top.showMessage(
                regCongratulationText,
                function() {
                    top.showMessage(
                        top._langData.moneyTransferFun.replace("#val_0#", getMoneyString(cash) + " FUN"),
                        true
                    );
                }
            );
        } else {
            if (moneyInXML.attr("system") == "FunChips") {
                top.showMessage(
                    top._langData.moneyTransferFun.replace("#val_0#", getMoneyString(cash) + " FUN"),
                    true
                );
            } else {
                if (top._sessionData.user.type == "fun") {
                    top._sessionData.user.type = "real";
                    if (top.openedModuleData._context.name != "lobby") {
                        if (serverExit.length) {
                            if (command != "leave") {
                                isNoExitFlag = true;
                                var exitFromGame = function() {
                                    top.showPreloader();
                                    top.doLeave();
                                };
                            }
                        }
                    } else {
                        setLobbyContent();
                        var returnToGame = function() {
                            var game = JSON.parse(storageValue("last_game"));
                            var gameName = top._langData["game_" + game.name] + (game.group === "roulettes" ? " " + top._langData.roulete : "");
                            storageValue("last_game", null);
                            top.showMessage(
                                top._langData.msgReturnToGame.replace("#val_0#", gameName),
                                function() {
                                    top._sessionData.game = game;
                                    top.showPreloader(gameName, true);
                                    top.doLeave();
                                },
                                true
                            );
                        }
                        var changeMoneyType = function() {
                            top.showMessage(
                                top._sessionData.user.type == "real" ? top._langData.enterReal : top._langData.enterFun,
                                (command == "add_fun_bonus" && storageValue("last_game")) ? returnToGame : true
                            );
                        };
                    }
                }
                if (cash > bonus && bonus > 0) {
                    top.showMessage(
                        top._langData.moneyTransferBonus
                            .replace("#val_0#", getMoneyString(cash - bonus) + CURRENCY_SIGN)
                            .replace("#val_1#", getMoneyString(bonus)),
                        exitFromGame ? exitFromGame : (changeMoneyType ? changeMoneyType : true)
                    );
                } else {
                    top.showMessage(
                        top._langData.moneyTransfer.replace("#val_0#", getMoneyString(cash) + ((bonus > 0) ? " bon" : CURRENCY_SIGN)),
                        exitFromGame ? exitFromGame : (changeMoneyType ? changeMoneyType : true)
                    );
                }
            }
        }
    } else {
        if (usercashXML.length && top.openedModuleData._context.name == "lobby") {
            if (top._sessionData.user.type && usercashXML.attr("type") && top._sessionData.user.type != usercashXML.attr("type")) {
                top._sessionData.user.type = usercashXML.attr("type");
                setLobbyContent();
                top.showMessage(top._sessionData.user.type == "real" ? top._langData.enterReal : top._langData.enterFun, true);
            }
            setUserBalance(
                parseInt(usercashXML.attr("real")) || top._sessionData.user.cash,
                parseInt(usercashXML.attr("free")) || top._sessionData.user.free
            );
        }
    }
    if (moneyInXML.length || moneyOutXML.length || command === "leave" || command === "casher") {
        setUserBalance(
            parseInt(usercashXML.attr("real")) || top._sessionData.user.cash,
            parseInt(usercashXML.attr("free")) || top._sessionData.user.free
        );
    }
    if (top._sessionData.user.validmail === 1 && $("#settings_form_email").length) {
        $("#settings_form_email").parent().addClass("email_confirmed");
    } else {
        $("#settings_form_email").parent().removeClass("email_confirmed");
    }
    if (status == "freeg") top.setCalculationState(false);
    if (command == "bet" || (command == "game" && (status == "chang" || status == "game" || status == "bet"))) {
        var gameXML = data.find("game[cash-win]");
        if (gameXML.length) top.rewriteGameWin(parseInt(gameXML.attr("cash-win")));
    }
    if (command == "bong") {
        var bongXML = data.find("bong[cash-win]");
        if (bongXML.length) top.rewriteGameWin(parseInt(bongXML.attr("cash-win")));
    }
    if (command == "chang" && (status == "bet" || status == "chang")) {
        var changXML = data.find("chang[cash-win]");
        if (changXML.length) top.rewriteGameWin(parseInt(changXML.attr("cash-win")));
    }
    if (pendingMoneyXML.length) {
        var reconnectXML = data.find("reconnect");
        if (!reconnectXML.length) {
            top.showMessage(top._langData.pendingMoneyTransfer, true);
        }
    }
    if (payoutXML.length) {
        top._sessionData.user.payout_id = payoutXML.attr("id");
        top._sessionData.user.payout_cash = (parseInt(payoutXML.attr("cash")) / 100).toFixed(2);
    }
    if (serverExit.length && !isNoExitFlag && top.openedModuleData._context.name != "lobby" && command != "leave") {
        isNoExitFlag = true;
        top.showPreloader();
        top.doLeave();
    }
    if (!isNoExitFlag) {
        if (window["onResponseCommand_" + command]) window["onResponseCommand_" + command](status, data);
        else _log("common::onServerResponse() >> NO HANDLER FOR: " + command);
    }
}