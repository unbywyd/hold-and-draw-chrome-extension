(function () {
    let app = function () {
        // Brush colour and size
        let colour = "#3d34a5";
        let strokeWidth = 2;
        let pressKey = 'Control'
        let arrowModeKey = 'Shift'
        let arrowMode = false;
        let opacityOption = 1

        // Drawing state
        let latestPoint, prevPoint
        let drawing = false;

        // Set up our drawing context
        let canvas = document.createElement('canvas');
        canvas.id = 'press-and-draw-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.display = 'none';
        let style = document.createElement('style');
        style.type = 'text/css';
        document.head.appendChild(style);
        style.appendChild(document.createTextNode(`
            #press-and-draw-canvas {
                position: fixed;
                z-index: 999999999999999;
                top: 0;
                left:0;
                width: 100%;
                height: 100%;      
                transition: opacity .3s;      
            }
        `));
        document.body.appendChild(canvas);
        const context = canvas.getContext("2d");

        // Drawing functions

        let stepsX = [], stepsY = [], dirX, dirY
        let updatePrevPoint = (newPoints) => {

            let [prevx, prevy] = prevPoint;
            let [nextx, nexty] = newPoints;
            let x = prevx, y = prevy;

            // set dir
            if (!dirX) {
                dirX = nextx > prevx ? '+' : '-'
            } else {
                let prevX = stepsX[stepsX.length - 1];
                let currentDirX = nextx > prevX ? '+' : '-'
                if (currentDirX != dirX && prevX != nextx) {
                    dirX = currentDirX
                    x = nextx
                    y = nexty
                }
            }

            if (!dirY) {
                dirY = nexty > prevy ? '+' : '-'
            } else {
                let prevY = stepsY[stepsY.length - 1];
                let currentDirY = nexty > prevY ? '+' : '-'
                if (currentDirY != dirY && prevY != nexty) {               
                    dirY = currentDirY
                    y = nexty
                    x = nextx
                }
            }


            stepsX.push(nextx);
            stepsY.push(nexty);

            prevPoint = [x, y]
        }
        const continueStroke = newPoint => {
            context.beginPath();
            context.moveTo(latestPoint[0], latestPoint[1]);
            context.strokeStyle = colour;
            context.lineWidth = strokeWidth;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineTo(newPoint[0], newPoint[1]);
            context.stroke();
            latestPoint = newPoint;
            updatePrevPoint(newPoint);
        }

        // Event helpers

        const startStroke = point => {
            drawing = true;
            latestPoint = point;
            prevPoint = point;
            stepsX = [], stepsY = [], dirX = null, dirY = null
            if (arrowMode) {
                let [x, y] = point;
                context.beginPath();
                context.fillStyle = colour
                context.arc(x, y, strokeWidth * 2, 0, 2 * Math.PI);
                context.fill();
            }
        }

        const getTouchPoint = evt => {
            if (!evt.currentTarget) {
                return [0, 0];
            }
            const rect = evt.currentTarget.getBoundingClientRect();
            const touch = evt.targetTouches[0];
            return [touch.clientX - rect.left, touch.clientY - rect.top];
        };

        const BUTTON = 0b01;
        const mouseButtonIsDown = buttons => (BUTTON & buttons) === BUTTON;

        // Event handlers

        const mouseMove = evt => {
            if (!drawing) {
                return;
            }
            continueStroke([evt.offsetX, evt.offsetY]);
        };

        const mouseDown = evt => {
            if (drawing) {
                return;
            }
            evt.preventDefault();
            canvas.addEventListener("mousemove", mouseMove, false);
            startStroke([evt.offsetX, evt.offsetY]);
        };

        const mouseEnter = evt => {
            if (!mouseButtonIsDown(evt.buttons) || drawing) {
                return;
            }
            mouseDown(evt);
        };

        const drawArrowHead = () => {
            var headlen = strokeWidth * 10;


            let [fromx, fromy] = prevPoint || latestPoint
            let [tox, toy] = latestPoint

 

            var dx = tox - fromx;
            var dy = toy - fromy;
            var angle = Math.atan2(dy, dx);

            context.beginPath();
            context.lineWidth = strokeWidth * 1.4;
            context.strokeStyle = colour;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.moveTo(tox, toy);
            context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
            context.moveTo(tox, toy);
            context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));

            context.stroke();
        }

        const endStroke = evt => {
            if (arrowMode) {
                drawArrowHead();
            }
            if (!drawing) {
                return;
            }
            drawing = false;
            evt.currentTarget.removeEventListener("mousemove", mouseMove, false);
        };

        const touchStart = evt => {
            if (drawing) {
                return;
            }
            evt.preventDefault();
            startStroke(getTouchPoint(evt));
        };

        const touchMove = evt => {
            if (!drawing) {
                return;
            }
            continueStroke(getTouchPoint(evt));
        };

        const touchEnd = evt => {
            drawing = false;
        };

        let status = false;
        let showCanvas = () => {
            status = 1
            context.clearRect(0, 0, canvas.width, canvas.height)
            canvas.style.pointerEvents = 'all'
            canvas.style.display = 'block'
            canvas.style.opacity = opacityOption
        }
        let hideCanvas = () => {
            status = 0
            canvas.style.pointerEvents = 'none'
            canvas.style.opacity = 0
        }
        canvas.addEventListener('transitionend', e => {
            if (!status) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.style.display = 'none';
            }
        });

        let pressed = false
        let onKeydown = evt => {

            if ((evt.key.toLowerCase() == pressKey.toLowerCase() && !pressed) || (evt.key.toLowerCase() == arrowModeKey.toLowerCase() && !arrowMode)) {
                pressed = true
                showCanvas();
            }
            if (evt.key.toLowerCase() == arrowModeKey.toLowerCase() && !arrowMode) {
                arrowMode = true
            }
        }
        let onKeyUp = evt => {
            hideCanvas();
            pressed = false
            arrowMode = false
        }

        let updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        this.status = false;

        this.switch = status => {
            if (this.status != status) {
                if (status) {
                    this.begin();
                    this.status = true;
                } else {
                    this.destroy();
                    this.status = false;
                }
            }
        }

        this.updateOptions = ({ color, press_key, opacity, size, arrow_key }) => {
            if (color) {
                colour = color;
            }

            if (press_key) {
                pressKey = press_key
            }
            if (arrow_key) {
                arrowModeKey = arrow_key
            }
            if (size) {
                strokeWidth = parseInt(size);
            }
            if (opacity != undefined) {
                opacityOption = parseFloat(opacity) / 10
            }
        }


        function onwheel(e) {
            if (pressed) {
                if (e.deltaY > 0 && strokeWidth >= 3) {
                    strokeWidth -= 1;
                    document.dispatchEvent(new CustomEvent('hold_draw_size_change', { detail: strokeWidth }))
                } else if (strokeWidth <= 101) {
                    strokeWidth += 1;
                    document.dispatchEvent(new CustomEvent('hold_draw_size_change', { detail: strokeWidth }))
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }


        this.begin = () => {
            updateSize()
            document.addEventListener('wheel', onwheel, { passive: false });
            window.addEventListener('resize', updateSize);
            document.addEventListener('keydown', onKeydown, true);
            document.addEventListener('keyup', onKeyUp, true);
            canvas.addEventListener("touchstart", touchStart, false);
            canvas.addEventListener("touchend", touchEnd, false);
            canvas.addEventListener("touchcancel", touchEnd, false);
            canvas.addEventListener("touchmove", touchMove, false);
            canvas.addEventListener("mousedown", mouseDown, false);
            canvas.addEventListener("mouseup", endStroke, false);
            canvas.addEventListener("mouseout", endStroke, false);
            canvas.addEventListener("mouseenter", mouseEnter, false);
        }

        this.destroy = () => {
            window.removeEventListener('resize', updateSize);
            document.removeEventListener('wheel', onwheel, { passive: false });
            document.removeEventListener('keydown', onKeydown, true);
            document.removeEventListener('keyup', onKeyUp, true);
            canvas.removeEventListener("touchstart", touchStart, false);
            canvas.removeEventListener("touchend", touchEnd, false);
            canvas.removeEventListener("touchcancel", touchEnd, false);
            canvas.removeEventListener("touchmove", touchMove, false);
            canvas.removeEventListener("mousedown", mouseDown, false);
            canvas.removeEventListener("mouseup", endStroke, false);
            canvas.removeEventListener("mouseout", endStroke, false);
            canvas.removeEventListener("mouseenter", mouseEnter, false);
        }
    }

    window.pluginPressAndDraw = new app;

})();