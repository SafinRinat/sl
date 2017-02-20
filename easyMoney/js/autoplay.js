"use strict"; //Strict JS Mode
var _autoplayModule = new AutoplayModule();
var autoplayWindow;
$(function() {
    _log("games/slots/common/autoplay::_init()");
    autoplayWindow = $("#autoplay_window");
    autoplayWindow.find(".exit_btn").on(POINTER_EVENTS.click, function() {
        if ($(this).attr("disabled")) return;
        playSound("autogame_window_exit_sound");
        $(".autoplay_window").hide();
    });
    autoplayWindow.find(".start_btn").on(POINTER_EVENTS.click, function() {
        if ($(this).attr("disabled")) return;
        playSound("autogame_start_sound");
        setVolume("background_sound", 1);
        _autoplayModule.startAutoplay();
        $(".autoplay_window").hide();
    });
    autoplayWindow.find(".selector").find(".minus_btn").on(POINTER_EVENTS.click, function() {
        if ($(this).attr("disabled")) return;
        playSound("autogame_window_change_sound");
        var selector = $(this).parent();
        var input = selector.find("input");
        var value = parseInt(input.val());
        var maxValue = parseInt(input.data("max_value"));
        if (!isNaN(value)) {
            if (value > 0) input.val(value - 1);
            else input.val(maxValue);
        } else input.val(maxValue);
    });
    autoplayWindow.find(".selector").find(".plus_btn").on(POINTER_EVENTS.click, function() {
        if ($(this).attr("disabled")) return;
        playSound("autogame_window_change_sound");
        var selector = $(this).parent();
        var input = selector.find("input");
        var value = parseInt(input.val());
        var maxValue = parseInt(input.data("max_value"));
        if (!isNaN(value)) {
            if (value < maxValue) input.val(value + 1);
            else input.val(0);
        } else input.val(0);
    });
    autoplayWindow.find("input[name='mode']").on("change", function() {
        if ($(this).attr("disabled")) return;
        playSound("autogame_window_options_sound");
        var input = $(this);
        if (input.val() == "spins_mode") {
            disableElements($("#max_win").children());
            enableElements($("#spins_count").children());
        } else {
            disableElements($("#spins_count").children());
            enableElements($("#max_win").children());
        }
    });
    autoplayWindow.find("input[name='stop_on_max_balance'], input[name='stop_on_min_balance']").on("change", function() {
        playSound("autogame_window_options_sound");
    })
});
function AutoplayModule() {
    this.autoplay_data = null;
    this.checkAutoplay = function(lastWin, lines, bet, preCheckOnly) {
        _log("games/slots/common/autoplay::checkAutoplay() >> autoplay_data.mode: " + this.autoplay_data.mode);
        preCheckOnly = !!(preCheckOnly);
        if (this.autoplay_data.mode == "spins_mode") {
            _log("games/slots/common/autoplay::checkAutoplay() >> autoplay_data.spins_count: " + this.autoplay_data.spins_count);
            if (this.autoplay_data.spins_count - 1 <= 0) {
                this.stopAutoplay(preCheckOnly);
                return;
            }
            if (!preCheckOnly) this.autoplay_data.spins_count--;
        } else if (this.autoplay_data.mode == "winnings_mode") {
            _log("games/slots/common/autoplay::checkAutoplay() >> lastWin: " + lastWin);
            if (lastWin >= this.autoplay_data.max_win) {
                this.stopAutoplay(preCheckOnly);
                return;
            }
        }
        if (this.autoplay_data.is_stop_on_max_balance &&
            (top._sessionData.user.cash - top._sessionData.user.free >= this.autoplay_data.max_balance) ||
            this.autoplay_data.is_stop_on_min_balance &&
            (top._sessionData.user.cash - top._sessionData.user.free <= this.autoplay_data.min_balance)) {
            this.stopAutoplay(preCheckOnly);
            return;
        }
        if (bet * lines > top._sessionData.user.cash) {
            this.stopAutoplay(preCheckOnly);
            return;
        }
        if (this.autoplay_data.is_user_cancel) {
            this.stopAutoplay(preCheckOnly);
            return;
        }
        if (!preCheckOnly) {
            setTimeout(doSpin, this.autoplay_data.delay + top._sessionData.user.games_anim ? 0 : 400);
            onUpdateAutoplay();
        }
    };
    this.startAutoplay = function() {
        _log("games/slots/common/autoplay::startAutoplay()");
        this.autoplay_data = new Object();
        this.autoplay_data.mode = autoplayWindow.find("[name='mode']:checked").val();
        this.autoplay_data.spins_count = Math.abs(parseInt($("#spins_count").find("input").val()) | 0);
        this.autoplay_data.max_win = Math.abs((parseInt($("#max_win").find("input").val()) * 100) | 0);
        this.autoplay_data.max_balance = Math.abs((parseInt($("#max_balance").find("input").val()) * 100) | 0);
        this.autoplay_data.min_balance = Math.abs((parseInt($("#min_balance").find("input").val()) * 100) | 0);
        this.autoplay_data.delay = Math.abs((parseInt($("#delay").find("input").val()) * 1000) | 0);
        this.autoplay_data.is_stop_on_max_balance = autoplayWindow.find("[name='stop_on_max_balance']")[0].checked;
        this.autoplay_data.is_stop_on_min_balance = autoplayWindow.find("[name='stop_on_min_balance']")[0].checked;
        this.autoplay_data.is_user_cancel = false;
        if (this.autoplay_data.mode == "spins_mode" && this.autoplay_data.spins_count == 0) return;
        doSpin();
        onStartAutoplay();
        onUpdateAutoplay();
    };
    this.stopAutoplay = function(preCheckOnly) {
        _log("games/slots/common/autoplay::stopAutoplay() preCheckOnly: " + preCheckOnly);
        this.autoplay_data = null;
        onStopAutoplay(preCheckOnly);
    };
    this.cancelAutoplay = function() {
        this.autoplay_data.is_user_cancel = true;
        onCancelAutoplay();
    };
    this.showAutoplayWindow = function() {
        $("#spins_count").find("input").val(100);
        $("#delay").find("input").val(0);
        $("#max_win").find("input").val(1000);
        $("#max_balance").find("input").val(1000);
        $("#min_balance").find("input").val(1000);
        autoplayWindow.find("[value='spins_mode']").prop("checked", true).trigger("change");
        $(".autoplay_window").show();
    };
}
function onStartAutoplay() {
    _log("games/slots/common/autoplay::onStartAutoplay()");
    hideElements($("#autoplay_btn"));
    showElements($("#stop_btn, #autoplay_tables"));
    disableElements($("#spin_btn, #paytable_btn, .line_btn, .line_btn span, .selector [class*='btn']"));
}
function onUpdateAutoplay() {
    _log("games/slots/common/autoplay::onUpdateAutoplay()");
    var autoptValue = _autoplayModule.autoplay_data.mode == "spins_mode" ?
        _autoplayModule.autoplay_data.spins_count : "—";
    $("#autoplay_tables .value").html(autoptValue);
}
function onCancelAutoplay() {
    hideElements($("#autoplay_tables"));
}
function onStopAutoplay(preCheckOnly) {
    _log("games/slots/common/autoplay::onStopAutoplay() preCheckOnly: " + preCheckOnly);
    playSound("autogame_end_sound");
    hideElements($("#autoplay_tables"));
    if (!preCheckOnly) {
        hideElements($("#stop_btn"));
        showElements($("#autoplay_btn"));
        //setState(gameData.status);
    }
}