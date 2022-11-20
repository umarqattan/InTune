// var emptyStreamReference = new MediaStream();
// var recorderReference = new MediaRecorder(emptyStreamReference);

// function getLocalStream() {
//     navigator.mediaDevices.getUserMedia({video: false, audio: true}).then((stream) => {
//         window.localStream = stream; // A
//         // window.localAudio.srcObject = stream; // B
//         // window.localAudio.autoplay = true; // C
//         console.log(stream);
//         recorderReference = new MediaRecorder(stream);
//         console.log("Start stream RefrecorderReference:");
//         console.log(recorderReference);
//     }).catch((err) => {
//         console.error(`you got an error: ${err}`)
//     });
// }

// function stopLocalStream() { 
//   recorderReference.stream.getAudioTracks().forEach(function(track){track.stop();});
//   window.localStream = null;
//   console.log("Stop stream RecorderReference: ");
//   console.log(recorderReference);
// }


// const btn = document.getElementById('enable-microphone-button');

// btn.addEventListener('click', function handleClick() { 
  
//   if (btn.value == "Enable Microphone") { 
//     btn.textContent = "Disable Microphone";
//     btn.value = "Disable Microphone";
//     setup();
//   } else if (btn.value == "Disable Microphone") { 
//     btn.textContent = "Enable Microphone";
//     btn.value = "Enable Microphone";
//     stopLocalStream();
//   }
// });



// let audioContext;
// let mic;
// let pitch;

// function setup() {
//   // noCanvas();
//   audioContext = getAudioContext();
//   mic = new p5.AudioIn();
//   mic.start(startPitch);
// }

// function startPitch() {
//   pitch = ml5.pitchDetection('./model', audioContext , mic.stream, modelLoaded);
// }

// function modelLoaded() {
//   select('#status').html('Model Loaded');
//   getPitch();
// }

// function getPitch() {
//   pitch.getPitch(function(err, frequency) {
//     if (frequency) {
//       select('#result').html(frequency);
//     } else {
//       select('#result').html('No pitch detected');
//     }
//     getPitch();
//   })
// }


