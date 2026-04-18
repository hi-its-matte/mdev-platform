import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Configurazione Iniziale
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
const db = getFirestore(app);

// Elementi DOM
const displayUsername = document.getElementById('displayUsername');
const currentPfp = document.getElementById('currentPfp');
const editUsername = document.getElementById('editUsername');
const editBio = document.getElementById('editBio');
const saveBtn = document.getElementById('saveBtn');

// 2. Gestione Autenticazione (Risolve il problema del refresh)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Utente autenticato:", user.uid);
        await loadUserData(user.uid);
    } else {
        console.warn("Nessun utente loggato. Reindirizzamento...");
        // window.location.href = "login.html"; // Decommenta quando hai la pagina di login pronta
    }
});

// 3. Funzione per caricare i dati da Firestore
async function loadUserData(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();

            // Aggiorna la UI con i dati del database
            displayUsername.textContent = data.username || "Utente";
            currentPfp.src = data.pfp || "https://via.placeholder.com/70";
            
            // Popola i campi input
            editUsername.value = data.username || "";
            editBio.value = data.bio || "";
            
            console.log("Dati caricati correttamente");
        } else {
            console.error("Documento utente non trovato in Firestore per l'UID:", uid);
        }
    } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
    }
}

// 4. Salvataggio dei dati modificati
saveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return alert("Devi essere loggato per salvare!");

    saveBtn.disabled = true;
    saveBtn.textContent = "Salvataggio in corso...";

    try {
        const userRef = doc(db, "users", user.uid);
        const updatedData = {
            username: editUsername.value,
            bio: editBio.value
            // Nota: il pfp viene aggiornato tramite Pfp.js caricando su Catbox
        };

        await updateDoc(userRef, updatedData);

        // Aggiorna la UI locale
        displayUsername.textContent = editUsername.value;
        
        alert("Profilo aggiornato con successo!");
    } catch (error) {
        console.error("Errore nel salvataggio:", error);
        alert("Errore nel salvataggio dei dati.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Salva impostazioni account";
    }
});