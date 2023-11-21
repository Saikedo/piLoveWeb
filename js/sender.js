const socketIO = io();

function showHideModal(variation) {
    var modal = document.getElementById("loadingModal");
    if (variation !== 'hide') {
        modal.style.display = "block";
        document.getElementById("modalLoading").style.display = variation === 'load' ? 'flex' : 'none';
        document.getElementById("modalSuccess").style.display = variation === 'success' ? 'flex' : 'none';
        document.getElementById("modalTimeout").style.display = variation === 'timeout' ? 'flex' : 'none';
    } else {
        modal.style.display = "none";
    }
}

function onSendPressed() {
    const message = document.getElementById("messageBox").value;
    showHideModal('load');
    const timeout = setTimeout(() => {
        showHideModal('timeout');
        setTimeout(() => showHideModal('hide'), 3000);
    }, 3000);
    console.log('Send pressed: ' + message);
    socketIO.emit("sendLove", message, (responseData) => {
        clearTimeout(timeout);
        console.log('Callback called with data:', responseData);
        showHideModal('success');
        setTimeout(() => showHideModal('hide'), 3000);
    });
}

socketIO.on('connect', () => {
    // TODO: Show connect state in the page.
    socketIO.emit('connectionRequest', { role: 'sender' }, (response) => {
        if (response === 'sender') {
            console.log('Success setting sender role');
            document.getElementById("connectionStatus").innerHTML = "Connected";
        } else {
            document.getElementById("connectionStatus").innerHTML = "Disconnected";
            console.error('Error setting sender role. Received', response);
            alert('Error setting sender role');
        }
    });
})

socketIO.on('disconnect', () => {
    console.log('Disconnected');
    document.getElementById("connectionStatus").innerHTML = "Disconnected";
});

socketIO.on('displayLove', function (data) { 
    console.log('DisplayLove arrived', data);
});

socketIO.on('messageRead', () => {
    console.log('TODO: Test this: Message Read');
});

socketIO.on('receiverConnectionState', function (data) {
    console.log('Receiver connection state', data);

    document.getElementById("receiverConnectionStatus").innerHTML = `${data ? 'Connected' : 'Disconnected'}`;
});