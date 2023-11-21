// TODO: Show other person connection state.
const socketIO = io();

let unansweredMessage = undefined;
let showingMessage = undefined; // TODO: Send error if message arrives while we are showing message.
let servoOn = false;
// TODO: Send back a message when message is received

// Reset button listener stuff
let isResetButtonLongPressed = false;
let resetButtonTimer;
document.getElementById("resetButton").addEventListener('touchstart', () => {
    clearTimeout(resetButtonTimer);
    resetButtonTimer = setTimeout(() => {
        isResetButtonLongPressed = true;
        document.getElementById("resetButton").style.backgroundColor = 'rgba(255, 255, 0, 0.3)'
    }, 2000);
}, false);

document.getElementById("resetButton").addEventListener('touchend', () => {
    clearTimeout(resetButtonTimer);
    if (isResetButtonLongPressed) {
        socketIO.emit('refreshPage');
    }
    document.getElementById("resetButton").style.backgroundColor = 'rgba(255, 255, 0, 0)'
    isResetButtonLongPressed = false;
}, false);

function getSequenceName() {
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    return `sequence${randomNumber}`;
}

function imcomingMessageServo(type, count) {
    servoOn = true;
    socketIO.emit('servoEvent', type, (response) => {
        servoOn = false;
        console.log('--------- imcomingMessageServo callback', response);
        if (response === 'update') {
            // TODO: Guard this
            return true;
        } else if (response === 'done') {
            if (showingMessage || (count < 4 && count !== -1)) {
                setTimeout(() => {
                    if (!showingMessage) {
                        imcomingMessageServo(getSequenceName(), showingMessage ? -1 : count + 1);
                    }
                }, showingMessage ? 100 : 10000);
            } else {
                // Message expires so we need to clear everything
                unansweredMessage = data;
            }
        }

        return true;
    });
}

function showMessage() {
    if (unansweredMessage && !showingMessage) {
        showingMessage = true;
        document.getElementById("messageText").innerHTML = unansweredMessage;

        const container = document.getElementById("container");
        messageDiv.style.display = "flex";
        messageDiv.style.backgroundColor = "#ff0000";

        socketIO.emit('messageRead');
        console.log('WE ARE INSIDE SHOW MESSAGE 1');
        socketIO.emit('servoEvent', getSequenceName(), (response) => {
            console.log('WE ARE INSIDE SHOW MESSAGE 2', response);
            if (response === 'done') {
                console.log('WE ARE INSIDE SHOW MESSAGE 3');
                messageDiv.style.display = "none";
                showingMessage = false;
                unansweredMessage = undefined;
            }
        });
    }
}

document.getElementById("container").addEventListener('click', () => {
    console.log('SCREEN PRESSED');
    if (unansweredMessage && !showingMessage) {
        showMessage();
    }
}, true);

socketIO.on('connect', () => {
    socketIO.emit('connectionRequest', { role: 'receiver' }, (response) => {
        if (response === 'receiver') {
            console.log('Success setting receiver role');
            document.getElementById("connectionStatus").style.backgroundColor = "#00ff00";
        } else {
            document.getElementById("connectionStatus").style.backgroundColor = "#ff0000";
            console.error('Error setting sender role. Received', response);
            alert('Error setting sender role');
        }
    });
})

socketIO.on('disconnect', () => {
    console.log('Disconnected');
    document.getElementById("connectionStatus").style.backgroundColor = "#ff0000";
});


socketIO.on('displayLove', function (data, callback) {
    console.log('DisplayLove arrived', data);
    unansweredMessage = data;

    imcomingMessageServo(getSequenceName(), 0);

    callback();
});
