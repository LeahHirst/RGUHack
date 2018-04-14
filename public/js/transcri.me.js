// transcri.me.js - Text to Speech
function startTranscribing(socket) {
    var output = document.getElementById("output");
    var final_span = document.getElementById("final");
    var interim_span = document.getElementById("temp");
    var final_transcript = '';

    if (!('webkitSpeechRecognition' in window)) {
        upgrade();
    } else {
        console.log("Start recognition");
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
    
        
        recognition.onstart = function() {
            console.log("Started recognition");
        }
    
        recognition.onresult = function(event) {
            
            var interim_transcript = '';
        
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                } else {
                interim_transcript += event.results[i][0].transcript;
                
                }
            }
            if (interim_transcript == "") {
                socket.emit('final', final_transcript);
                console.log("end of statement");

                final_transcript = "";
            } else {
                socket.emit('interim', final_transcript + interim_transcript);
            }
        }
    
        recognition.onerror = function(event) { 
            console.log(event);
        }
    
        recognition.onend = function() { 
            console.log("Ended, restarting");
            setTimeout(() => { recognition.start() }, 300);
        }
        recognition.start();
    }
}