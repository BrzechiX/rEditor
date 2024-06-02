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

document.getElementById('compile-btn').addEventListener('click', function() {
    if(selectedCpu == "none"){
        document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: red\">No profile provided</label>";
        return;
    }
    fetch('https://reditor.redstonefun.pl/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "code": editor.getValue(),
            "profile": selectedCpu
        })
    })
    .then(response => response.text())
    .then(result => {
        try {
            result = JSON.parse(result);
            console.log(result);
        } catch (e) {
            consoleElement.innerHTML += "<br>" + result;
        }
        if (result.error) {
            document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: red\">" + result.error + "</label>";
        } else if(result.gathered) {
            document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: green\">The program was compiled without errors</label>";
            let gathered = result.gathered;
            for (let key in gathered) {
                if (gathered.hasOwnProperty(key)) {
                    let value = gathered[key][0];
                    fetch(`./profiles/${selectedCpu}.jsonc`)
                    .then(response => response.text())
                    .then(text => {
                        text = JSON.parse(text);
                        let binLen = text.CPU.ADRESSING.bin_len;
                        let binaryValue = value.toString(2).padStart(binLen, '0');
                        console.log(binaryValue);
                        document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: white\">" + binaryValue + "</label>";
                    });
                }
            }
        }
        else {
            document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: red\">An error occured</label>";
        }
    })
    .catch(error => {
        document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: red\">" + error + "</label>";
    });
});

function loadExample(){
    fetch('./example.lor').then(response => {
        return response.text();
    }).then(text => {
        editor.setValue(text);
    }).catch(error => {
        console.error('Error: ', error);
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