window.onload = function () {
    // 로컬 스토리지에서 마지막 표시 시간을 가져옴
    const lastShown = localStorage.getItem('updateMessageShown');
    const now = new Date();

    // 마지막 표시 시간이 없거나 하루가 지났을 경우 배너를 표시
    if (!lastShown || (now - new Date(lastShown)) > 24 * 60 * 60 * 1000) {
        document.getElementById('updateMessage').style.display = 'block';
        localStorage.setItem('updateMessageShown', now);
    }
}

function closeUpdateMessage() {
    document.getElementById('updateMessage').style.display = 'none';
}
