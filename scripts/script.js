const recordBtn = document.querySelector(".record")
const stopRecordingBtn = document.querySelector(".stop-recording")
const soundClips = document.querySelector(".sound-clips");
const sendBtn = document.querySelector("button[type='submit']")


// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // console.log("getUserMedia supported.");
    navigator.mediaDevices
        .getUserMedia(
            // constraints - only audio needed for this app
            {
                audio: true,
            },
        )





        // Success callback
        .then((stream) => {
            console.log(stream)
            const mediaRecorder = new MediaRecorder(stream);
            recordBtn.onclick = () => {
                mediaRecorder.start()
                console.log(mediaRecorder.state)
                console.log("recorder started")
                recordBtn.style.background = "red"
            }


            let chunks = []
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data)
            };


            stopRecordingBtn.onclick = () => {
                mediaRecorder.stop();
                recordBtn.style.background = ""
                console.log(mediaRecorder.state)
            }


            mediaRecorder.onstop = (e) => {
                const now = new Date()
                const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
                chunks = []
                const audioURL = window.URL.createObjectURL(blob)


                let audioHTML = 
                `<p>
                    Spraakopname van 
                    <time datetime="${now}">${now}</time>
                </p>
                <audio controls>
                    <source src="${audioURL}">
                    Je browser ondersteunt geen audio.
                </audio>
                <button class="delete-recording" type="button">Verwijder spraakopname</button>`

                soundClips.insertAdjacentHTML("beforeend", audioHTML)

            }

            soundClips.addEventListener("click", (e) => {
                if (e.target && e.target.matches("button.delete-recording")) {
                    console.log("remove")
                    soundClips.innerHTML = '' // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
                }
            })
        })






        // Error callback
        .catch((err) => {
            console.error(`The following getUserMedia error occurred: ${err}`)
        })
} else {
    console.log("getUserMedia not supported on your browser!")
}
