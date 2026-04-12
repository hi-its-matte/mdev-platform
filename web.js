/**
 * Funzione per aprire i link in una finestra stile Web View nativa.
 * Centra la finestra sullo schermo e rimuove le barre degli strumenti.
 */
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

/**
 * Gestione dei click sui link con classe 'webview-link'.
 * Supporta l'apertura standard se viene premuto il tasto SHIFT.
 */
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.webview-link');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Se l'utente preme SHIFT, lascia che il browser gestisca il click (nuovo tab/finestra)
            if (e.shiftKey) {
                return; 
            }

            e.preventDefault(); 
            const targetUrl = this.href;
            const projectCard = this.closest('.project-card');
            const appName = projectCard ? projectCard.querySelector('h3').innerText : 'App';
            
            openAsWebView(targetUrl, appName);
        });
    });
});

/**
 * Registrazione del Service Worker per abilitare le funzionalità PWA.
 * Assicurati che sw.js esista nella root del sito.
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Usa il percorso relativo corretto per sw.js
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log("PWA: Service Worker registrato correttamente."))
        .catch(err => console.error("PWA: Errore registrazione SW:", err));
    });
}