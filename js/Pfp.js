import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; // Importa Firestore

// 1. Configurazione Firebase
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
const db = getFirestore(app); // Inizializza Firestore

// Riferimenti DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const warningModal = document.getElementById('warningModal');
const confirmUpload = document.getElementById('confirmUpload');
const mainText = dropZone.querySelector('.main-text');
const currentPfp = document.getElementById('currentPfp');

let pendingFile = null;
let currentUserUID = null;

// Recupera l'utente corrente
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUID = user.uid;
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

// Logica Upload
confirmUpload.onclick = async () => {
    warningModal.style.display = "none";
    if (!pendingFile || !currentUserUID) return;

    mainText.innerText = "Elaborazione immagine...";

    const formData = new FormData();
    formData.append('image', pendingFile);
    formData.append('uid', currentUserUID);

    try {
        // 1. Upload sul tuo server Ubuntu
        const response = await fetch('https://pfp-api.mattedev.com/upload-pfp', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Errore Server: ${response.status}`);
        const data = await response.json();

        if (data.url) {
            // 2. Aggiorna Firestore con l'URL corretto (quello col trattino -)
            const userRef = doc(db, "users", currentUserUID);
            await updateDoc(userRef, {
                pfp: data.url // Salva il link nel campo 'pfp' del documento UID
            });

            // 3. Aggiorna UI
            currentPfp.src = data.url;
            mainText.innerText = "Profilo aggiornato con successo!";
            
            setTimeout(() => { 
                mainText.innerText = "Trascina qui la tua immagine"; 
            }, 3000);
        }

    } catch (err) {
        console.error("Errore:", err);
        mainText.innerText = "Errore durante il caricamento";
        alert("Errore nell'aggiornamento del profilo.");
    }
};

document.getElementById('closeModal').onclick = () => {
    warningModal.style.display = "none";
    pendingFile = null;
};