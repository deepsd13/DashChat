const p_socket = io()

function CustomAlert() {
    this.render = function(dialog) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');
        dialogoverlay.style.display = "block";
        dialogoverlay.style.height = winH + "px";
        dialogbox.style.top = (winH / 2) - 270 + "px"

        // dialogbox.style.left = (winW / 2) - (550 * .5) + "px";
        // dialogbox.style.top = "100px";
        dialogbox.style.display = "block";
        document.getElementById('dialogboxhead').innerHTML = "Acknowledge This Message";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Alert.ok()">OK</button>';
    }
    this.ok = function() {
        // document.getElementById('dialogbox').style.display = "none";
        // document.getElementById('dialogoverlay').style.display = "none";
        location = '/index.html'
    }
}
var Alert = new CustomAlert();

function CustomConfirm() {
    this.render = function(dialog, funcName, email, password) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');
        dialogoverlay.style.display = "block";
        dialogoverlay.style.height = winH + "px";
        dialogbox.style.top = (winH / 2) - 270 + "px"
        dialogbox.style.display = "block";

        document.getElementById('dialogboxhead').innerHTML = "Confirm that action";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Confirm.yes(\'' + funcName + '\',\'' + email + '\',\'' + password + '\')">Yes</button> <button onclick="Confirm.no()">No</button>';
    }
    this.no = function() {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";
    }
    this.yes = function(funcName, email, password) {
        if (funcName === 'leaveRoom') {
            window.location = `/join.html?email=${email}&password=${password}`
            p_socket.emit(funcName, { email, roomName })
        } else {
            window.location = '/index.html'
            p_socket.emit(funcName, { email, roomName })
        }

    }
}
var Confirm = new CustomConfirm();