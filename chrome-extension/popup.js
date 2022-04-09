chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    let [tab] = tabs;

    let toggleEl = document.getElementById('toggle');
    let colorEl = document.getElementById('color');
    let keyBrush = document.getElementById('key_brush');
    let keyArrow = document.getElementById('key_arrow');
    let opacityEl = document.getElementById('opacity');
    let rangeEl = document.getElementById('size');


    let sendStatus = () => {
        chrome.tabs.sendMessage(tab.id, {
            press_and_draw: {
                color: colorEl.value,
                enabled: toggleEl.checked,
                press_key: keyBrush.value,
                arrow_key: keyArrow.value,
                opacity: opacityEl.value,
                size: rangeEl.value
            }
        }).catch(e => {});
    }

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if(typeof request == 'object' && request.hold_draw_size_change) {
                rangeEl.value = request.hold_draw_size_change
            }
            sendResponse({status: true})
        }
    );

    chrome.storage.sync.get(['press_and_draw_press_brush_key', 'press_and_draw_size', 'press_and_draw_enabled', 'press_and_draw_opacity', 'press_and_draw_press_arrow_key', 'press_and_draw_color'], function (results) {

        let { press_and_draw_enabled, press_and_draw_press_arrow_key, press_and_draw_color, press_and_draw_size, press_and_draw_opacity, press_and_draw_press_brush_key } = results;
        toggleEl.checked = !!press_and_draw_enabled
        if (press_and_draw_press_arrow_key) {
            keyArrow.value = press_and_draw_press_arrow_key;
        } else {
            keyArrow.value = 'Control'
        }
        if(press_and_draw_opacity != undefined) {
            opacityEl.value = press_and_draw_opacity;
        } else {
            opacityEl.value = 1;
        }
       
        if(press_and_draw_size) {
            rangeEl.value = press_and_draw_size;
        } else {
            rangeEl.value = 2;
        }
        if (press_and_draw_color) {
            colorEl.value = press_and_draw_color;
        }
        if (press_and_draw_press_brush_key) {
            keyBrush.value = press_and_draw_press_brush_key;
        } else {
            keyBrush.value = 'Shift'
        }
    });


    toggleEl.addEventListener('change', () => {
        chrome.storage.sync.set({ 'press_and_draw_enabled': toggleEl.checked });
        sendStatus();
    });

    colorEl.addEventListener('change', () => {
        chrome.storage.sync.set({ 'press_and_draw_color': colorEl.value });
        sendStatus();
    });

    keyBrush.addEventListener('input', () => {
        chrome.storage.sync.set({ 'press_and_draw_press_brush_key': keyBrush.value });
        sendStatus();
    });
    keyBrush.addEventListener('change', () => {
        chrome.storage.sync.set({ 'press_and_draw_press_brush_key': keyBrush.value });
        sendStatus();
    });

    keyArrow.addEventListener('input', () => {
        chrome.storage.sync.set({ 'press_and_draw_press_arrow_key': keyArrow.value });
        sendStatus();
    });
    keyArrow.addEventListener('change', () => {
        chrome.storage.sync.set({ 'press_and_draw_press_arrow_key': keyArrow.value });
        sendStatus();
    });


    opacityEl.addEventListener('input', () => {
        chrome.storage.sync.set({ 'press_and_draw_opacity': opacityEl.value });
        sendStatus();
    });
    opacityEl.addEventListener('change', () => {
        chrome.storage.sync.set({ 'press_and_draw_opacity': opacityEl.value });
        sendStatus();
    });


    rangeEl.addEventListener('input', () => {
        chrome.storage.sync.set({ 'press_and_draw_size': rangeEl.value });
        sendStatus();
    });
    rangeEl.addEventListener('change', () => {
        chrome.storage.sync.set({ 'press_and_draw_size': rangeEl.value });
        sendStatus();
    });


    

    
});