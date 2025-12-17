// Music JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initMusicPage();
});

async function initMusicPage() {
    // Load music tracks
    await loadMusicTracks();
    
    // Initialize music player
    initMusicPlayer();
    
    // Initialize study timer
    initStudyTimer();
    
    // Setup event listeners
    setupEventListeners();
}

// Music tracks data
let musicTracks = [];
let currentTrackIndex = 0;
let isPlaying = false;
let audioElement = null;

async function loadMusicTracks() {
    try {
        const response = await fetch(`${API_BASE_URL}/music`);
        const data = await response.json();
        
        if (data.success && data.tracks) {
            musicTracks = data.tracks;
            displayMusicTracks();
            updatePlaylist();
        }
    } catch (error) {
        console.error('Error loading music tracks:', error);
        
        // Fallback to default tracks
        musicTracks = [
            {
                id: 1,
                title: "Focus Flow",
                artist: "Lofi Study",
                category: "focus",
                embed_url: "https://www.youtube.com/embed/jfKfPfyJRdk",
                duration: "∞"
            },
            {
                id: 2,
                title: "Deep Concentration",
                artist: "Study Music",
                category: "focus",
                embed_url: "https://www.youtube.com/embed/7NOSDKb0HlU",
                duration: "2:00:00"
            },
            {
                id: 3,
                title: "Calm Piano",
                artist: "Relaxing Music",
                category: "relax",
                embed_url: "https://www.youtube.com/embed/BHACKCNDMW8",
                duration: "1:30:00"
            },
            {
                id: 4,
                title: "Sleep Meditation",
                artist: "Sleep Music",
                category: "sleep",
                embed_url: "https://www.youtube.com/embed/aEgyN1H-1Ds",
                duration: "8:00:00"
            }
        ];
        
        displayMusicTracks();
        updatePlaylist();
    }
}

function displayMusicTracks() {
    // Group tracks by category
    const focusTracks = musicTracks.filter(track => track.category === 'focus');
    const relaxTracks = musicTracks.filter(track => track.category === 'relax');
    const sleepTracks = musicTracks.filter(track => track.category === 'sleep');
    
    // Display focus tracks
    const focusContainer = document.getElementById('focusTracks');
    if (focusContainer && focusTracks.length > 0) {
        focusContainer.innerHTML = focusTracks.map(track => createTrackCard(track)).join('');
    }
    
    // Display relax tracks
    const relaxContainer = document.getElementById('relaxTracks');
    if (relaxContainer && relaxTracks.length > 0) {
        relaxContainer.innerHTML = relaxTracks.map(track => createTrackCard(track)).join('');
    }
    
    // Display sleep tracks
    const sleepContainer = document.getElementById('sleepTracks');
    if (sleepContainer && sleepTracks.length > 0) {
        sleepContainer.innerHTML = sleepTracks.map(track => createTrackCard(track)).join('');
    }
}

function createTrackCard(track) {
    return `
        <div class="track-card" data-id="${track.id}" data-category="${track.category}">
            <div class="track-cover">
                <i class="fas fa-music"></i>
            </div>
            <div class="track-details">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="track-duration">
                ${track.duration}
            </div>
        </div>
    `;
}

function initMusicPlayer() {
    // Create audio element
    audioElement = new Audio();
    
    // Setup volume control
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (audioElement) {
                audioElement.volume = volume;
            }
        });
    }
    
    // Setup play/pause button
    const playPauseBtn = document.getElementById('playPause');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // Setup next/prev buttons
    const prevBtn = document.getElementById('prevTrack');
    const nextBtn = document.getElementById('nextTrack');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPreviousTrack);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNextTrack);
    }
    
    // Setup track selection
    setupTrackSelection();
}

function setupTrackSelection() {
    // Add click event to all track cards
    document.addEventListener('click', (e) => {
        const trackCard = e.target.closest('.track-card');
        if (trackCard) {
            const trackId = parseInt(trackCard.dataset.id);
            const category = trackCard.dataset.category;
            
            // Find track index
            const trackIndex = musicTracks.findIndex(track => track.id === trackId);
            if (trackIndex !== -1) {
                playTrack(trackIndex);
                
                // Switch to correct category tab
                switchCategoryTab(category);
            }
        }
    });
    
    // Add click event to playlist tracks
    document.addEventListener('click', (e) => {
        const playlistTrack = e.target.closest('.playlist-track');
        if (playlistTrack) {
            const trackIndex = parseInt(playlistTrack.dataset.index);
            if (!isNaN(trackIndex)) {
                playTrack(trackIndex);
            }
        }
    });
}

function playTrack(index) {
    if (index < 0 || index >= musicTracks.length) return;
    
    currentTrackIndex = index;
    const track = musicTracks[index];
    
    // Update player UI
    updatePlayerUI(track);
    
    // Update embedded player
    updateEmbeddedPlayer(track);
    
    // Update active track in list
    updateActiveTrack();
    
    // Play audio
    playAudio(track);
}

function updatePlayerUI(track) {
    const currentTrackElement = document.getElementById('currentTrack');
    const currentArtistElement = document.getElementById('currentArtist');
    
    if (currentTrackElement) {
        currentTrackElement.textContent = track.title;
    }
    
    if (currentArtistElement) {
        currentArtistElement.textContent = track.artist;
    }
}

function updateEmbeddedPlayer(track) {
    const playerEmbed = document.getElementById('playerEmbed');
    if (!playerEmbed) return;
    
    playerEmbed.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="${track.embed_url}?autoplay=1&controls=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

function updateActiveTrack() {
    // Remove active class from all track cards
    document.querySelectorAll('.track-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to current track
    const currentTrackCard = document.querySelector(`.track-card[data-id="${musicTracks[currentTrackIndex].id}"]`);
    if (currentTrackCard) {
        currentTrackCard.classList.add('active');
    }
    
    // Update playlist active track
    updatePlaylistActiveTrack();
}

function updatePlaylist() {
    const playlistTracks = document.getElementById('playlistTracks');
    if (!playlistTracks) return;
    
    playlistTracks.innerHTML = musicTracks.map((track, index) => `
        <div class="playlist-track ${index === currentTrackIndex ? 'active' : ''}" data-index="${index}">
            <i class="fas fa-music"></i>
            <span>${track.title} - ${track.artist}</span>
            <span class="track-duration">${track.duration}</span>
        </div>
    `).join('');
}

function updatePlaylistActiveTrack() {
    const playlistTracks = document.querySelectorAll('.playlist-track');
    playlistTracks.forEach((track, index) => {
        if (index === currentTrackIndex) {
            track.classList.add('active');
        } else {
            track.classList.remove('active');
        }
    });
}

async function playAudio(track) {
    // For now, we'll use the embedded YouTube player
    // In a real application, you might want to use actual audio files
    console.log(`Playing: ${track.title} by ${track.artist}`);
    
    // Update play/pause button
    const playPauseBtn = document.getElementById('playPause');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
    }
}

function togglePlayPause() {
    const playPauseBtn = document.getElementById('playPause');
    if (!playPauseBtn) return;
    
    if (isPlaying) {
        // Pause
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false;
        console.log('Music paused');
    } else {
        // Play
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
        console.log('Music playing');
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
    playTrack(currentTrackIndex);
}

function playPreviousTrack() {
    currentTrackIndex = currentTrackIndex === 0 ? musicTracks.length - 1 : currentTrackIndex - 1;
    playTrack(currentTrackIndex);
}

// Category tabs
function switchCategoryTab(category) {
    const tabs = document.querySelectorAll('.category-tab');
    const contents = document.querySelectorAll('.category-content');
    
    // Remove active class from all tabs and contents
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`.category-tab[data-category="${category}"]`);
    const selectedContent = document.getElementById(`${category}Content`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

// Study Timer
let studyTimer;
let studyTimeLeft = 25 * 60; // 25 minutes in seconds
let studyIsRunning = false;

function initStudyTimer() {
    const startBtn = document.getElementById('startStudy');
    const pauseBtn = document.getElementById('pauseStudy');
    const resetBtn = document.getElementById('resetStudy');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const minutesSpan = document.getElementById('studyMinutes');
    const secondsSpan = document.getElementById('studySeconds');
    
    // Update display
    updateStudyTimerDisplay();
    
    // Start button
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!studyIsRunning) {
                startStudyTimer();
                startBtn.disabled = true;
                if (pauseBtn) pauseBtn.disabled = false;
            }
        });
    }
    
    // Pause button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (studyIsRunning) {
                pauseStudyTimer();
                if (startBtn) startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        });
    }
    
    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetStudyTimer();
            if (startBtn) startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
            updateStudyTimerDisplay();
        });
    }
    
    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const time = parseInt(btn.dataset.time);
            setStudyTimer(time);
            resetStudyTimer();
            updateStudyTimerDisplay();
        });
    });
    
    function startStudyTimer() {
        studyIsRunning = true;
        studyTimer = setInterval(() => {
            studyTimeLeft--;
            updateStudyTimerDisplay();
            
            if (studyTimeLeft <= 0) {
                clearInterval(studyTimer);
                studyIsRunning = false;
                if (startBtn) startBtn.disabled = false;
                if (pauseBtn) pauseBtn.disabled = true;
                playTimerSound();
                showStudyTimerNotification();
            }
        }, 1000);
    }
    
    function pauseStudyTimer() {
        clearInterval(studyTimer);
        studyIsRunning = false;
    }
    
    function resetStudyTimer() {
        clearInterval(studyTimer);
        studyIsRunning = false;
        studyTimeLeft = 25 * 60; // Default 25 minutes
    }
    
    function setStudyTimer(minutes) {
        studyTimeLeft = minutes * 60;
    }
    
    function updateStudyTimerDisplay() {
        const minutes = Math.floor(studyTimeLeft / 60);
        const seconds = studyTimeLeft % 60;
        
        if (minutesSpan) {
            minutesSpan.textContent = minutes.toString().padStart(2, '0');
        }
        
        if (secondsSpan) {
            secondsSpan.textContent = seconds.toString().padStart(2, '0');
        }
    }
    
    function playTimerSound() {
        // Simple timer sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Audio not supported for timer');
        }
    }
    
    function showStudyTimerNotification() {
        const message = 'Study session complete! Take a short break.';
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MentalCare Study Timer', {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        // Show in-app notification
        showMessage(message, 'info');
    }
}

// Playlist creation
function setupEventListeners() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            switchCategoryTab(category);
        });
    });
    
    // Create playlist button
    const createPlaylistBtn = document.getElementById('createPlaylist');
    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', createPlaylist);
    }
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            // Update volume icon based on level
            const volumeIcons = document.querySelectorAll('.volume-control i');
            volumeIcons.forEach(icon => {
                if (volume < 30) {
                    icon.className = 'fas fa-volume-off';
                } else if (volume < 70) {
                    icon.className = 'fas fa-volume-down';
                } else {
                    icon.className = 'fas fa-volume-up';
                }
            });
        });
    }
}

function createPlaylist() {
    const playlistNameInput = document.getElementById('playlistName');
    const playlistName = playlistNameInput.value.trim();
    
    if (!playlistName) {
        showMessage('Please enter a playlist name', 'error');
        return;
    }
    
    // Get saved playlists from localStorage
    const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    
    // Check if playlist name already exists
    if (savedPlaylists.some(playlist => playlist.name === playlistName)) {
        showMessage('Playlist name already exists', 'error');
        return;
    }
    
    // Create new playlist with current track
    const newPlaylist = {
        id: Date.now(),
        name: playlistName,
        tracks: [musicTracks[currentTrackIndex]],
        created: new Date().toISOString()
    };
    
    // Save to localStorage
    savedPlaylists.push(newPlaylist);
    localStorage.setItem('playlists', JSON.stringify(savedPlaylists));
    
    // Clear input
    playlistNameInput.value = '';
    
    // Show success message
    showMessage(`Playlist "${playlistName}" created successfully!`, 'success');
    
    // Update saved playlists display
    updateSavedPlaylists();
}

function updateSavedPlaylists() {
    const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const savedList = document.getElementById('savedPlaylists');
    
    if (!savedList) return;
    
    if (savedPlaylists.length === 0) {
        savedList.innerHTML = `
            <div class="no-playlists">
                <p>No playlists created yet</p>
            </div>
        `;
        return;
    }
    
    savedList.innerHTML = savedPlaylists.map(playlist => `
        <div class="playlist-item">
            <span class="playlist-name">${playlist.name}</span>
            <span class="playlist-stats">${playlist.tracks.length} track${playlist.tracks.length !== 1 ? 's' : ''}</span>
        </div>
    `).join('');
}

// Initialize saved playlists display
if (document.getElementById('savedPlaylists')) {
    updateSavedPlaylists();
}