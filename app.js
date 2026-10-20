/* Eaglercraft Launcher — application logic
   Extracted from the existing index.html. Static GitHub Pages project.
*/
// Interactive Controls
        let soundEnabled = true;
        let musicPlaying = false;
        let audioCtx = null;
        let musicInterval = null;

        const soundBtn = document.getElementById('sound-btn');
        const musicBtn = document.getElementById('music-btn');
        const themeBtn = document.getElementById('theme-btn');

        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundBtn.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
            if (soundEnabled) playClickSound();
        });

        themeBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.body.removeAttribute('data-theme');
                themeBtn.textContent = '🌙';
            } else {
                document.body.setAttribute('data-theme', 'light');
                themeBtn.textContent = '☀️';
            }
            if (soundEnabled) playClickSound();
        });

        musicBtn.addEventListener('click', () => {
            musicPlaying = !musicPlaying;
            musicBtn.textContent = musicPlaying ? '🎶 Ambient Music: ON' : '🎶 Ambient Music: OFF';
            if (musicPlaying) {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                startAmbientMusic();
            } else {
                stopAmbientMusic();
            }
        });

        function startAmbientMusic() {
            const notes = [261.63, 329.63, 392.00, 523.25, 440.00];
            musicInterval = setInterval(() => {
                if (!musicPlaying) return;
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
                gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 2);
            }, 1200);
        }

        function stopAmbientMusic() {
            clearInterval(musicInterval);
        }

        function playClickSound() {
            if (!soundEnabled) return;
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
            } catch (e) {}
        }

        // IndexedDB Storage
        let db;
        const request = indexedDB.open("EaglercraftLauncherDB", 1);

        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains("saved_clients")) {
                db.createObjectStore("saved_clients", { keyPath: "name" });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            loadSavedClients();
        };

        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) saveLocalFile(file);
        });

        function saveLocalFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const clientData = {
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                    content: e.target.result
                };

                const tx = db.transaction("saved_clients", "readwrite");
                const store = tx.objectStore("saved_clients");
                store.put(clientData);

                tx.oncomplete = () => {
                    loadSavedClients();
                };
            };
            reader.readAsText(file);
        }

        function loadSavedClients() {
            const container = document.getElementById('saved-clients-list');
            container.innerHTML = '';

            const tx = db.transaction("saved_clients", "readonly");
            const store = tx.objectStore("saved_clients");
            const getRequest = store.getAll();

            getRequest.onsuccess = () => {
                const clients = getRequest.result;
                clients.forEach(client => {
                    const card = document.createElement('div');
                    card.className = 'saved-card';
                    card.innerHTML = `
                        <div class="saved-info">
                            <h3>▶ ${client.name}</h3>
                            <p>Saved Client (${client.size}) • Ready for Instant Play</p>
                        </div>
                        <div class="saved-actions">
                            <button class="btn-play-tab" onclick="playInNewTab('${client.name}')">NEW TAB</button>
                            <button class="btn-play-page" onclick="playInPage('${client.name}')">PLAY IN-PAGE</button>
                            <button class="btn-delete" onclick="deleteClient('${client.name}')">🗑</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            };
        }

        function playInNewTab(name) {
            const tx = db.transaction("saved_clients", "readonly");
            const store = tx.objectStore("saved_clients");
            const req = store.get(name);
            req.onsuccess = () => {
                const win = window.open();
                win.document.write(req.result.content);
                win.document.close();
            };
        }

        function playInPage(name) {
            const tx = db.transaction("saved_clients", "readonly");
            const store = tx.objectStore("saved_clients");
            const req = store.get(name);
            req.onsuccess = () => {
                const iframe = document.getElementById('game-iframe');
                const iframeContainer = document.getElementById('game-iframe-container');
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(req.result.content);
                iframe.contentWindow.document.close();
                iframeContainer.style.display = 'block';
            };
        }

        function closeGameFrame() {
            const iframeContainer = document.getElementById('game-iframe-container');
            const iframe = document.getElementById('game-iframe');
            iframe.src = 'about:blank';
            iframeContainer.style.display = 'none';
        }

        function deleteClient(name) {
            const tx = db.transaction("saved_clients", "readwrite");
            const store = tx.objectStore("saved_clients");
            store.delete(name);
            tx.oncomplete = () => loadSavedClients();
        }

        function copyServer(ip) {
            navigator.clipboard.writeText(ip);
            if (soundEnabled) playClickSound();
            alert('Copied IP: ' + ip);
        }
