var c = document.getElementById("canvas");
var cpBut = document.getElementById("cpBut");
var ctx = c.getContext("2d");
var avInput = document.getElementById("avNum");
var delBut = document.getElementById("delBut");
var selBut = document.getElementById("selectBut");
var showPoints = document.getElementById("showPoints");
var showLines = document.getElementById("showLines");
var showCurves = document.getElementById("showCurves");
var delPointBut = document.getElementById("delPointBut");
var newPointBut = document.getElementById("newPointBut");
var clearBut = document.getElementById("clearBut");

// bools de botoes
var clickedCp = false, clickedNp = false;

// variaveis globais que uso no addControlPoint - nao me julgue pf
var pointCount, prevPoint, curveCount = 0, qttPoints = 100;
var controlList = [], pointList = [];
var selectedCurve = -1;
var selectedPoint = -1;

// ================ EVENT LISTENERS ======================
avInput.addEventListener("keypress", (e) => {
    var key = e.which || e.keyCode;
    if(key == 13 && avInput.value != ""){
        qttPoints = avInput.value;
        avInput.blur();
    }
});

function cleanInput(){
    avInput.placeholder = avInput.value;
    avInput.value = "";
}

function addControlPoint(e){
    // ajeitando o problema de pegar a posicao com flexbox
    var posX = e.clientX - c.getBoundingClientRect().left;
    var posY = e.clientY - c.getBoundingClientRect().top;

    if(showPoints.checked) createCp([posX, posY], "#1e3f5a");
    controlList[curveCount][pointCount] = [posX,posY];
    // se tiver mais de um ponto, eu faco uma linha
    if(pointCount > 0){
        if(clickedCp) enableBut(cpBut);
        if(showLines.checked) createLine(prevPoint, [posX,posY], "#1e3f5a", 1);
        createCurve(curveCount);
    }
    prevPoint = [posX, posY];
    pointCount++;
}

c.addEventListener("mousedown", (e) => {
    if(selectedCurve != -1){
        var posX = e.clientX - c.getBoundingClientRect().left;
        var posY = e.clientY - c.getBoundingClientRect().top;

        for(var i = 0; i < controlList[selectedCurve].length; i++){
            if(posX <= controlList[selectedCurve][i][0] + 6 && posX >= controlList[selectedCurve][i][0] - 6){
                if(posY <= controlList[selectedCurve][i][1] + 6 && posY >= controlList[selectedCurve][i][1] - 6){
                    // achei esse ponto de controle nessa curva
                    selectedPoint = i;
                    delPointBut.style.visibility = 'visible';
                    drawExt();
                    c.addEventListener("mousemove", movingPoint);
                }
            }
        }
    }
});

function movingPoint(event){
    var newX = event.clientX - c.getBoundingClientRect().left;
    var newY = event.clientY - c.getBoundingClientRect().top;
    controlList[selectedCurve][selectedPoint] = [newX, newY];
    delete pointList[selectedCurve];
    createCurve(selectedCurve);
    c.addEventListener("mouseup", () => {
        c.removeEventListener("mousemove", movingPoint);
    });
}

// ================ FUNCOES DE DESENHO ======================

function createCp(point, color){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.arc(point[0], point[1], 6, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function createLine(pointA, pointB, color, size){
    ctx.beginPath();
    ctx.moveTo(pointA[0], pointA[1]);
    ctx.lineTo(pointB[0], pointB[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.stroke();
}

function createCurve(curveIndex){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawExt();
    if(controlList[curveIndex].length > 0){
        pointList[curveIndex] = [];
        for(var q = 0; q <= qttPoints; q++){
            var t = q/qttPoints;
            pointList[curveIndex][q] = deCast(t,curveIndex);
            if(q > 0 && showCurves.checked){
                if(curveIndex == selectedCurve) createLine(pointList[curveIndex][q-1], pointList[curveIndex][q], "#ffb347", 3);
                else createLine(pointList[curveIndex][q-1], pointList[curveIndex][q], "#69d0c8", 3);
            } 
        }
    }
}

function drawExt(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(showPoints.checked){
        for(var i = 0; i < controlList.length; i++){
            for(var j = 0; j < controlList[i].length; j++){
                if(i == selectedCurve && j == selectedPoint) createCp(controlList[i][j], "#000");
                else createCp(controlList[i][j], "#1e3f5a");
            }
        }
    }
    if(showLines.checked){
        for(var i = 0; i < controlList.length; i++){
            for(var j = 1; j < controlList[i].length; j++){
                createLine(controlList[i][j-1], controlList[i][j], "#1e3f5a", 1);
            }
        }
    }
    if(showCurves.checked){
        for(var i = 0; i < pointList.length; i++){
            if(i != curveCount && pointList[i] != undefined){
                for(var j = 1; j < pointList[i].length; j++){
                    if(i == selectedCurve) createLine(pointList[i][j-1], pointList[i][j], "#ffb347", 3);
                    else createLine(pointList[i][j-1], pointList[i][j], "#69d0c8", 3);
                }
            }
        }
    }
}

// ================ FUNCOES DE CLIQUE ======================

function cpClick(){
    if(!clickedCp){
        disableBut(cpBut);
        disableBut(clearBut);
        disableBut(newPointBut);
        disableBut(selBut);
        disableBut(delBut);
        disableBut(delPointBut);
        clickedCp = true;
        pointCount = 0;
        cpBut.innerHTML = "Pronto!";
        controlList[curveCount] = [];
        c.addEventListener("click", addControlPoint);
    } else {
        enableBut(clearBut);
        enableBut(newPointBut);
        enableBut(selBut);
        enableBut(delBut);
        enableBut(delPointBut);
        clickedCp = false;
        curveCount++;
        cpBut.innerHTML = "criar curva";
        c.removeEventListener("click", addControlPoint);
        selBut.style.visibility = 'visible';
    }
}

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // tirando curvas da memoria
    controlList = [];
    pointList = [];
    // caso a pessoa clicou nisso enquanto criava uma curva
    if(clickedCp){
        cpClick();
    }
    curveCount = 0;
    selectedCurve = -1;
    selectedPoint = -1;
    delBut.style.visibility = 'hidden';
    selBut.style.visibility = 'hidden';
    delPointBut.style.visibility = 'hidden';
    newPointBut.style.visibility = 'hidden';

}

function selButClick(){
    if(selectedCurve == curveCount-1){
        selectedCurve = 0;
    } else {
        selectedCurve++;
    }
    selectedPoint = [-1,-1];
    drawExt();
    delPointBut.style.visibility = 'hidden';
    delBut.style.visibility = 'visible';
    newPointBut.style.visibility = 'visible';
}

function delButClick(){
    controlList.splice(selectedCurve,1);
    pointList.splice(selectedCurve,1);
    selectedCurve = -1;
    curveCount--;
    newPointBut.style.visibility = 'hidden';
    delBut.style.visibility = 'hidden';
    delPointBut.style.visibility = 'hidden';
    if(curveCount == 0) selBut.style.visibility = 'hidden';
    drawExt();
}

function delpButClick(){
    controlList[selectedCurve].splice(selectedPoint,1);
    delete pointList[selectedCurve];
    selectedPoint = -1;
    createCurve(selectedCurve);
    delPointBut.style.visibility = 'hidden';
}

function npButClick(){
    if(!clickedNp){
        disableBut(cpBut);
        disableBut(clearBut);
        disableBut(selBut);
        disableBut(delBut);
        disableBut(delPointBut);
        clickedNp = true;
        newPointBut.innerHTML = "Curva feita.";
        pointCount = controlList[selectedCurve].length;
        prevPoint = controlList[selectedCurve][pointCount-1];
        curveCount = selectedCurve;
        c.addEventListener("click", addControlPoint);
    } else {
        enableBut(cpBut);
        enableBut(clearBut);
        enableBut(selBut);
        enableBut(delBut);
        enableBut(delPointBut);
        clickedNp = false;
        newPointBut.innerHTML = "Adicionar Pontos";
        curveCount = controlList.length;
        c.removeEventListener("click", addControlPoint);
    }
}

function scCheck(){
    var gambiarra = curveCount;
    curveCount = -1;
    drawExt();
    curveCount = gambiarra;
}

// ================ ALGORITMO DA CURVA ======================

function deCast(u,curveIndex){
    var n = controlList[curveIndex].length;
    var Q = [];

    for(var a = 0; a < n; a++){
        Q[a] = controlList[curveIndex][a].slice();
    }

    for(var k = 1; k < n; k++){
        for(var i = 0; i < n-k; i++){
            Q[i][0] = (1-u)*Q[i][0] + u*Q[i+1][0];
            Q[i][1] = (1-u)*Q[i][1] + u*Q[i+1][1];
        }
    }

    return Q[0];
}

// ================ COISAS DE CSS ======================
 function disableBut(but){
    but.disabled = true;
    but.style.backgroundColor = "#1e3f5a";
 }

 function enableBut(but){
    but.disabled = false;
    but.style.backgroundColor = "#69d0c8";
 }