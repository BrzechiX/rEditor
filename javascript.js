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
    if(document.getElementById('cpu-select').value == "none"){
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
            "profile": document.getElementById('cpu-select').value
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
        } else {
            document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: green\">The program was compiled without errors</label>";
            let gathered = result.gathered;
            for (let key in gathered) {
            if (gathered.hasOwnProperty(key)) {
                let value = gathered[key][0];
                let binaryValue = value.toString(2);
                    console.log(binaryValue);
                    document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: white\">" + binaryValue + "</label>";
                }
            }
        }
    })
    .catch(error => {
        document.getElementById('console').innerHTML += "<br>" + "<label style=\"color: red\">" + error + "</label>";
    });
});
document.getElementById('cpu-select').addEventListener('change', function() {
    var selectedCPU = this.value;
    console.log(selectedCPU);
    editor.setOption("mode", selectedCPU);
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