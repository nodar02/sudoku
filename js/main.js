var table = $('#puzzle-grid')[0];

var gameId = 0;

var puzzle = [];

var solution = [];

var remaining = [9, 9, 9, 9, 9, 9, 9, 9, 9];

var timer = 0;
var pauseTimer = false;
var intervalId;
var gameOn = false;

var finishedCount = 0;
var finishedCheckForUI;
var difficultyCheck = 0;

var hintfinishedCheckForUI = 0;
var hintRest;




function generateNewSudoku(difficulty) {
    
    var grid = getGridInit();

    var rows = grid;
    var cols = getColumns(grid);
    var blks = getBlocks(grid);
    var psNum = generatePossibleNumber(rows, cols, blks);

    solution = solveGrid(psNum, rows, true);

    hintfinishedCheckForUI = 0;

    timer = 0;
    for (var i in remaining){
        remaining[i] = 9;
    }

    puzzle = makeItPuzzle(solution, difficulty);

    gameOn = difficulty < 5 && difficulty >= 0;

    viewPuzzle(puzzle);
    updateRemainingTable();

    setHintValue();

    if (gameOn)
        startTimer();
}

function getGridInit() {
    var rand = [];
    for (var i = 0; i < 9; i++) {
        var row = Math.floor(Math.random() * 9);
        var col = Math.floor(Math.random() * 9);
        var accept = true;
        for (var j = 0; j < rand.length; j++) {

            if (rand[j][0] == i + 1 || (rand[j][1] == row && rand[j][2] == col)) {
                accept = false;
                i--;
                break;
            }
        }
        if (accept) {
            rand.push([i + 1, row, col]);
        }
    }

    var result = [];
    for (var i = 0; i < 9; i++) {
        var row = "000000000";
        result.push(row);
    }

    for (var i = 0; i < rand.length; i++) {
        result[rand[i][1]] = replaceCharAt(result[rand[i][1]], rand[i][2], rand[i][0]);
    }

    return result;
}

function getColumns(grid) {
    var result = ["", "", "", "", "", "", "", "", ""];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++)
            result[j] += grid[i][j];
    }
    return result;
}

function getBlocks(grid) {
    var result = ["", "", "", "", "", "", "", "", ""];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++)
            result[Math.floor(i / 3) * 3 + Math.floor(j / 3)] += grid[i][j];
    }
    return result;
}

function replaceCharAt(string, index, char) {
    if (index > string.length - 1){
        return string;
    }
    return string.substr(0, index) + char + string.substr(index + 1);
}

function generatePossibleNumber(rows, columns, blocks) {
    var psb = [];

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            psb[i * 9 + j] = "";
            if (rows[i][j] != 0) {
                psb[i * 9 + j] += rows[i][j];
            } else {
                for (var k = '1'; k <= '9'; k++) {
                    if (!rows[i].includes(k)){
                        if (!columns[j].includes(k)){
                            if (!blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)].includes(k)){
                                psb[i * 9 + j] += k;
                            }
                        }
                    }
                }
            }
        }
    }
    return psb;
}

function solveGrid(possibleNumber, rows) {
    var solution = [];

    var result = nextStep(0, possibleNumber, rows, solution, true);
    if (result == 1){
        return solution;
    }

}

function nextStep(level, possibleNumber, rows, solution) {
    var x = possibleNumber.slice(level * 9, (level + 1) * 9);

    var y = generatePossibleRows(x);
    if (y.length == 0){
        return 0;
    }

    for (var num = 0; num <= y.length - 1; num++) {
    
        for (var i = level + 1; i < 9; i++){
            solution[i] = rows[i];
        }
        solution[level] = y[num];
        if (level < 8) {
            var cols = getColumns(solution);
            var blocks = getBlocks(solution);

            var poss = generatePossibleNumber(solution, cols, blocks);
            if (nextStep(level + 1, poss, rows, solution) == 1){
                return 1;
            }
        }
        if (level == 8){
            return 1;
        }
    }
    return -1;
}

function generatePossibleRows(possibleNumber) {
    var result = [];

    function step(level, PossibleRow) {
        if (level == 9) {
            result.push(PossibleRow);
            return;
        }

        for (var i in possibleNumber[level]) {
            if (PossibleRow.includes(possibleNumber[level][i])){
                continue;
            }
            step(level + 1, PossibleRow + possibleNumber[level][i]);
        }
    }

    step(0, "");

    return result;
}

function makeItPuzzle(grid, difficulty) {

    if (!(difficulty < 5 && difficulty >= 0)){
        difficulty = 13;
    }
    var remainedValues = 81;
    var puzzle = grid.slice(0);

    function clearValue(grid, x, y, remainedValues) {
        if (grid[y][x] != 0) {
            grid[y] = replaceCharAt(grid[y], x, "0");
            remainedValues--;
            if (x != y) {
                grid[x] = replaceCharAt(grid[x], y, "0");
                remainedValues--;
            }
        }
        return remainedValues;
    }

    while (remainedValues > (difficulty * 5 + 20)) {
        var x = Math.floor(Math.random() * 9);
        var y = Math.floor(Math.random() * 9);
        remainedValues = clearValue(puzzle, x, y, remainedValues);
    }
    return puzzle;
}

function viewPuzzle(grid) {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            addClassToCell(table.rows[i].cells[j].getElementsByTagName('input')[0]);
            if (grid[i][j] == "0") {
                input.disabled = false;
                input.value = "";
            }else {
                input.disabled = true;
                input.value = grid[i][j];
                remaining[grid[i][j] - 1]--;
            }
        }
    }
}

function readInput() {
    var result = [];
    for (var i = 0; i < 9; i++) {
        result.push("");
        for (var j = 0; j < 9; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            if (input.value == "" || input.value.length > 1 || input.value == "0") {
                input.value = ""
                result[i] += "0";
            }
            else
                result[i] += input.value;
        }
    }
    return result;
}

function checkValue(value, row, column, block, defaultValue, currectValue) {
    if (value === "" || value === '0'){
        return 0;
    }
    if (!(value > '0' && value < ':')){
        return 4;
    }
    if (value === defaultValue){
        return 0;
    }
    if ((row.indexOf(value) != row.lastIndexOf(value))
        || (column.indexOf(value) != column.lastIndexOf(value))
        || (block.indexOf(value) != block.lastIndexOf(value))) {
        return 3;
    }
    if (value !== currectValue){
        return 2;
    }
    return 1;
}

function addClassToCell(input, className) {

    input.classList.remove("right-cell");
    input.classList.remove("worning-cell");
    input.classList.remove("wrong-cell");

    if (className != undefined){
        input.classList.add(className);
    }
}

function updateRemainingTable() {
    for (var i = 0; i < 9; i++) { 
        var item = document.getElementById("remain-" + (i + 1));
        item.innerText = remaining[i]; 
        item.classList.remove("red");
        item.classList.remove("gray");
        if (remaining[i] === 0){
            item.classList.add("gray");
        }
        else if (remaining[i] < 0 || remaining[i] > 9) {
            item.classList.add("red");
        }
    }
}

function startTimer() {
    var timerDiv = document.getElementById("timer");
    clearInterval(intervalId);

    pauseTimer = false;
    intervalId = setInterval(function () {
        if (!pauseTimer) {
            timer++;
            var min = Math.floor(timer / 60);
            var sec = timer % 60;
            timerDiv.innerText = (("" + min).length < 2 ? ("0" + min) : min) + ":" + (("" + sec).length < 2 ? ("0" + sec) : sec);
        }
    }, 1000);
}


$(".button").on("mousedown", function(e){

            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;

            var rippleItem = document.createElement("div");
            rippleItem.classList.add('ripple');
            rippleItem.setAttribute("style", "left: " + x + "px; top: " + y + "px");

            var rippleColor = this.getAttribute('ripple-color');
            if (rippleColor)
                rippleItem.style.background = rippleColor;
            this.appendChild(rippleItem);

            setTimeout(function () {
                rippleItem.parentElement.removeChild(rippleItem);
            }, 1500);

});

var sudokuInputs = $(table).find("input");

$(sudokuInputs).on("change", function(e){
    
     addClassToCell(this);
     checkInput(this);

    if (this.value > 0 && this.value < 10)
        remaining[this.value - 1]--;
        if (this.oldvalue !== "") {
            if (this.oldvalue > 0 && this.oldvalue < 10){
                remaining[this.oldvalue - 1]++;
            }
        }

    updateRemainingTable();

});

$(sudokuInputs).on("focus", function(e){
    this.oldvalue = this.value;
});


function checkInput(input) {
    if (input.value[0] < '1' || input.value[0] > '9') {
        if (input.value != "?" && input.value != "؟") {
            input.value = "";
            if(getLang() == "en"){
                swal({icon: 'error',text: 'Only the [1-9] և <?> is allowed'});
            }else if(getLang() == "ru"){
                swal({icon: 'error',text: 'Разрешен только знак [1-9] և <?>'});
            }else if(getLang() == "am"){
                swal({icon: 'error',text: 'Թույլատրված են միայն [1-9] և <?> նշանը'});
            }
            input.focus();
        }
    }
}

window.onclick = function (event) {
    var m1 = document.getElementById("hamburger-menu");

    if (event.target == m1) {
        hideHamburgerMenu();
    }

}

function openHamburgerMenu() {
    var div = document.getElementById("hamburger-menu");
    var menu = document.getElementById("nav-menu");
    div.style.display = "block";
    div.style.visibility = "visible";
    setTimeout(function () {
        div.style.opacity = 1;
        menu.style.left = 0;
    }, 50);
}

function startNewGame() {
    var difficulties = document.getElementsByName('difficulty');
    var difficulty = 5;

    for (var i = 0; i < difficulties.length; i++) {
        if (difficulties[i].checked) {
            generateNewSudoku(4 - i);
            difficulty = i;
            break;
        }   
    }

    if (difficulty > 4){
        if(getLang() == "am"){
           swal({icon: 'warning',title: 'Խնդրում ենք ընտրել խաղի բարդությունը.'});
        }else if(getLang() == "ru"){
            swal({icon: 'warning',title: 'Пожалуйста, выберите сложность игры.'});
        }else if(getLang() == "en"){
            swal({icon: 'warning',title: 'Please choose game difficulty.'});
        }
    }

     if(difficulty == 0 || difficulty == 1){
            difficultyCheck = 30;
        }else if(difficulty == 2 || difficulty == 3){
            difficultyCheck = 24;
        }else if(difficulty == 4){
            difficultyCheck = 12;
        }
    
    $("#rest").html(difficultyCheck);

    if($("#finished-checkbox").is(":checked", true) && difficulty <= 4){
       $("#ckecked-rest").show(); 
    }else{
        $("#ckecked-rest").hide();
    }





    gameId++;
    if(getLang() == "am"){
           document.getElementById("game-number").innerText = "խաղ #" + gameId;
           document.getElementById("timer-label").innerText = "Ժամանակ";
           document.getElementById("game-difficulty-label").innerText = "Խաղի բարդություն";
        }else if(getLang() == "ru"){
            document.getElementById("game-number").innerText = "игра #" + gameId;
            document.getElementById("timer-label").innerText = "Время";
            document.getElementById("game-difficulty-label").innerText = "Сложность игры";
        }else if(getLang() == "en"){
            document.getElementById("game-number").innerText = "game #" + gameId;
            document.getElementById("timer-label").innerText = "Time";
            document.getElementById("game-difficulty-label").innerText = "Game difficulty";
        }


    document.getElementById("pause-btn").style.display = "block";
    document.getElementById("check-btn").style.display = "block";
    document.getElementById("timer").innerText = "00:00";
    var diffValue = difficulties[difficulty].value;
    if(getLang() == "en"){
        if(diffValue  == "Շատ հեշտ"){
            diffValue = "Very easy"; 
        }else if(diffValue  == "Հեշտ"){
            diffValue = "Easy"; 
        }else if(diffValue  == "Միջին"){
            diffValue = "Normal"; 
        }else if(diffValue  == "Դժվար"){
            diffValue = "Hard"; 
        }else if(diffValue  == "Շատ դժվար"){
            diffValue = "Very hard"; 
        }
    }else if(getLang() == "ru"){
        if(diffValue  == "Շատ հեշտ"){
            diffValue = "Очень просто"; 
        }else if(diffValue  == "Հեշտ"){
            diffValue = "Легкий"; 
        }else if(diffValue  == "Միջին"){
            diffValue = "Cредний"; 
        }else if(diffValue  == "Դժվար"){
            diffValue = "Сложно"; 
        }else if(diffValue  == "Շատ դժվար"){
            diffValue = "Очень сложно"; 
        }
    }
    document.getElementById("game-difficulty").innerText = diffValue;
}

function pauseGame() {
    if(gameOn){
        var icon = document.getElementById("pause-icon");
        var label = document.getElementById("pause-text");

        if (pauseTimer) {
            icon.innerText = "pause";
            if(getLang() == "am"){
                label.innerText = "Դադար";
            }else if(getLang() == "ru"){
                label.innerText = "Пауза";
            }else if(getLang() == "en"){
                label.innerText = "Stop";
            }
            table.style.opacity = 1;
        }
        else {
            icon.innerText = "play_arrow";
            if(getLang() == "am"){
                label.innerText = "Շարունակել";
            }else if(getLang() == "ru"){
                label.innerText = "Продолжать";
            }else if(getLang() == "en"){
                label.innerText = "Continue";
            }
            table.style.opacity = 0;
        }

        pauseTimer = !pauseTimer;
    }else{
        massageGameNotStarted();
    }
}

function checkSudoku() {
    
    if (gameOn) {

        timer += 60;
        var currentGrid = [];

        currentGrid = readInput();

        var columns = getColumns(currentGrid);
        var blocks = getBlocks(currentGrid);

        var errors = 0;
        var currects = 0;

        var finishedCheckbox = $("#finished-checkbox");
        if(finishedCheckbox.is(":checked", true)){
          var difficulty = getDifficultiesValue();
            
            if(difficulty == 0 || difficulty == 1){
                difficultyCheck = 30;
            }else if(difficulty == 2 || difficulty == 3){
                difficultyCheck = 24;
            }else if(difficulty == 4){
                difficultyCheck = 12;
            }
       

        if(finishedCount == 0){
             finishedCheckForUI = --difficultyCheck;
        }

        $("#rest").html(finishedCheckForUI);
        finishedCheckForUI--;

            finishedCount++;
            if(finishedCount == difficultyCheck){

                 if(getLang() == "am"){
                     var swalTitel = "Դուք պարտվեցիք";
                     var swalText = "Ցանկանու՞մ եք կրկնել խաղը․";
                 }else if(getLang() == "ru"){
                    var swalTitel = "Вы проиграл";
                     var swalText = "Хотите повторить игру?";
                }else if(getLang() == "en"){
                    var swalTitel = "You lost";
                     var swalText = "Do you want to repeat the game?";
                }

                swal({
                    title: swalTitel,
                    text: swalText,
                    icon: "warning",
                    buttons: true,
                }).then((willDelete) => {
                    if (willDelete) {
                       restartSudoku();
                       finishedCount = 0;
                       finishedCheckForUI = difficultyCheck;
                       $("#rest").html(finishedCheckForUI);
                    } else {
                        location.reload();
                     }
                });
            }
        }

        for (var i = 0; i < currentGrid.length; i++) {
            for (var j = 0; j < currentGrid[i].length; j++) {
                if (currentGrid[i][j] == "0"){
                    continue;
                }

                var result = checkValue(currentGrid[i][j], currentGrid[i], columns[j], blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)], puzzle[i][j], solution[i][j]);

                var inputClassName = "";
                if(result === 1){
                    inputClassName = "right-cell";
                }else if(result === 2){
                    inputClassName = "worning-cell"; 
                }else if(result === 3){
                    inputClassName = "wrong-cell";
                }else{
                    inputClassName = undefined;
                }
                addClassToCell(table.rows[i].cells[j].getElementsByTagName('input')[0], inputClassName);

                if (result === 1 || result === 0) {
                    currects++;
                } else if (result === 3) {
                    errors++;
                }
            }
        }

         if(getLang() == "am"){
                     var swalTitel = "Հիանալի աշխատանք!";
                     var swalText = "Դուք լուծեցիք գլուխկոտրուկը․";
                     var gameType = "Լուծված";
                 }else if(getLang() == "ru"){
                    var swalTitel = "Прекрасная работа";
                     var swalText = "Вы решили загадку";
                     var gameType = "Решено";
                }else if(getLang() == "en"){
                    var swalTitel = "Great job";
                     var swalText = "You solved the puzzle.";
                     var gameType = "Solved";
                }

        if (currects === 81 && errors == 0) {
            gameOn = false;
            pauseTimer = true;
            document.getElementById("game-difficulty").innerText = gameType;
            clearInterval(intervalId);
            swal(swalTitel,
                 swalText,
                 "success").then((willDelete) => {
                        location.reload();
                });;
        } 
    }else{
        massageGameNotStarted();
    }
}


function restartSudoku() {

    hintfinishedCheckForUI = 0;

    hideHamburgerMenu();
  
    if (gameOn) {
        setHintValue();

        for (var i in remaining){
            remaining[i] = 9;
        }

        viewPuzzle(puzzle);

        updateRemainingTable();

        timer = -1;
    }else{
        massageGameNotStarted();
    }
}

function surrender() {

    hideHamburgerMenu();

    if (gameOn) {

        for (var i in remaining){
            remaining[i] = 9;
        }

        viewPuzzle(solution);

        updateRemainingTable();

        gameOn = false;
        pauseTimer = true;
        clearInterval(intervalId);

         if(getLang() == "am"){
            document.getElementById("game-difficulty").innerText = "Լուծված";
         }else if(getLang() == "ru"){                   
            document.getElementById("game-difficulty").innerText = "Решено";
         }else if(getLang() == "en"){
            document.getElementById("game-difficulty").innerText = "Solved";                   
         }
    }else{
        massageGameNotStarted();
    }
}

function getHint() {
    var difficulty;

    hideHamburgerMenu();

if (gameOn) {
    var difficulty = getDifficultiesValue();

    if(hintfinishedCheckForUI == 0){
        if(difficulty == 0){
            hintRest = 14;
        }else if(difficulty == 1){
            hintRest = 11;
        }else if(difficulty == 2 || difficulty == 3){
            hintRest = 9;
        }else if(difficulty == 4){
            hintRest = 5;
        }
    }
        if(getLang() == "am"){
            var swalTitle = "Դուք այլևս չունեք հուշում ստանալու հնարավորություն"; 
         }else if(getLang() == "ru"){                   
            var swalTitle = "У вас больше нет возможности получать чаевые!";
         }else if(getLang() == "en"){
            var swalTitle = "You no longer have the opportunity to receive a tip!";                
         }

        if(hintfinishedCheckForUI >  hintRest){
            swal({
             icon: 'warning',
             title: swalTitle,
            });
        }else{
                if(hintRest - hintfinishedCheckForUI == 0){
                   $("#rest-hint")[0].style.color = "red";
                }else{
                   $("#rest-hint")[0].style.color = "green";   
                }

            $("#rest-hint").html(hintRest - hintfinishedCheckForUI);
            
            var emptyCellList = [];
            var wrongCellList = [];
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
                    if (input.value == "" || input.value.length > 1 || input.value == "0") {
                        emptyCellList.push([i, j])
                    }
                    else {
                        if (input.value !== solution[i][j])
                            wrongCellList.push([i, j])
                    }
                }
            }

            if (emptyCellList.length === 0 && wrongCellList.length === 0) {
                if(getLang() == "am"){
                     var swalTitle = "Հիանալի աշխատանք!"; 
                     var swalText = "Դուք լուծեցիք գլուխկոտրուկը.";
                }else if(getLang() == "ru"){                   
                    var swalTitle = "Прекрасная работа!"; 
                    var swalText = "Вы решили загадку";
                }else if(getLang() == "en"){
                    var swalTitle = "Great job!"; 
                    var swalText = "You solved the puzzle.";           
                }
                gameOn = false;
                pauseTimer = true;
                document.getElementById("game-difficulty").innerText = "Լուծված";
                clearInterval(intervalId);
                swal(swalTitle, swalText, "success");
            } else {

                timer += 60;

                var input;
                var randomNumber = Math.random();
                if ((randomNumber < 0.5 && emptyCellList.length > 0) || wrongCellList.length === 0) {
                    var index = Math.floor(Math.random() * emptyCellList.length)
                    input = table.rows[emptyCellList[index][0]].cells[emptyCellList[index][1]].getElementsByTagName('input')[0];
                    input.oldvalue = input.value;
                    input.value = solution[emptyCellList[index][0]][emptyCellList[index][1]];
                    remaining[input.value - 1]--;
                } else {
                    var index = Math.floor(Math.random() * wrongCellList.length)
                    input = table.rows[wrongCellList[index][0]].cells[wrongCellList[index][1]].getElementsByTagName('input')[0];
                    input.oldvalue = input.value;
                    remaining[input.value - 1]++;
                    input.value = solution[wrongCellList[index][0]][wrongCellList[index][1]];
                    remaining[input.value - 1]--;
                }

                updateRemainingTable();
            }

            var count = 0
            for (var i = 0; i < 6; i++) {
                setTimeout(function () {
                    if (count % 2 == 0) {
                        input.classList.add("right-cell");
                    }else{
                        input.classList.remove("right-cell");
                    }
                    count++;
                }, i * 750)
            }   
        }

        hintfinishedCheckForUI++;
    }else{
        massageGameNotStarted();
    }


}

function hideHamburgerMenu() {
    var div = document.getElementById("hamburger-menu");
    var menu = document.getElementById("nav-menu");
    menu.style.left = "-256px";

    setTimeout(function () {
        div.style.opacity = 0;
        div.style.visibility = "collapse";
    }, 200);
}

function getDifficultiesValue (){
    var difficulties = document.getElementsByName('difficulty');
    

    for (var i = 0; i < difficulties.length; i++) {
        if (difficulties[i].checked) {
                var difficulty = i;
                break;
            }
    }

     return difficulty;
}

function massageGameNotStarted(){
    if(getLang() == "am"){
                    swal({icon: 'warning',title: 'Խաղը դեռ սկսված չէ',text:"Խնդրում ենք սկսել նոր խաղ"});
                }else if(getLang() == "ru"){                   
                     swal({icon: 'warning',title: 'Игра еще не началась',text:"Пожалуйста, начни новую игру"});
                }else if(getLang() == "en"){
                     swal({icon: 'warning',title: 'The game has not started yet',text:"Please start a new game"});
                }
}

function setHintValue(){
    var difficultyForHint = getDifficultiesValue();

    if(difficultyForHint == 0){
            hintRest = 15;
        }else if(difficultyForHint == 1){
            hintRest = 12;
        }else if(difficultyForHint == 2 || difficultyForHint == 3){
            hintRest = 10;
        }else if(difficultyForHint == 4){
            hintRest = 6;
     }

    $("#rest-hint").html(hintRest);
    $("#rest-hint")[0].style.color = 'green';
}

$("#hamburger-add-button").on("click",function(){
     hideHamburgerMenu();
});


$(window).resize(function (){
    setSudokuHeight();
});

setSudokuHeight();
function setSudokuHeight(){
    var h = window.outerHeight;
    var marginTop = (h - 550) / 2;
    $("#sudoku").css("margin-top", marginTop + 'px');
}

$("#lang").on("change", function(){
    setLang();
});

setLang();
function setLang(){
    var langAM = ["Սուդոկու", "Նոր Խաղ", "Հուշում", "Վերսկսել", "Հանձնվել", "Ժամանակ", "Խաղի բարդություն", "Մնացած թվեր", "Ստուգում", "Դադար", "Ընտրել խաղի բարդությունը.", "Շատ հեշտ", "Հեշտ", "Միջին", "Դժվար", "Շատ դժվար", "Ընտրել խաղի տեսակը, խաղը սկսելու համար.", "Ավարտով խաղ", "Սկսել", "Չեղարկել", "Խաղի մասին", "Հեղինակի մասին", "Փակել", "ԵՐԵՎԱՆԻ ԻՆՖՈՐՄԱՏԻԿԱՅԻ ՊԵՏԱԿԱՆ ՔՈԼԵՋ", "Ուսանող՝ Օգանեսյան Նոդար", "Խումբ՝ 714", "Директор` Պետրոսյան Արթուր","Ստուգելու հնարավորություն:" ];
    var langEN = ["Sudoku", "New Game", "Hint", "Restart", "Surrender", "Time", "Game difficulty", "Remaining numbers" , "Check sudoku", "Pause", "Please choose game difficulty.", "Very easy", "Easy", "Normal", "Hard", "Expert", "Please choose game type, to start the game", "Ending game", "Start", "Cancel", "About game", "About author", "Close", "YEREVAN STATE COLLEGE OF INFORMATICS", "Student` Oganesyan Nodar","Group` 714", "Project director` Petrosyan Artur", "Ability to check:"];
    var langRU = ["Судоку", "Новая игра", "Намекать", "Запустить снова", "Сдаваться", "Время", "Сложность игры", "Возможные числа", "Проверять", "Пауза", "Выберите сложность игры", "Очень просто", "Легкий", "Обычный", "Жесткий", "Эксперт", "Пожалуйста, выберите тип игры, чтобы начать игру", "Завершение игры", "Начать игру", "Отмена", "Об игре","Об авторе","Закрыть", "ЕРЕВАНСКИЙ ГОСУДАРСТВЕННЫЙ КОЛЛЕДЖ ИНФОРМАТИКИ", "Ученик` Нодар Оганесян", "Группа` 714", "Руководитель проекта` Петросян Артур", "Возможность проверить:"];
    var lang = $("#lang")[0].value;

    var aboutGameAM = "Դիցուք ունենք 9×9 չափի քառակուսի, որը բաժանված է 3×3 չափի քառակուսիների։ Քառակուսին ընդհանուր ունի 81 վանդակ։ Պետք է ազատ վանդակները լրացնել 1-9 թվերվ այնպես, որ չհամընկնեն ո՛չ հորիզոնական, ո՛չ ուղղահայաց և ո՛չ էլ 3×3 չափի քառակուսու մեջ։ Խաղը սկսելու համար պետք է սեղմել գլխավոր պատուհանաի ստորին աջ անկյան (+)կոճակը (կամ ընտրել <<Նոր խաղ>>-ը մենյուից), նշել խաղի բարդության աստիճանը և խաղի տեսակը։ Ընտրելով 'Ավարտով խաղ'-ը ըստ բարդության տրվում է խաղը ստուգելու սահմանապակ հնարավորություն, ինչը խաղը դարձնում է ավելի բարդ։"
    var aboutGameEN = "Suppose we have a 9 × 9 square, which is divided into 3 × 3 squares. The square has a total of 81 cells. The free cells should be filled with numbers 1-9 so that they do not overlap in a horizontal, vertical or 3 × 3 square. To start the game, click on the button in the lower right corner (+) of the main window (or select 'New Game' from the menu), specify the level of difficulty of the game և the type of game. Selecting 'Game at the end' according to the complexity gives a limited opportunity to check the game, which makes the game more complicated."
    var aboutGameRU = "Предположим, у нас есть квадрат 9 × 9, который разделен на квадраты 3 × 3. На площади 81 ячейка. Свободные ячейки должны быть заполнены числами 1-9, чтобы они не перекрывались горизонтальным, вертикальным или квадратом 3 × 3. Чтобы запустить игру, нажмите кнопку в правом нижнем углу (+) главного окна (или выберите в меню «Новая игра»), укажите уровень сложности игры և тип игры. Выбор «Игра в конце» в зависимости от сложности дает ограниченную возможность проверить игру, что усложняет игру."

    var diffNow = getDifficultiesValue();

    var gameStatus = $("#game-number").val();
    if(gameStatus == ""){
        gameStatus = "0";
    }

    if(lang == "am"){
        $("#project-name").html(langAM[0]);
        $("#new-game-label").html(langAM[1]);
        $("#hint-label").html(langAM[2]);
        $("#restart-label").html(langAM[3]);
        $("#surrender-label").html(langAM[4]);
        $("#timer-label").html(langAM[5]);
        $("#game-difficulty-label").html(langAM[6]);
        $("#remaining-label").html(langAM[7]);
        $("#check-label").html(langAM[8]);
        $("#pause-text").html(langAM[9]);
        $("#menu-sudoku-label").html(langAM[0]);
        $("#new_game_modal_title").html(langAM[1]);
        $("#new-game-difficulty").html(langAM[10]);
        $("#very-easy-label").html(langAM[11]);
        $("#easy-label").html(langAM[12]);
        $("#normal-label").html(langAM[13]);
        $("#hard-label").html(langAM[14]);
        $("#very-hard-label").html(langAM[15]);
        $("#game-type-label").html(langAM[16]);
        $("#finishing-gmame-label").html(langAM[17]);
        $("#start-game-label").html(langAM[18]);
        $("#cancel-game-label").html(langAM[19]);
        $("#exampleModalLongTitle").html(langAM[20]);
        $("#about-author-label").html(langAM[21]);
        $("#close-label").html(langAM[22]);
        $("#aboutAuthorModalLongTitle").html(langAM[21]);
        $("#collage-label").html(langAM[23]);
        $("#student-label").html(langAM[24]);
        $("#group-label").html(langAM[25]);
        $("#director-label").html(langAM[26]);
        $("#about-game-button-label").html(langAM[20]);
        $("#close-about-dialog-label").html(langAM[22]);
        $("#about-game-label").html(aboutGameAM);
        $("#rest-label").html(langAM[27]);
        $("#game-number").html("խաղ #" + gameStatus[gameStatus.length - 1]);
        if(diffNow == 0){
            $("#game-difficulty").html(langAM[11]);
        }else if(diffNow == 1){
            $("#game-difficulty").html(langAM[12]);
        }else if(diffNow == 2){
            $("#game-difficulty").html(langAM[13]);
        }else if(diffNow == 3){
            $("#game-difficulty").html(langAM[14]);
        }else if(diffNow == 4){
            $("#game-difficulty").html(langAM[15]);
        }
    }else if(lang == "en"){
        $("#project-name").html(langEN[0]);
        $("#new-game-label").html(langEN[1]);
        $("#hint-label").html(langEN[2]);
        $("#restart-label").html(langEN[3]);
        $("#surrender-label").html(langEN[4]);
        $("#timer-label").html(langEN[5]);
        $("#game-difficulty-label").html(langEN[6]);
        $("#remaining-label").html(langEN[7]);
        $("#check-label").html(langEN[8]);
        $("#pause-text").html(langEN[9]);
        $("#menu-sudoku-label").html(langEN[0]);
        $("#new_game_modal_title").html(langEN[1]);
        $("#new-game-difficulty").html(langEN[10]);
        $("#very-easy-label").html(langEN[11]);
        $("#easy-label").html(langEN[12]);
        $("#normal-label").html(langEN[13]);
        $("#hard-label").html(langEN[14]);
        $("#very-hard-label").html(langEN[15]);
        $("#game-type-label").html(langEN[16]);
        $("#finishing-gmame-label").html(langEN[17]);
        $("#start-game-label").html(langEN[18]);
        $("#cancel-game-label").html(langEN[19]);
        $("#exampleModalLongTitle").html(langEN[20]);
        $("#about-author-label").html(langEN[21]);
        $("#close-label").html(langEN[22]);
        $("#aboutAuthorModalLongTitle").html(langEN[21]);
        $("#collage-label").html(langEN[23]);
        $("#student-label").html(langEN[24]);
        $("#group-label").html(langEN[25]);
        $("#director-label").html(langEN[26]);
        $("#about-game-button-label").html(langEN[20]);
        $("#close-about-dialog-label").html(langEN[22]);
        $("#about-game-label").html(aboutGameEN);
        $("#rest-label").html(langEN[27]);
        $("#game-number").html("game #" + gameStatus[gameStatus.length - 1]);
        if(diffNow == 0){
            $("#game-difficulty").html(langEN[11]);
        }else if(diffNow == 1){
            $("#game-difficulty").html(langEN[12]);
        }else if(diffNow == 2){
            $("#game-difficulty").html(langEN[13]);
        }else if(diffNow == 3){
            $("#game-difficulty").html(langEN[14]);
        }else if(diffNow == 4){
            $("#game-difficulty").html(langEN[15]);
        }
    }else if(lang == "ru"){
        $("#project-name").html(langRU[0]);
        $("#new-game-label").html(langRU[1]);
        $("#hint-label").html(langRU[2]);
        $("#restart-label").html(langRU[3]);
        $("#surrender-label").html(langRU[4]);
        $("#timer-label").html(langRU[5]);
        $("#game-difficulty-label").html(langRU[6]);
        $("#remaining-label").html(langRU[7]);
        $("#check-label").html(langRU[8]);
        $("#pause-text").html(langRU[9]);
        $("#menu-sudoku-label").html(langRU[0]);
        $("#new_game_modal_title").html(langRU[1]);
        $("#new-game-difficulty").html(langRU[10]);
        $("#very-easy-label").html(langRU[11]);
        $("#easy-label").html(langRU[12]);
        $("#normal-label").html(langRU[13]);
        $("#hard-label").html(langRU[14]);
        $("#very-hard-label").html(langRU[15]);
        $("#game-type-label").html(langRU[16]);
        $("#finishing-gmame-label").html(langRU[17]);
        $("#start-game-label").html(langRU[18]);
        $("#cancel-game-label").html(langRU[19]);
        $("#exampleModalLongTitle").html(langRU[20]);
        $("#about-author-label").html(langRU[21]);
        $("#close-label").html(langRU[22]);
        $("#aboutAuthorModalLongTitle").html(langRU[21]);
        $("#collage-label").html(langRU[23]);
        $("#student-label").html(langRU[24]);
        $("#group-label").html(langRU[25]);
        $("#director-label").html(langRU[26]);
        $("#about-game-button-label").html(langRU[20]);
        $("#close-about-dialog-label").html(langRU[22]);
        $("#about-game-label").html(aboutGameRU);
        $("#rest-label").html(langRU[27]);
        $("#game-number").html("игра #" + gameStatus[gameStatus.length - 1]);
        if(diffNow == 0){
            $("#game-difficulty").html(langRU[11]);
        }else if(diffNow == 1){
            $("#game-difficulty").html(langRU[12]);
        }else if(diffNow == 2){
            $("#game-difficulty").html(langRU[13]);
        }else if(diffNow == 3){
            $("#game-difficulty").html(langRU[14]);
        }else if(diffNow == 4){
            $("#game-difficulty").html(langRU[15]);
        }
    }
}

function getLang(){
    return $("#lang")[0].value;
}


