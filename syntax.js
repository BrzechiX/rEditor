function fetchProfileCommands(profileName) {
    return new Promise((resolve, reject) => {
        fetch(`./profiles/${profileName}.jsonc`)
        .then(response => response.text())
        .then(text => {
            let commandsArray = [];
            text = JSON.parse(text);
            for (let command in text.CPU.COMMANDS) {
                if (text.CPU.COMMANDS.hasOwnProperty(command)) {
                    let pattern = text.CPU.COMMANDS[command].pattern;
                    let firstWord = pattern.split(' ')[0];
                    commandsArray.push(firstWord);
                }
            }
            commandsArray.sort((a, b) => b.localeCompare(a));
            resolve(commandsArray);
        })
        .catch(error => {
            console.error('Error: ', error);
            reject(error);
        });
    });
}

(async function() {
    let potadosCommands = await fetchProfileCommands('potados');
    CodeMirror.defineMode("potados", function() {
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
                    return "wymysllorda";
                }

                if (stream.match(/^[a-zA-Z_]\w*:/)) {
                    return "label";
                }

                if (stream.match(',')) {
                    return "comma";
                }

                for (var i = 0; i < potadosCommands.length; i++) {
                    if (stream.match(potadosCommands[i])) {
                        return "keyword";
                    }
                }

                if (stream.match(/\b([a-zA-Z][a-zA-Z0-9]*)\b/)) {
                    return;
                }

                if (stream.match(/(?<![a-zA-Z0-9])\d+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0[0-7]+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0b[01]+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0x[\da-fA-F]+(?![a-zA-Z0-9])/)) {
                    return "number";
                }

                stream.next();
                return null;
            }
        };
    });
    let cpu5Commands = await fetchProfileCommands('cpu5');
    CodeMirror.defineMode("cpu5", function() {
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
                    return "wymysllorda";
                }

                if (stream.match(/^[a-zA-Z_]\w*:/)) {
                    return "label";
                }

                if (stream.match(',')) {
                    return "comma";
                }

                for (var i = 0; i < cpu5Commands.length; i++) {
                    if (stream.match(cpu5Commands[i])) {
                        return "keyword";
                    }
                }

                if (stream.match(/\b([a-zA-Z][a-zA-Z0-9]*)\b/)) {
                    return;
                }

                if (stream.match(/(?<![a-zA-Z0-9])\d+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0[0-7]+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0b[01]+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0x[\da-fA-F]+(?![a-zA-Z0-9])/)) {
                    return "number";
                }

                stream.next();
                return null;
            }
        };
    });
    let pm1Commands = await fetchProfileCommands('pm1');
    CodeMirror.defineMode("pm1", function() {
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

                for (var i = 0; i < pm1Commands.length; i++) {
                    if (stream.match(pm1Commands[i])) {
                        return "keyword";
                    }
                }

                if (stream.match(/\b([a-zA-Z][a-zA-Z0-9]*)\b/)) {
                    return;
                }

                if (stream.match(/(?<![a-zA-Z0-9])\d+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0[0-7]+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0b[01]+(?![a-zA-Z0-9])/) || 
                    stream.match(/(?<![a-zA-Z0-9])0x[\da-fA-F]+(?![a-zA-Z0-9])/)) {
                    return "number";
                }

                stream.next();
                return null;
            }
        };
    });
})();
