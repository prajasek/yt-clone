console.log("test")

const playPauseBtn = document.querySelector(".play-pause-btn");
const video = document.querySelector('video');
const vidContainer = document.querySelector('.video-container')
const theaterBtn = document.querySelector('.theater-btn')
const miniBtn = document.querySelector('.mini-player-btn')
const fullScreenBtn = document.querySelector('.full-screen-btn')
const muteBtn = document.querySelector('.volume')
const volSlider = document.querySelector('.volume-slider')
const currentTimeElem = document.querySelector('.current-time')
const totalTimeElem = document.querySelector('.total-time')
const timelineContainer = document.querySelector('.timeline-container')
const previewImg = document.querySelector('.preview-img')
const thumbnailImg = document.querySelector('.thumbnail-img')

console.log(window.getComputedStyle(vidContainer).width)


document.addEventListener('keydown', e => {
    const tagActive = document.activeElement.tagName.toLowerCase()
    if (tagActive == 'input') return

    switch (e.key.toLowerCase()) {
        case ' ':  
            if (tagActive == 'button') return
        case 'k':
            togglePlay();     
            break;    
        case 'i':
            toggleMini();
            break;
        case 't':
            toggleTheater();
            break;
        case 'f':
            toggleFullScreen();
            break;
        case 'm':
            toggleMute();
            break;
        default:
            console.log("h")
    }
})

let isScrubbing = false; 

timelineContainer.addEventListener('mousemove', handleTimelineUpdate )
timelineContainer.addEventListener('mousedown', toggleScrubbing)
document.addEventListener('mouseup', e => {
    if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener('mousemove', e => {
    if (isScrubbing) handleTimelineUpdate(e)
    console.log("DOC MM")

} )



function toggleScrubbing(e) {
    const rect = timelineContainer.getBoundingClientRect(); 
    const percent = Math.min(Math.max(0, e.x-rect.x), rect.width) / rect.width;
    isScrubbing = (e.buttons & 1) === 1 
    vidContainer.classList.toggle("scrubbing", isScrubbing)
    console.log("Scrubbing:", isScrubbing)

    if(isScrubbing) {
        wasPaused = video.paused
        video.pause();
    } else {
        video.currentTime = percent * video.duration
        if (!wasPaused) video.play()
    }
    handleTimelineUpdate(e);
}

//Timeline


function handleTimelineUpdate(e) {
    console.log("HTU")
    const videoDuration = video.duration;
    const rect = timelineContainer.getBoundingClientRect(); 
    const percent = Math.min(Math.max(0, e.x-rect.x), rect.width) / rect.width;
    const previewImgNumber = Math.max(1, Math.floor(percent * videoDuration))
    previewImg.src = `assets/previewImgs/previewImg${previewImgNumber}.jpg`
    timelineContainer.style.setProperty("--preview-position", percent);
    
    if (isScrubbing) {
        e.preventDefault();
        thumbnailImg.src = `assets/previewImgs/previewImg${previewImgNumber}.jpg`;
        // console.log(thumbnailImg.src)
        timelineContainer.style.setProperty('--progress-position', percent)
    }
 }
 

theaterBtn.addEventListener('click', toggleTheater)
miniBtn.addEventListener('click', toggleMini)
fullScreenBtn.addEventListener('click', toggleFullScreen)
video.volume=0.5;

//Play/Pause 
playPauseBtn.addEventListener('click', (e) => { if(!e.pointerType) return;  togglePlay() })   // Space key registers as a click with pointerType ''; 
                                                                                              // this disables the double-click
video.addEventListener('click', togglePlay) 

function togglePlay() {
    video.paused ? video.play() : video.pause()
    console.log(video.currentTime*100/video.duration, video.duration)
}

// Volume Control
muteBtn.addEventListener('click', toggleMute)
volSlider.addEventListener('input', ctlVolume)

function toggleMute() {
    video.muted = !video.muted;
}

function ctlVolume(e) {
    video.volume = e.target.value;
    video.muted = e.target.value == 0; 
}

video.addEventListener('volumechange', (e) => {
    //console.log("->", volSlider.value, video.muted)
    volSlider.value = video.muted ? 0 : video.volume;
    if (volSlider.value==0) {
        vidContainer.dataset.volumeLevel = 'muted';
    } else if (video.volume > 0.5) {
        vidContainer.dataset.volumeLevel = 'high';
    } else {
        vidContainer.dataset.volumeLevel = 'low'
    }
})

// Duration
video.addEventListener('loadeddata', () => {
    totalTimeElem.textContent = video.duration.toFixed(2);
    video.currentTime= 0;
})
const x = new Intl.NumberFormat(undefined, {minimumIntegerDigits:2})
video.addEventListener('timeupdate', () => {
    currentTimeElem.textContent = x.format(Math.floor(video.currentTime));
    const percent = video.currentTime / video.duration; 
    timelineContainer.style.setProperty('--progress-position', percent)

})
video.addEventListener('seeking', () => console.log('seek',video.currentTime))

video.addEventListener('seeked', () => console.log('seek',video.currentTime))
 
// View Modes
function toggleTheater() {
    vidContainer.classList.toggle('theater')
}

function toggleMini() {
    if (!document.pictureInPictureElement) {
    video.requestPictureInPicture().then(w => w.addEventListener('resize', () => console.log(w.width, '-', w.height)))
    }
    else {
        document.exitPictureInPicture();
    }
}

function toggleFullScreen() {
    vidContainer.classList.toggle('full-screen')
}

video.addEventListener('play', () => {
    vidContainer.classList.remove('paused')
})

video.addEventListener('pause', () => {
    vidContainer.classList.add('paused')
})

