const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const MUSIC_PLAYER_KEY = 'MUSIC_PLAYER';

const playlist = $('.playlist');

const heading = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');

const btnPlay =$('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(MUSIC_PLAYER_KEY)) || {},

    songs: [{
        name: 'Hoa Hải Đường',
        singer: 'Jack',
        path: './assets/audio/song1.mp3',
        image: './assets/img/image1.jpeg'
    },
    {
        name: 'Khuê Mộc Lan',
        singer: 'Xuân Tùng',
        path: './assets/audio/song2.mp3',
        image: './assets/img/image2.jpeg'
    },
    {
        name: 'Rồi Tới Luôn',
        singer: 'Jack',
        path: './assets/audio/song3.mp3',
        image: './assets/img/image3.jpeg'
    },
    {
        name: 'Sầu Hồng Gai',
        singer: 'Jack',
        path: './assets/audio/song4.mp3',
        image: './assets/img/image4.jpeg'
    },
    {
        name: 'Thiên Đàng',
        singer: 'Jack',
        path: './assets/audio/song5.mp3',
        image: './assets/img/image5.jpeg'
    },
    {
        name: 'Thương Nhau Tới Bến',
        singer: 'Jack',
        path: './assets/audio/song6.mp3',
        image: './assets/img/image6.jpeg'
    },
    {
        name: 'Y Chang Xuân Sang',
        singer: 'Jack',
        path: './assets/audio/song7.mp3',
        image: './assets/img/image7.jpeg'
    }],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(MUSIC_PLAYER_KEY, JSON.stringify(this.config));
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xử lý CD quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10second
            iterations: Infinity,
        })
        cdThumbAnimate.pause()
        
        // Xử lý phóng to thu nhỏ cd 
        document.onscroll = function() {
            var scrollTop = window.scrollY || document.documentElement.scrollTop;
            var newcdWidth = cdWidth - scrollTop;

            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0;
            cd.style.opacity = newcdWidth / cdWidth;
        }

        // Xử lý khi click play
        btnPlay.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        //Xử lý khi audio play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play()
        }

        //Xử lý khi audio bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause()
        }

        // Xử lý tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration*100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua bài hát
        progress.onchange = function(e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        }

        //Xử lý khi next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong();
                _this.nextSong();
            } else {
                _this.nextSong();
            }
            _this.renderSong();
            _this.scrolltoActiveSong();
            audio.play();

        }

        //Xử lý khi prev bài hát
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong();
                _this.prevSong();
            } else {
                _this.prevSong();
            }
            _this.renderSong();
            _this.scrolltoActiveSong();
            audio.play();
        }

        // Xử lý khi random bài hát
        randomBtn.onclick  = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            this.classList.toggle('active', _this.isRandom);
        }

        // Xủ lý lặp lại bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            this.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý khi kết thức audio
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        //Xử lý khi nhấn vào playlist
        playlist.onclick = function(e) {
            //Xử lý khi nhấn vào songs
            let songElement = e.target.closest('.song:not(.active)');
            if(songElement && !e.target.closest('.option')) {
                _this.currentIndex = Number(songElement.dataset.index)
                _this.loadcurrentSong();
                _this.renderSong();
                audio.play();
            }

            //Xử lý khi nhấn vào option
            if(e.target.closest('.option')) {
                //code
            }
        }
    },

    renderSong() {
        var htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${(index === this.currentIndex) ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        });
        playlist.innerHTML = htmls.join('');
    },

    loadcurrentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        };
        this.loadcurrentSong();
    },
    
    prevSong() {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        };
        this.loadcurrentSong();
    },

    randomSong() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadcurrentSong();
    },

    scrolltoActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        },300)
    },

    start() {
        this.loadConfig();

        this.defineProperties();

        this.renderSong();

        this.loadcurrentSong();

        this.handleEvents();

        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();