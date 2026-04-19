import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const sessionLogoutBtn = document.getElementById('sessionLogoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const accountNavLinks = Array.from(document.querySelectorAll(".account-nav-link"));
const viewAccount = document.getElementById("account");
const viewSessione = document.getElementById("sessione");

const setActiveNav = (hash) => {
    accountNavLinks.forEach((link) => {
        const target = link.getAttribute("href") || "";
        link.classList.toggle("is-active", target === `#${hash}`);
    });
};

const setActiveView = (hash) => {
    const view = hash === "sessione" ? "sessione" : "account";
    if (viewAccount) viewAccount.classList.toggle("is-active", view === "account");
    if (viewSessione) viewSessione.classList.toggle("is-active", view === "sessione");
    setActiveNav(view);
};

if (accountNavLinks.length) {
    accountNavLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href") || "";
            if (!href.startsWith("#")) return;
            e.preventDefault();
            const hash = href.slice(1) || "account";
            window.location.hash = `#${hash}`;
            setActiveView(hash);
        });
    });

    const initialHash = (window.location.hash || "#account").slice(1);
    setActiveView(initialHash);

    window.addEventListener("hashchange", () => {
        const nextHash = (window.location.hash || "#account").slice(1);
        setActiveView(nextHash);
    });
}

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
if (saveBtn) saveBtn.addEventListener('click', async () => {
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

// 5. Sessione: logout + eliminazione account
if (sessionLogoutBtn) {
    sessionLogoutBtn.addEventListener("click", async () => {
        if (!confirm("Vuoi uscire?")) return;
        try {
            await signOut(auth);
            window.location.href = "/pages/login.html";
        } catch (error) {
            console.error("Errore logout:", error);
            alert("Errore durante il logout.");
        }
    });
}

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return alert("Devi essere loggato.");

        const first = confirm("Vuoi eliminare definitivamente l'account?");
        if (!first) return;

        const second = confirm("Questa azione è IRREVERSIBILE. Confermi?");
        if (!second) return;

        deleteAccountBtn.disabled = true;
        const previousText = deleteAccountBtn.textContent;
        deleteAccountBtn.textContent = "Eliminazione in corso...";

        try {
            // Prima elimina i dati su Firestore (finché l'utente è autenticato)
            const userRef = doc(db, "users", user.uid);
            await deleteDoc(userRef);

            await deleteUser(user);
            alert("Account eliminato.");
            window.location.href = "/pages/login.html";
        } catch (error) {
            console.error("Errore eliminazione account:", error);
            if (String(error?.code || "").includes("requires-recent-login")) {
                alert("Per eliminare l'account devi rieffettuare l'accesso (sicurezza). I dati su Firestore potrebbero essere già stati rimossi: effettua logout e rientra, poi riprova.");
            } else {
                alert("Errore durante l'eliminazione dell'account.");
            }
        } finally {
            deleteAccountBtn.disabled = false;
            deleteAccountBtn.textContent = previousText;
        }
    });
}
// Funzione globale per aggiornare Firestore quando l'upload della foto finisce
window.updateFirestorePfp = async (newUrl) => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { pfp: newUrl });
        console.log("Firestore aggiornato con il nuovo URL della foto!");
    }
};
