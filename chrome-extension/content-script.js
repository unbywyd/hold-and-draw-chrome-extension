(function () {
    let toSwitch = ({ enabled, color, press_key, arrow_key, opacity, size }) => {
        window.pluginPressAndDraw.switch(enabled);
        if (enabled) {

            window.pluginPressAndDraw.updateOptions({
                color,
                press_key,
                arrow_key,
                opacity,
                size
            });
        }
    }
    chrome.storage.sync.get(['press_and_draw_press_brush_key', 'press_and_draw_enabled', 'press_and_draw_size', 'press_and_draw_opacity', 'press_and_draw_press_arrow_key', 'press_and_draw_color'], function (results) {
        let { press_and_draw_enabled, press_and_draw_press_arrow_key, press_and_draw_color, press_and_draw_size, press_and_draw_opacity, press_and_draw_press_brush_key } = results;
        if (press_and_draw_enabled) {
            toSwitch({
                color: press_and_draw_color,
                enabled: press_and_draw_enabled,
                press_key: press_and_draw_press_brush_key,
                arrow_key: press_and_draw_press_arrow_key,
                opacity: press_and_draw_opacity,
                size: press_and_draw_size
            });
        }
    });

    function debounce(func, wait, immediate) {
        var timeout;

        return function executedFunction() {
            var context = this;
            var args = arguments;

            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };

            var callNow = immediate && !timeout;

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

            if (callNow) func.apply(context, args);
        };
    }


    document.addEventListener('hold_draw_size_change', debounce(function (e) {
        chrome.storage.sync.set({
            press_and_draw_size: e.detail,
        });
        chrome.runtime.sendMessage({ hold_draw_size_change: 2 }).catch(e => {})

    }, 100));

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (typeof request == 'object') {
            if (request.press_and_draw) {
                let { color, press_key, enabled, arrow_key, opacity, size } = request.press_and_draw;

                toSwitch({
                    color,
                    enabled,
                    press_key,
                    arrow_key,
                    opacity,
                    size
                });
            }
        }
        sendResponse({ status: true });
    });
})();