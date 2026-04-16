const folderBtn = document.getElementById('openFolder');
const folderOverlay = document.getElementById('folderOverlay');
const closeBtn = document.querySelector('.close-folder-btn');

folderBtn.onclick = () => folderOverlay.classList.add('active');

// Chiudi cliccando la X o fuori dal contenuto
folderOverlay.onclick = (e) => {
    if (e.target === folderOverlay || e.target === closeBtn) {
        folderOverlay.classList.remove('active');
    }
};