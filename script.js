// Playlist Data
const playlists = {
    vietnamese: [
        { id: 'vWBIxXcEssI', title: 'Hai Phút Hơn', artist: 'Pháo', duration: '3:24', thumbnail: 'https://img.youtube.com/vi/vWBIxXcEssI/mqdefault.jpg' },
        { id: 'kTJczYoc5Oo', title: 'Em Gái Mưa', artist: 'Hương Tràm', duration: '4:12', thumbnail: 'https://img.youtube.com/vi/kTJczYoc5Oo/mqdefault.jpg' },
        { id: 'CtW5JvL2hbE', title: 'Sóng Gió', artist: 'Jack', duration: '3:45', thumbnail: 'https://img.youtube.com/vi/CtW5JvL2hbE/mqdefault.jpg' },
        { id: 'qoSJYmhqdfI', title: 'Nhất Nghệ Tinh', artist: 'Luffy', duration: '3:18', thumbnail: 'https://img.youtube.com/vi/qoSJYmhqdfI/mqdefault.jpg' },
        { id: 'F16h2-jCkvs', title: 'Cắt Đôi Nỗi Sầu', artist: 'Tăng Duy Tân', duration: '3:56', thumbnail: 'https://img.youtube.com/vi/F16h2-jCkvs/mqdefault.jpg' },
        { id: 'w85wHQ3dQbI', title: 'Đám Cưới Nắng', artist: 'Ricky Star', duration: '3:32', thumbnail: 'https://img.youtube.com/vi/w85wHQ3dQbI/mqdefault.jpg' },
        { id: 'gMxWnJZ0v1s', title: 'Có Chắt Yêu Không', artist: 'Du Uyên', duration: '4:02', thumbnail: 'https://img.youtube.com/vi/gMxWnJZ0v1s/mqdefault.jpg' },
        { id: '5Z2dV3VQxps', title: 'Locket', artist: 'Doan Thuy Trang', duration: '3:28', thumbnail: 'https://img.youtube.com/vi/5Z2dV3VQxps/mqdefault.jpg' },
        { id: 'xJ5bN9bqK9o', title: 'Thiên Lý Ơi', artist: 'Masew ft. Orange', duration: '3:44', thumbnail: 'https://img.youtube.com/vi/xJ5bN9bqK9o/mqdefault.jpg' },
        { id: 'h3p8Y8a0v1s', title: 'Mắt Xanh', artist: 'Den Vau', duration: '4:15', thumbnail: 'https://img.youtube.com/vi/h3p8Y8a0v1s/mqdefault.jpg' },
        { id: 'j3p8Y8a0v1s', title: 'Ai Chung Tình Được Mãi', artist: 'Đinh Tùng Huy', duration: '3:52', thumbnail: 'https://img.youtube.com/vi/j3p8Y8a0v1s/mqdefault.jpg' },
        { id: 'k3p8Y8a0v1s', title: 'Vui Lắm Nha', artist: 'Hương Ly', duration: '3:15', thumbnail: 'https://img.youtube.com/vi/k3p8Y8a0v1s/mqdefault.jpg' }
    ],
    english: [
        { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', duration: '4:22', thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5', duration: '3:55', thumbnail: 'https://img.youtube.com/vi/09R8_2nJtjg/mqdefault.jpg' },
        { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55', thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg' },
        { id: 'RgKAFK5djSk', title: 'Wrecking Ball', artist: 'Miley Cyrus', duration: '3:41', thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg' },
        { id: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', duration: '4:45', thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'pRpeEdMmmQ0', title: 'Uptown Funk', artist: 'Bruno Mars', duration: '4:30', thumbnail: 'https://img.youtube.com/vi/pRpeEdMmmQ0/mqdefault.jpg' },
        { id: 'CevxZvSJLk8', title: 'Baby', artist: 'Justin Bieber', duration: '3:34', thumbnail: 'https://img.youtube.com/vi/CevxZvSJLk8/mqdefault.jpg' },
        { id: 'hT_nvWreIhg', title: 'One More Night', artist: 'Maroon 5', duration: '3:46', thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg' },
        { id: 'lp-EO5I60KA', title: 'Faded', artist: 'Alan Walker', duration: '3:32', thumbnail: 'https://img.youtube.com/vi/lp-EO5I60KA/mqdefault.jpg' }
    ],
    remix: [
        { id: 'vWBIxXcEssI', title: 'Hai Phút Hơn (Remix)', artist: 'Pháo', duration: '3:45', thumbnail: 'https://img.youtube.com/vi/vWBIxXcEssI/mqdefault.jpg' },
        { id: 'CtW5JvL2hbE', title: 'Sóng Gió (Remix)', artist: 'Jack', duration: '4:12', thumbnail: 'https://img.youtube.com/vi/CtW5JvL2hbE/mqdefault.jpg' },
        { id: 'kJQP7kiw5Fk', title: 'Despacito (Remix)', artist: 'Luis Fonsi', duration: '4:45', thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg' },
        { id: 'pRpeEdMmmQ0', title: 'Uptown Funk (Remix)', artist: 'Bruno Mars', duration: '4:55', thumbnail: 'https://img.youtube.com/vi/pRpeEdMmmQ0/mqdefault.jpg' },
        { id: '09R8_2nJtjg', title: 'Sugar (Remix)', artist: 'Maroon 5', duration: '4:15', thumbnail: 'https://img.youtube.com/vi/09R8_2nJtjg/mqdefault.jpg' },
        { id: 'RgKAFK5djSk', title: 'Wrecking Ball (Remix)', artist: 'Miley Cyrus', duration: '4:02', thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg' },
        { id: 'YQHsXMglC9A', title: 'Hello (Remix)', artist: 'Adele', duration: '5:10', thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg' },
        { id: 'lp-EO5I60KA', title: 'Faded (Remix)', artist: 'Alan Walker', duration: '3:55', thumbnail: 'https://img.youtube.com/vi/lp-EO5I60KA/mqdefault.jpg' }
    ]
};

// Global State
let player;
let currentPlaylist = 'vietnamese';
let currentSongIndex = 0;
let isPlaying = false;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.querySelector('.progress-bar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentSongTitle = document.getElementById('currentSongTitle');
const controlSongTitle = document.getElementById('controlSongTitle');
const controlArtist = document.getElementById('controlArtist');

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'disablekb': 1,
            'enablejsapi': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube Player Ready');
    renderPlaylist(currentPlaylist);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        updateProgress();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// Update Progress Bar
function updateProgress() {
    if (player && player.getDuration) {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        const percent = (currentTime / duration) * 100;
        
        progress.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
        
        if (isPlaying) {
            requestAnimationFrame(updateProgress);
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Render Playlist
function renderPlaylist(playlistName) {
    const playlist = playlists[playlistName];
    const container = document.getElementById(`${playlistName}List`);
    
    container.innerHTML = playlist.map((song, index) => `
        <div class="song-item ${index === currentSongIndex && playlistName === currentPlaylist ? 'playing' : ''}" 
             data-index="${index}" 
             data-playlist="${playlistName}">
            <span class="song-number">${index + 1}</span>
            <img src="${song.thumbnail}" alt="${song.title}" class="song-thumbnail">
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <span class="song-duration">${song.duration}</span>
            <div class="song-actions">
                <button class="play-btn-small" data-index="${index}" data-playlist="${playlistName}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="like-btn"><i class="far fa-heart"></i></button>
            </div>
        </div>
    `).join('');
    
    // Add click events
    container.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.song-actions')) {
                const index = parseInt(item.dataset.index);
                const playlist = item.dataset.playlist;
                playSong(playlist, index);
            }
        });
    });
    
    container.querySelectorAll('.play-btn-small').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const playlist = btn.dataset.playlist;
            playSong(playlist, index);
        });
    });
}

// Play Song
function playSong(playlistName, index) {
    currentPlaylist = playlistName;
    currentSongIndex = index;
    const song = playlists[playlistName][index];
    
    player.loadVideoById(song.id);
    
    // Update UI
    currentSongTitle.textContent = `${song.title} - ${song.artist}`;
    controlSongTitle.textContent = song.title;
    controlArtist.textContent = song.artist;
    
    // Update playing state
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    const activeItem = document.querySelector(`[data-playlist="${playlistName}"][data-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('playing');
    }
}

// Play Next
function playNext() {
    const playlist = playlists[currentPlaylist];
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(currentPlaylist, currentSongIndex);
}

// Play Previous
function playPrev() {
    const playlist = playlists[currentPlaylist];
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(currentPlaylist, currentSongIndex);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // Playlist Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.playlist').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(tab).classList.add('active');
            renderPlaylist(tab);
        });
    });
    
    // Play All Button
    document.querySelectorAll('.play-all-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const playlist = btn.dataset.playlist;
            playSong(playlist, 0);
        });
    });
    
    // Player Controls
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });
    
    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);
    
    // Volume Control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        player.setVolume(volume);
    });
    
    // Progress Bar Click
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const duration = player.getDuration();
        player.seekTo(percent * duration, true);
    });
    
    // Search Functionality
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            // Search in all playlists
            for (const [playlistName, songs] of Object.entries(playlists)) {
                const foundIndex = songs.findIndex(song => 
                    song.title.toLowerCase().includes(query.toLowerCase()) ||
                    song.artist.toLowerCase().includes(query.toLowerCase())
                );
                if (foundIndex !== -1) {
                    playSong(playlistName, foundIndex);
                    return;
                }
            }
            alert('Không tìm thấy bài hát!');
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Initialize
    renderPlaylist('vietnamese');
});

// YouTube IFrame API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
