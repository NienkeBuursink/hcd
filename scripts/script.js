const main = document.querySelector("main")
const recordBtn = document.querySelector(".record")
const soundClips = document.querySelector(".sound-clips")
const deleteAllRecordings = document.querySelector(".delete-all")
const links = document.querySelectorAll("a")


const startAudioRecording = new Audio("audio/start-opname.mp3")
const stopAudioRecording = new Audio("audio/stop-opname.mp3")
const sendMesage = new Audio("audio/send.mp3")
const expandSound = new Audio("audio/grow.mp3")
const collapseSound = new Audio("audio/shrink.mp3")
const pageSound = new Audio("audio/swap-screen.mp3")
const deleteSound = new Audio("audio/delete.mp3")
const deleteAllSound = new Audio("audio/delete-all.mp3")
const inputSound = new Audio("audio/input-sound.mp3")

links.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault()
        pageSound.play()

        const url = link.href

        setTimeout(() => {
            window.location.href = url
        }, 1500)
    })
})


let fullTranscript = ""



// MARK: Check microphone availability
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
        .getUserMedia(
            // constraints - only audio needed for this app
            {
                audio: true,
            },
        )



        // Success callback
        .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream)

            // https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
            const recognition = new SpeechRecognition()

            recognition.lang = "nl-NL"
            recognition.continuous = true
            recognition.interimResults = true
            recognition.maxAlternatives = 1



            // MARK: recording
            recordBtn.onclick = () => {
                if (!recordBtn.classList.contains("recording")) {
                    mediaRecorder.start()
                    recognition.start()
                    startAudioRecording.volume = 0.5
                    startAudioRecording.play()
                    recordBtn.style.background = "red"
                    recordBtn.classList.add("recording")
                    recordBtn.textContent = "Stop opnemen"
                } else {
                    mediaRecorder.stop()
                    recognition.stop()
                    stopAudioRecording.play()
                    recordBtn.style.background = ""
                    recordBtn.classList.remove("recording")
                    recordBtn.textContent = "Opname starten"
                }
            }


            let chunks = []
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data)
            }

            recognition.onstart = () => console.log("speech started")
            recognition.onend = () => console.log("speech ended")
            recognition.onerror = (e) => console.log("speech error:", e.error, e.message)

            recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1]

                if (result.isFinal) {
                    fullTranscript += result[0].transcript + " "
                }
            }




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

                const blob = new Blob(chunks, { type: "audio/ogg codecs=opus" })
                chunks = []
                const audioURL = window.URL.createObjectURL(blob)

                let audioHTML = `
                <li>
                    <article class="audio-container" tabindex="0">
                        <audio controls>
                            <source src="${audioURL}">
                            Je browser ondersteunt geen audio.
                        </audio>
                    </article>

                    <button class="delete-recording" type="button">Verwijder spraakopname</button>
                    <button type="submit">Verstuur spraakopname</button>
                </li>`

                soundClips.insertAdjacentHTML("beforeend", audioHTML)
                
                if(soundClips.querySelectorAll('li').length > 1){
                    deleteAllRecordings.style.display = 'block'
                }
                
                fullTranscript = ""
            }

            soundClips.addEventListener("click", (e) => {
                const li = e.target.closest('li')
                if(li){
                    li.remove()
                    deleteSound.play()
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

        const article = e.target.previousElementSibling.previousElementSibling // https://developer.mozilla.org/en-US/docs/Web/API/Element/previousElementSibling
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

        const whichPersonHTML = `<h2>U stuurt audio:</h2>`

        article.insertAdjacentHTML("afterbegin", whichPersonHTML) // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement#:~:text='beforebegin'%20%3A%20Before%20the%20targetElement,targetElement%20%2C%20after%20its%20last%20child.

        const extraInfoHTML = `
        <button aria-expanded="false" aria-hidden="true" aria-controls="extra-info">
            Meer info
        </button>

        <ul class="extra-info" hidden aria-live="polite">
            <li> Dit bericht is geplaatst op <time datetime="${now.toISOString()}">${readableDateTime}</time>.</li>
            <li><p class="transcript"></p></li>
        </ul>`

        sendMesage.play()
        article.insertAdjacentHTML("beforeend", extraInfoHTML)

        const transcript = article.querySelector(".transcript")

        if (fullTranscript.trim() !== "") {
            transcript.textContent = fullTranscript
        } else {
            transcript.remove()
        }

        // verplaats naar chat
        main.append(article)

        const li = e.target.closest("li")
        
        li.remove()
        deleteBtn.remove()
        e.target.remove()
    }
})





//MARK: Remove all audios
deleteAllRecordings.addEventListener("click", () => {
    soundClips.innerHTML = ''
    deleteAllRecordings.style.display = 'none'
    deleteAllSound.play()
})





//MARK: Extra info 
// https://stackoverflow.com/questions/2511388/how-can-i-add-a-keyboard-shortcut-to-an-existing-javascript-function
function toggleExtraInfo(message, forceClose = false) {
    const button = message.querySelector("button[aria-expanded]")
    const content = message.querySelector(".extra-info")
    if (!button || !content) return

    const isOpen = button.getAttribute("aria-expanded") === "true"

    const shouldClose = forceClose || isOpen

    button.setAttribute("aria-expanded", !shouldClose)
    content.hidden = shouldClose

    if (shouldClose && isOpen) {
        collapseSound.currentTime = 0
        collapseSound.play()
    } else if (!shouldClose) {
        expandSound.currentTime = 0
        expandSound.volume = 0.3
        expandSound.play()
    }
}

// shortcut met y
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "y") return

    const message = document.activeElement.closest("article")
    if (!message) return

    toggleExtraInfo(message)
})

// gewone klik
document.addEventListener("click", (e) => {
    const button = e.target.closest("button[aria-expanded]")
    if (!button) return

    toggleExtraInfo(button.closest("article"))
})

// wegtabben
document.addEventListener("focusout", (e) => {
    const chat = e.target.closest("article")
    if (!chat) return

    if (chat.contains(e.relatedTarget)) return

    toggleExtraInfo(chat, true)
})





//MARK: Search for audio
//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search
const searchBar = document.querySelector("input[type='search']")

searchBar.addEventListener("input", () => {
    inputSound.currentTime = 0
    inputSound.play()
    const searchTerm = searchBar.value.toLowerCase()
    const searchArticles = document.querySelectorAll("article")

    searchArticles.forEach(article => {
        const text = article.textContent.toLowerCase()

        if (text.includes(searchTerm)) {
            article.style.display = "block"
        } else {
            article.style.display = "none"
        }
    })
})