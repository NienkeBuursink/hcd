const main = document.querySelector("main")
const recordBtn = document.querySelector(".record")
const soundClips = document.querySelector(".sound-clips")
const startAudioRecording = new Audio("audio/start-opname.mp3")
const stopAudioRecording = new Audio("audio/stop-opname.mp3")



// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
// MARK: Check mic availability
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
                if (!recordBtn.classList.contains("recording")) {
                    mediaRecorder.start()
                    startAudioRecording.play()
                    recordBtn.style.background = "red"
                    recordBtn.classList.add("recording")
                    recordBtn.textContent = "Stop opnemen"
                } else {
                    mediaRecorder.stop()
                    stopAudioRecording.play()
                    recordBtn.style.background = ""
                    recordBtn.classList.remove("recording")
                    recordBtn.textContent = "Opname starten"
                }
            }


            let chunks = []
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data)
            };


            // MARK: Add to HTML
            mediaRecorder.onstop = (e) => {
                const now = new Date()

                const formatter = new Intl.DateTimeFormat('nl-NL', { //ChatGPT prompt: Hoe maak je een voor de screenreader leesbare datum en tijd, zodat je niet alleen maar cijfers hoort.
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                })

                const readableDateTime = formatter.format(now)

                const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
                chunks = []
                const audioURL = window.URL.createObjectURL(blob)

                let audioHTML = `
                    <article class="audio-container">
                        <audio controls>
                            <source src="${audioURL}">
                            Je browser ondersteunt geen audio.
                        </audio>
                    </article>

                    <button class="delete-recording" type="button">Verwijder spraakopname</button>
                    <button type="submit">Verstuur spraakopname</button>`

                soundClips.insertAdjacentHTML("beforeend", audioHTML)

            }

            soundClips.addEventListener("click", (e) => {
                if (e.target && e.target.matches("button.delete-recording")) {
                    e.target.closest('.recording')?.remove() || (soundClips.innerHTML = '')
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
    if (e.target && e.target.matches("button[type='submit']")) {
        e.preventDefault()

        const article = e.target.previousElementSibling.previousElementSibling // je audio article
        const deleteBtn = soundClips.querySelector(".delete-recording")

        // Extra info
        const now = new Date()

        const formatter = new Intl.DateTimeFormat('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        })

        const readableDateTime = formatter.format(now)

        const whichPersonHTML = `<p>U:</p>`

        article.insertAdjacentHTML("afterbegin", whichPersonHTML) // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement#:~:text='beforebegin'%20%3A%20Before%20the%20targetElement,targetElement%20%2C%20after%20its%20last%20child.

        const extraInfoHTML = `
        <button aria-expanded="false" aria-controls="extra-info">
            Meer info
        </button>

        <div class="extra-info" hidden aria-live="polite">
            Dit bericht is geplaatst op 
            <time datetime="${now.toISOString()}">${readableDateTime}</time>.
        </div>`

        article.insertAdjacentHTML("beforeend", extraInfoHTML)

        // verplaats naar chat
        main.prepend(article)

        deleteBtn.remove()
        e.target.remove()
    }
})




//MARK: Extra info 
main.addEventListener("click", (e) => {
    if (e.target && e.target.matches("button[aria-expanded]")) {
        const button = e.target
        const article = button.closest('article')
        const content = article.querySelector('.extra-info')

        const isExpanded = button.getAttribute('aria-expanded') === 'true' // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded 

        button.setAttribute('aria-expanded', !isExpanded)
        content.hidden = isExpanded
    }
})