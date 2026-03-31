const main = document.querySelector("main")
const recordBtn = document.querySelector(".record")
const stopRecordingBtn = document.querySelector(".stop-recording")
const soundClips = document.querySelector(".sound-clips")



// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API

// MARK: check mic availability
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // console.log("getUserMedia supported.")
    navigator.mediaDevices
        .getUserMedia(
            // constraints - only audio needed for this app
            {
                audio: true,
            },
        )





        // Success callback
        .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);

            // MARK: recording
            recordBtn.onclick = () => {
                mediaRecorder.start()
                console.log(mediaRecorder.state)
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



            // MARK: Add to HTML
            mediaRecorder.onstop = (e) => {
                const now = new Date()
                const date = now.toLocaleDateString() // chatGPT prompt: how can i make the local date less long into just date and time strings?
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
                chunks = []
                const audioURL = window.URL.createObjectURL(blob)


                let audioHTML = 
                `<div class="audio-container">
                    <audio controls>
                        <source src="${audioURL}">
                        Je browser ondersteunt geen audio.
                    </audio>
                    <p>
                        U: <time>${date} ${time}</time>
                    </p>
                </div>
                <button class="delete-recording" type="button">Verwijder spraakopname</button>
                <button type="submit">Verstuur spraakopname</button>`

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




// MARK: Send Audio

soundClips.addEventListener("click", (e) => {
    const currentRecording = soundClips.querySelector(".audio-container")
    const deleteBtn = soundClips.querySelector(".delete-recording")
    if (e.target && e.target.matches("button[type='submit']")) {
        e.preventDefault()
        if (soundClips.hasChildNodes()) { //https://www.geeksforgeeks.org/javascript/how-to-check-if-an-element-has-any-children-in-javascript/
            console.log("send")
            
            main.prepend(currentRecording) // https://stackoverflow.com/questions/73543474/how-to-make-appendchild-method-on-top-of-elements
            deleteBtn.remove()
            e.target.remove()
        } else {
            console.log("no send")
        }  
    }
})