CodeMirror.defineMode("mineasm", function() {
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

            if (stream.match(/^\d+/)) {
                return "number";
            }

            if (stream.match(/^#[a-zA-Z_]\w*/) || stream.match(/^\.[a-zA-Z_]\w*/)) {
                return "metaa";
            }

            if (stream.match(/^[a-zA-Z_]\w*:/)) {
                return "label";
            }

            var keywords = ["cmp", "jz", "push", "pop", "add", "rsh", "mov", "dec", "inc", "sub", "jne", "call", "ret", "int", "jge", "jle", "jl", "jg", "jmp", "je", "jne", ","];
            for (var i = 0; i < keywords.length; i++) {
                if (stream.match(keywords[i])) {
                    return "keyword";
                }
            }

            stream.next();
            return null;
        }
    };
});
