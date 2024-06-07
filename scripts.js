function terminalPrint(message, color) {
    const consoleElement = document.getElementById('console');
    const messageElement = document.createElement('label');
    messageElement.style.color = color;
    messageElement.innerHTML = message;
    consoleElement.innerHTML += "<br>";
    consoleElement.appendChild(messageElement);
}

function filterComments(formatted, formatted_comments) {
    let filtered_comments = [];
    for (let i = 0; i < formatted_comments.length; i++) {
        if (!formatted.includes(formatted_comments[i])) {
            filtered_comments.push(formatted_comments[i]);
        }
    }
    return filtered_comments;
}

function tabulate(array) {
    const maxColumnLengths = array.reduce((acc, row) => {
        row.forEach((col, index) => {
            acc[index] = Math.max(acc[index] || 0, col.length);
        });
        return acc;
    }, []);

    const paddedArray = array.map(row => {
        return row.map((col, index) => {
            const paddingLength = maxColumnLengths[index] - col.length;
            return col + ' '.repeat(paddingLength);
        });
    });
    const result = paddedArray.map(row => row.join(' '));
    return result;
}

function formatOutput(data) {
    const d = data.output.map(item => item.formatted.concat("<label>", filterComments(item.formatted, item.formatted_comments), "</label>"));
    const lines = tabulate(d)
    
    terminalPrint(lines.join("<br>").replace(/ /g, '&nbsp;'), "white");
}

function changeCommentVisibility(){
    if (document.getElementById("change-comment-visibility").innerHTML == "Hide comments"){
        document.querySelectorAll('#console > label > label').forEach(element => {
            element.style.visibility = 'hidden';
            element.style.fontSize = '0';
        });
        document.getElementById("change-comment-visibility").innerHTML = "Show comments";
    }
    else{
        document.querySelectorAll('#console > label > label').forEach(element => {
            element.style.visibility = 'visible';
            element.style.fontSize = '100%';
        });
        document.getElementById("change-comment-visibility").innerHTML = "Hide comments";
    }
}

async function fetchProfileData(profileName) {
    try {
        const response = await fetch(`./profiles/${profileName}.jsonc`);
        const text = await response.text();
        const data = JSON.parse(text);

        const commandsArray = Object.values(data.CPU.COMMANDS).map(command => command.pattern.split(' ')[0]);
        commandsArray.sort((a, b) => b.localeCompare(a));

        const definesArray = Object.values(data.CPU.DEFINES).map(define => Array.isArray(define) ? define[0] : define);
        definesArray.sort((a, b) => b.localeCompare(a));

        console.log(`Data for ${profileName} loaded.`);
        return { data, commands: commandsArray, defines: definesArray };
    } catch (error) {
        console.error('Error:', error);
        terminalPrint(error, "red");
        throw error;
    }
}

function defineMode(profileName, profileData) {
    CodeMirror.defineMode(profileName, function() {
        return {
            startState: function() {
                return {
                    inString: false
                };
            },
            token: function(stream, state) {
                if (stream.eatSpace()) return null;

                if (stream.match("//")) {
                    stream.skipToEnd();
                    return "comment";
                }

                if (!state.inString && stream.match('"')) {
                    state.inString = true;
                }
                if (state.inString) {
                    if (stream.skipTo('"')) {
                        stream.next();
                        state.inString = false;
                    } else {
                        stream.skipToEnd();
                    }
                    return "string";
                }

                if (stream.match(/^#[a-zA-Z_]\w*/)) {
                    return "preprocessor";
                }

                if (stream.match(/^\.[a-zA-Z_]\w*/)) {
                    return "entrypoint";
                }

                if (stream.match(/^[a-zA-Z_]\w*:/)) {
                    return "label";
                }

                if (stream.match(',')) {
                    return "comma";
                }

                for (let command of profileData.commands) {
                    if (stream.match(new RegExp("^" + command + "\\b"))) {
                        return "keyword";
                    }
                }

                for (let define of profileData.defines) {
                    if (stream.match(new RegExp("^" + define + "\\b"))) {
                        return "define";
                    }
                }

                if (stream.match(/\b([a-zA-Z][a-zA-Z0-9]*)\b/)) {
                    return null;
                }

                if (stream.match(/(?<![a-zA-Z0-9])\d+(?![a-zA-Z0-9]|_)/) ||
                    stream.match(/(?<![a-zA-Z0-9])0b[01]+(?![a-zA-Z0-9]|_)/) ||
                    stream.match(/(?<![a-zA-Z0-9])0x[\da-fA-F]+(?![a-zA-Z0-9]|_)/)) {
                    return "number";
                }

                stream.next();
                return null;
            }
        };
    });
}

const profiles = ['potados', 'cpu5', 'pm1'];
let profileDataCache = {};

(async function() {
    const profileDataPromises = profiles.map(profile => fetchProfileData(profile));
    const profileDataArray = await Promise.all(profileDataPromises);

    profiles.forEach((profile, index) => {
        profileDataCache[profile] = profileDataArray[index];
        defineMode(profile, profileDataArray[index]);
    });
})();

const resizer = document.querySelector('.resizer');
const container = document.querySelector('.container');
const editorContainer = document.querySelector('.editor-container');
const consoleElement = document.getElementById('console');

let isResizing = false;
let editorHeightRatio = 0.7;
let consoleHeightRatio = 0.3;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resizePanels);
    document.addEventListener('mouseup', stopResizing);
});

function resizePanels(e) {
    if (!isResizing) return;

    const containerRect = container.getBoundingClientRect();
    const newEditorHeight = e.clientY - containerRect.top;
    const newConsoleHeight = containerRect.bottom - e.clientY - resizer.offsetHeight;

    if (newEditorHeight > 50 && newConsoleHeight > 50) {
        editorContainer.style.height = `${newEditorHeight}px`;
        consoleElement.style.height = `${newConsoleHeight - 20}px`;
        container.style.gridTemplateRows = `${newEditorHeight}px 5px ${newConsoleHeight}px`;

        const totalHeight = containerRect.height;
        editorHeightRatio = newEditorHeight / totalHeight;
        consoleHeightRatio = newConsoleHeight / totalHeight;
    }
}

function stopResizing() {
    isResizing = false;
    document.removeEventListener('mousemove', resizePanels);
    document.removeEventListener('mouseup', stopResizing);
}

window.addEventListener('resize', () => {
    const containerRect = container.getBoundingClientRect();
    const newEditorHeight = containerRect.height * editorHeightRatio;
    const newConsoleHeight = containerRect.height * consoleHeightRatio;

    editorContainer.style.height = `${newEditorHeight}px`;
    consoleElement.style.height = `${newConsoleHeight - 20}px`;
    container.style.gridTemplateRows = `${newEditorHeight}px 5px ${newConsoleHeight}px`;
});

var editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    lineNumbers: true,
    mode: "potados",
    theme: "dracula"
});

document.getElementById('open-btn').addEventListener('click', function() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lor';
    input.onchange = function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function() {
            editor.setValue(reader.result);
        };
        reader.readAsText(file);
    };
    input.click();
});

document.getElementById('save-btn').addEventListener('click', function() {
    var text = editor.getValue();
    var blob = new Blob([text], {type: 'lor'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'code.lor';
    link.click();
});

async function compile(method){
    if (selectedCpu == "none") {
        terminalPrint("No profile provided", "red");
        return;
    }

    try {
        const response = await fetch('https://reditor.redstonefun.pl/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "code": editor.getValue(),
                "method": method,
                "profile": selectedCpu
            })
        });

        let result = await response.text();
        try {
            result = JSON.parse(result);
        } catch (e) {
            consoleElement.innerHTML += "<br>" + result;
        }

        if (result.error) {
            terminalPrint(result.error, "red");
        } else if (result.gathered) {
            terminalPrint("The program was compiled without errors", "green");
            console.log(result.output);
            formatOutput(result);
        } else {
            terminalPrint("An error occurred", "red");
        }
    } catch (error) {
        terminalPrint(error, "red");
    }
}

document.getElementById('compile-btn').addEventListener('click', async function() {
    compile("compile");
});

document.getElementById('compile-download-schem-btn').addEventListener('click', async function() {
    compile("compile-download-schem");
});

document.getElementById('compile-download-bin-btn').addEventListener('click', async function() {
    compile("compile-download-bin");
});

function loadExample() {
    fetch('./example.lor')
        .then(response => response.text())
        .then(text => {
            editor.setValue(text);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker OK');
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    var menuButtons = document.querySelectorAll(".menu-button");

    menuButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            var dropdownContent = this.nextElementSibling;
            var openDropdown = document.querySelector(".dropdown-content.show");
            if (openDropdown && openDropdown !== dropdownContent) {
                openDropdown.classList.remove("show");
            }
            dropdownContent.classList.toggle("show");
        });
    });

    window.onclick = function(event) {
        if (!event.target.matches('.menu-button')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
});
