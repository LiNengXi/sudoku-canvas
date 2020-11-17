{
    let sudokuCanvas = document.querySelector('#sudoku-canvas'),
        ctx = sudokuCanvas.getContext('2d'),
        sudokuWrap = document.querySelector('.sudoku-wrap'),
        btnResetCurr = document.querySelector('.btn-reset-curr'),
        btnNewSudoku = document.querySelector('.btn-new-sudoku'),
        playTimeWrap = document.querySelector('.time'),
        levelsWrap = document.querySelector('.levels'),
        numbersWrap = document.querySelector('.numbers');
    
    const LEN = 9;
    const INITAL_DIFFICULTY = .5;
    const CELL_INFO = 40;   //  单元格宽高为40

    let difficulty = INITAL_DIFFICULTY,
        sudokuCore = new SudokuCore(),
        cellPosGroup = [],  //  保存每个单元格的{ x,y,x1,y1,isEditable }等信息
        sudoku = sudokuCore.createBlankCell(sudokuCore.initializeSudoku(), difficulty),
        prevSudoku = copySudoku(sudoku, difficulty),
        currLevel = 0,
        timerID,
        startTime;
    
    if (ctx) {
        renderSudoku();

        sudokuCanvas.addEventListener('click', function (e) {
            let offsetLeft = e.target.offsetLeft,
                offsetTop = e.target.offsetTop,
                clientX = e.clientX - offsetLeft,
                clientY = e.clientY - offsetTop;
            
            for (let i = 0; i < LEN; i++) {
                for (let j = 0; j < LEN; j++) {
                    let item = cellPosGroup[i][j];
                    
                    if (clientX > item.x && clientY > item.y && clientX < item.x1 && clientY < item.y1 ) {
                        if (item.isEditable) {
                            let eleLeft = item.x + offsetLeft,
                                eleTop = item.y + offsetTop;
                            inputHandler(i, j, eleLeft, eleTop);
                        }
                        break;
                    }
                }
            }
        }, false);

        levelsWrap.addEventListener('click', function (e) {
            let ele = e.target;
            if (ele.tagName === 'LI') {
                let pos = parseInt(ele.dataset.index);
                currLevel = pos;
                difficulty = sudokuCore.levels[pos].difficulty;
                renderLevels();
            }
        }, false);

        btnResetCurr.addEventListener('click', function () {
            for (let i = 0, levels = sudokuCore.levels, len = levels.length; i < len; i++) {
                if (prevSudoku.difficulty === levels[i].difficulty) {
                    currLevel = i;
                    break;
                }
            }
            sudoku = copySudoku(prevSudoku.sudoku, prevSudoku.difficulty).sudoku;
            renderSudoku();
        }, false);

        btnNewSudoku.addEventListener('click', function () {
            sudoku = sudokuCore.createBlankCell(sudokuCore.initializeSudoku(), difficulty);
            prevSudoku = copySudoku(sudoku, difficulty);
            renderSudoku();
        }, false);
    }

    function copySudoku(sudoku, difficulty) {
        return {
            sudoku: sudoku.map(rows => rows.map(ele => ele)),
            difficulty
        };
    }

    function inputHandler(i, j, eleLeft, eleTop) {
        let inputEle = document.querySelector('.input-ele');

        if (inputEle) {
            inputEle.blur();
        } else {
            inputEle = document.createElement('input');

            inputEle.value = sudoku[i][j] || '';

            inputEle.className = 'input-ele';
            inputEle.style.left = eleLeft + 'px';
            inputEle.style.top = eleTop + 'px';

            inputEle.addEventListener('keydown', function (e) {
                let keyCode = e.keyCode;

                if (keyCode === 8) {
                    e.target.value = '';
                }

                if (keyCode === 116) {
                    window.location.reload();
                }
            
                if ((keyCode >= 49 && keyCode <= 57) ||
                    (keyCode >= 97 && keyCode <= 105)) {
                    return;
                } else {
                    e.preventDefault();
                }
            }, false);

            inputEle.addEventListener('keyup', function (e) {
                let val = e.target.value;
                val = val && val.slice(val.length - 1);
                sudoku[i][j] = val;
                inputEle.blur();
                drawSudokuCell(i, j);
            }, false);

            inputEle.addEventListener('blur', function () {
                inputEle.remove();
            }, false);

            document.body.appendChild(inputEle);

            setTimeout(() => {
                inputEle.focus();
            }, 0);
        }
    }

    function renderPlayTime() {
        clearTimeout(timerID);
        startTime = Date.now();

        (function counterDown() {
            let now = Date.now(),
                timeDiff = now - startTime,
                h = parseInt(timeDiff / 1000 / 60 / 60 % 24),
                m = parseInt(timeDiff / 1000 / 60 % 60),
                s = parseInt(timeDiff / 1000 % 60);
            
            playTimeWrap.innerHTML = `${ !h ? '' : fixZero(h) + ' : ' }${ fixZero(m) } : ${ fixZero(s) }`;

            timerID = setTimeout(counterDown, 1000);
        })();
    }

    function renderLevels() {
        let levelsHtml = '';
        for (let i = 0, levels = sudokuCore.levels, len = levels.length; i < len; i++) {
            levelsHtml += `<li class="${ currLevel === i ? 's-current' : 'n-current' }" data-index="${ i }">${ levels[i].text }</li>`;
        }
        levelsWrap.innerHTML = levelsHtml;
    }

    function renderNumbers() {
        let numbersHtml = '';
        for (let i = 1; i <= 9; i++) {
            let numsRes = JSON.stringify(sudoku).match(new RegExp(i, 'g')),
                len = numsRes ? numsRes.length : 0;

            numbersHtml += `<li class="${ len >= LEN ? 's-max' : '' }">${ i }</li>`;
        }
        numbersWrap.innerHTML = numbersHtml;
    }

    function fixZero(num) {
        return num < 10 ? `0${ num }` : num;
    }

    function renderSudoku() {
        drawSudokuStyle();
        drawSudoku();
        renderLevels();
        renderNumbers();
        renderPlayTime();
        sudokuWrap.classList.remove('s-done');
    }
    
    function drawSudokuStyle() {
        ctx.clearRect(0, 0, 360, 360);

        let rowLinePos = CELL_INFO, columnLinePos = CELL_INFO;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 360, 360);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ccc';
        for (let i = 0; i < LEN; i++) {
            if (!i) {
                continue;
            } else {
                if (!(i % 3)) {
                    ctx.lineWidth = 2.5;
                } else {
                    ctx.lineWidth = 1;
                }
                
                ctx.beginPath();

                ctx.moveTo(0, rowLinePos * i + .5);
                ctx.lineTo(360, rowLinePos * i + .5);

                ctx.moveTo(columnLinePos * i + .5, 0);
                ctx.lineTo(columnLinePos * i + .5, 360);

                ctx.stroke();
                ctx.closePath();
            }
        }

        ctx.font = '16px Microsoft yahei';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#36f';
    }
    
    function drawSudoku() {
        cellPosGroup = [];

        for (let i = 0; i < LEN; i++) {
            let posGroup = [];
            for (let j = 0; j < LEN; j++) {
                let item = sudoku[i][j],
                    x = CELL_INFO * j,
                    y = CELL_INFO * i;

                ctx.fillText(item, (CELL_INFO / 2) + x,  (CELL_INFO / 2 + 2) + y);
                posGroup.push({ x: CELL_INFO * j, y: CELL_INFO * i, x1: x + CELL_INFO, y1: y + CELL_INFO, isEditable: typeof item !== 'number' ? true : false });
            }
            cellPosGroup.push(posGroup);
        }
    }

    function drawSudokuCell(i, j) {
        ctx.fillText(sudoku[i][j], (CELL_INFO / 2) + (CELL_INFO * j), (CELL_INFO / 2) + (CELL_INFO * i));
        renderNumbers();

        setTimeout(() => {
            let hasCheckSudoku = sudoku.map(rows => (rows.map(ele => {
                let eleType = typeof ele;
                if (ele && eleType === 'string') {
                    return parseInt(ele);
                }
                return ele;
            })));
            if (sudokuCore.checkSudoku(hasCheckSudoku)) {
                cellPosGroup = cellPosGroup.map(rows => (rows.map(ele => {
                    if (!ele.isEditable) {
                        ele.isEditable = true;
                    }
                    return ele;
                })));
                clearTimeout(timerID);
                sudokuWrap.classList.add('s-done');
            }
        }, 0);
    }
}