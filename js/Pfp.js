import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7Tbqt5FzJK8Z_USkCMWxXiHZp8uRN26A",
    authDomain: "mattedev-account.firebaseapp.com",
    projectId: "mattedev-account",
    storageBucket: "mattedev-account.firebasestorage.app",
    messagingSenderId: "77268069903",
    appId: "1:77268069903:web:040aa6c3981eb3650afd7a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const warningModal = document.getElementById('warningModal');
const confirmUpload = document.getElementById('confirmUpload');
const mainText = dropZone.querySelector('.main-text');
const currentPfp = document.getElementById('currentPfp');
const editPfp = document.getElementById('editPfp');

let pendingFile = null;
let currentUserUID = null;

// Gestione autenticazione
onAuthStateChanged(auth, (user) => {
    if (user) currentUserUID = user.uid;
});

// Funzione centralizzata per gestire il file selezionato
function prepareUpload(file) {
    if (file && file.type.startsWith('image/')) {
        pendingFile = file;
        warningModal.style.display = "block";
    }
}

// Click sulla zona
dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => prepareUpload(e.target.files[0]);

// LOGICA DRAG & DROP CORRETTA
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, e => e.preventDefault());
});

dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', (e) => {
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    prepareUpload(file);
});

// LOGICA CARICAMENTO CATBOX + FIREBASE
confirmUpload.onclick = async () => {
    warningModal.style.display = "none";
    if (!pendingFile || !currentUserUID) return;

    mainText.innerText = "Caricamento...";

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', pendingFile);

    try {
        // Nota: corsproxy.io è necessario solo per test in localhost
        const response = await fetch('https://corsproxy.io/?https://catbox.moe/user/api.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Errore Catbox");
        const imageUrl = (await response.text()).trim();

        // Salvataggio su Firebase
        await update(ref(db, `users/${currentUserUID}`), {
            pfp: imageUrl
        });

        // Update UI
        editPfp.value = imageUrl;
        currentPfp.src = imageUrl;
        mainText.innerText = "Profilo aggiornato!";
        
        setTimeout(() => { 
            mainText.innerText = "Trascina qui la tua immagine"; 
        }, 3000);

    } catch (err) {
        console.error(err);
        alert("Errore durante l'operazione.");
        mainText.innerText = "Riprova";
    }
};

document.getElementById('closeModal').onclick = () => {
    warningModal.style.display = "none";
    pendingFile = null;
};