import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Configurazione Firebase per l'autenticazione lato client
const firebaseConfig = {
    apiKey: "AIzaSyC7Tbqt5FzJK8Z_USkCMWxXiHZp8uRN26A",
    authDomain: "mattedev-account.firebaseapp.com",
    projectId: "mattedev-account",
    storageBucket: "mattedev-account.firebasestorage.app",
    messagingSenderId: "77268069903",
    appId: "1:77268069903:web:040aa6c3981eb3650afd7a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Riferimenti DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const warningModal = document.getElementById('warningModal');
const confirmUpload = document.getElementById('confirmUpload');
const mainText = dropZone.querySelector('.main-text');
const currentPfp = document.getElementById('currentPfp');
const editPfp = document.getElementById('editPfp');

let pendingFile = null;
let currentUserUID = null;

// Recupera l'utente corrente
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUID = user.uid;
    } else {
        console.warn("Nessun utente autenticato rilevato.");
    }
});

// Gestione selezione file
function prepareUpload(file) {
    if (file && file.type.startsWith('image/')) {
        pendingFile = file;
        warningModal.style.display = "block";
    } else {
        alert("Per favore seleziona un'immagine valida.");
    }
}

dropZone.onclick = () => fileInput.click();
fileInput.onchange = (e) => prepareUpload(e.target.files[0]);

// Drag & Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
    window.addEventListener(name, e => e.preventDefault());
});

dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
    dropZone.classList.remove('drag-over');
    prepareUpload(e.dataTransfer.files[0]);
});

// LOGICA UPLOAD AL TUO BACKEND
confirmUpload.onclick = async () => {
    warningModal.style.display = "none";
    if (!pendingFile || !currentUserUID) {
        alert("Dati mancanti per l'upload.");
        return;
    }

    mainText.innerText = "Elaborazione immagine...";

    const formData = new FormData();
    formData.append('image', pendingFile); // 'image' deve corrispondere a upload.single('image') nel backend
    formData.append('uid', currentUserUID);

    try {
        // Chiamata al tuo backend via Cloudflare Tunnel
        const response = await fetch('https://pfp.api.mattedev.com/upload-pfp', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Errore Server: ${response.status}`);

        const data = await response.json();

        // Se il backend ha salvato tutto e risposto con l'URL
        if (data.url) {
            // Aggiorna l'anteprima e il campo nascosto
            currentPfp.src = data.url;
            if (editPfp) editPfp.value = data.url;

            mainText.innerText = "Profilo aggiornato con successo!";
            
            setTimeout(() => { 
                mainText.innerText = "Trascina qui la tua immagine"; 
            }, 3000);
        }

    } catch (err) {
        console.error("Errore durante l'upload:", err);
        mainText.innerText = "Errore durante il caricamento";
        alert("Impossibile contattare il backend. Verifica che PM2 sia attivo.");
    }
};

document.getElementById('closeModal').onclick = () => {
    warningModal.style.display = "none";
    pendingFile = null;
};