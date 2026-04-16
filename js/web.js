/**
 * MATTEDEV PLATFORM - LOGIC 2026
 * Gestione WebViews, Folder iOS Style e PWA
 */

// 1. Funzione WebView (Pop-up centrato)
function openAsWebView(url, title) {
    const w = 1100;
    const h = 750;
    const left = (window.screen.width / 2) - (w / 2);
    const top = (window.screen.height / 2) - (h / 2);
    
    return window.open(url, title, 
        `toolbar=no, location=no, directories=no, status=no, menubar=no, 
        scrollbars=yes, resizable=yes, copyhistory=no, width=${w}, 
        height=${h}, top=${top}, left=${left}`);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- GESTIONE WEBVIEW ---
    const links = document.querySelectorAll('.webview-link');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Se preme SHIFT apre normalmente
            if (e.shiftKey) return; 

            e.preventDefault(); 
            const targetUrl = this.href;
            // Correzione: Cerca il nome dentro .app-name della icona cliccata
            const appName = this.querySelector('.app-name') ? this.querySelector('.app-name').innerText : 'App';
            
            openAsWebView(targetUrl, appName);
        });
    });

    // --- GESTIONE CARTELLA DISCOVER (iOS Style) ---
    const folderBtn = document.getElementById('openFolder');
    const folderOverlay = document.getElementById('folderOverlay');
    const closeFolderBtn = document.getElementById('closeFolder');

    if (folderBtn && folderOverlay) {
        // Apri cartella
        folderBtn.addEventListener('click', () => {
            folderOverlay.classList.add('active');
        });

        // Chiudi con la X o cliccando fuori (sullo sfondo blurrato)
        folderOverlay.addEventListener('click', (e) => {
            if (e.target === folderOverlay || e.target === closeFolderBtn) {
                folderOverlay.classList.remove('active');
            }
        });
    }
});

// --- REGISTRAZIONE SERVICE WORKER (PWA) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log("PWA: Ready."))
        .catch(err => console.error("PWA: Error:", err));
    });
}