const { contextBridge, ipcRenderer } = require('electron');

let intervalId = 0;

function getLastAnswer() {
    let answers = document.querySelectorAll(".group.dark\\:bg-\\[\\#444654\\] div.whitespace-pre-wrap");

    return answers[answers.length - 1].textContent;
}

function getStatus() {
    return document.querySelector("form button>div").textContent;
}

function stopGenerate() {
    return new Promise((resolve, reject) => {
        let pollingId = 0;
        if (getStatus() === 'Stop generating' && intervalId > 0) {
            document.querySelector("form button>div").click();
            clearInterval(intervalId);
            intervalId = 0;

            pollingId = setInterval(() => {
                let status = getStatus();
                if (status === 'Regenerate response') {
                    clearInterval(pollingId);
                    resolve();
                }
            }, 500);
        }
    });
}


window.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded");
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }


    ipcRenderer.on('test', (event, arg) => {
        ipcRenderer.send('set-title', 'Hello World');
    });


    ipcRenderer.on('focus-input', async (event, arg) => {
        const enterEvent = new KeyboardEvent('keydown', { key: "Enter" });
        const inputEl = document.querySelector("form textarea");

        if (intervalId > 0) {
            await stopGenerate();
        }

        inputEl.value = arg;
        inputEl.dispatchEvent(enterEvent);
        inputEl.focus();

        intervalId = setInterval(() => {
            let status = getStatus();
            if (status === 'Stop generating') {
                console.log("Generating ...");
            }
            if (status === 'Regenerate response'
                || status === null) {
                console.log("Done");
                let answer = getLastAnswer();
                ipcRenderer.send('gpt-answer', answer);
                clearInterval(intervalId);
                intervalId = 0;
            }
        }, 500);

    });
});