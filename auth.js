import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 1. Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7Tbqt5FzJK8Z_USkCMWxXiHZp8uRN26A",
  authDomain: "mattedev-account.firebaseapp.com",
  projectId: "mattedev-account",
  storageBucket: "mattedev-account.firebasestorage.app",
  messagingSenderId: "77268069903",
  appId: "1:77268069903:web:040aa6c3981eb3650afd7a"
};

// 2. Inizializzazione Servizi
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * FUNZIONE: Caricamento Dati Utente
 * Mappa i dati da Firestore agli elementi HTML della Dashboard e dell'Account
 */
async function loadUserData(user) {
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    // Dati iniziali di fallback
    let userData = {
      username: user.email.split('@')[0],
      pfp: 'https://ui-avatars.com/api/?name=' + user.uid,
      bio: '', // Chiave fondamentale richiesta
      isPrivate: false
    };

    if (snap.exists()) {
      userData = snap.data();
      console.log("Dati recuperati da Firebase:", userData);
    }

    // --- AGGIORNAMENTO NAVBAR E ISLAND ---
    const navName = document.getElementById('navName');
    const navPfp = document.getElementById('navPfp');
    if (navName) navName.textContent = userData.username || "User";
    if (navPfp) navPfp.src = userData.pfp || 'https://ui-avatars.com/api/?name=' + user.uid;

    // --- AGGIORNAMENTO PAGINA ACCOUNT ---
    // Usiamo variabili per evitare errori 'null' se un ID manca in una pagina specifica
    const inputUser = document.getElementById('editUsername');
    const inputPfp = document.getElementById('editPfp');
    const inputBio = document.getElementById('editBio'); 
    const inputPrivate = document.getElementById('editPrivate');
    const previewPfp = document.getElementById('currentPfp');
    const previewName = document.getElementById('displayUsername');
    const previewBio = document.getElementById('displayBio');
    const profileUrl = document.getElementById('profileUrlText');

    // Riempimento campi Input
    if (inputUser) inputUser.value = userData.username || "";
    if (inputPfp) inputPfp.value = userData.pfp || "";
    if (inputBio) inputBio.value = userData.bio || ""; // Legge correttamente 'bio'
    if (inputPrivate) inputPrivate.checked = userData.isPrivate || false;

    // Riempimento Anteprime Visuali (il box grigio nello screenshot)
    if (previewPfp) previewPfp.src = userData.pfp || "";
    if (previewName) previewName.textContent = "@" + (userData.username || "User");
    if (previewBio) previewBio.textContent = userData.bio || "Nessuna bio impostata.";

  } catch (err) {
    console.error("Errore critico durante loadUserData:", err);
  }
}

/**
 * GESTORE: Stato Autenticazione
 * Controlla se l'utente è loggato e protegge le rotte
 */
onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;
  const isAuthPage = path.includes('login.html');

  if (user) {
    loadUserData(user);
    // Se loggato non può stare nel login
    if (isAuthPage) window.location.href = 'dashboard.html';
  } else {
    // Se non loggato può stare solo in login o index
    if (!isAuthPage && !path.endsWith('index.html') && path !== '/') {
      window.location.href = 'login.html';
    }
  }
});

/**
 * FUNZIONE GLOBALE: Salva Account
 * Salva i dati inclusa la BIO nel database
 */
window.saveAccount = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Sessione scaduta, effettua nuovamente il login.");

  const btn = document.getElementById('saveBtn');
  
  // Recupero valori con protezione null-check (risolve l'errore nello screenshot)
  const userVal = document.getElementById('editUsername')?.value || "";
  const pfpVal = document.getElementById('editPfp')?.value || "";
  const bioVal = document.getElementById('editBio')?.value || ""; // Puntiamo a bio
  const privateVal = document.getElementById('editPrivate')?.checked || false;

  if (!userVal) return alert("Lo username non può essere vuoto!");

  btn.innerText = "Sincronizzazione...";
  btn.disabled = true;

  const dataToSave = {
    username: userVal,
    pfp: pfpVal,
    bio: bioVal, // Salviamo come chiave 'bio'
    isPrivate: privateVal,
    lastUpdate: serverTimestamp(),
    uid: user.uid
  };

  try {
    await setDoc(doc(db, 'users', user.uid), dataToSave, { merge: true });
    
    // Feedback visivo immediato
    console.log("Salvataggio completato per UID:", user.uid);
    alert("Dati salvati correttamente nel database!");
    
    window.location.reload();
  } catch (e) {
    console.error("Errore Firestore:", e);
    alert("Errore durante il salvataggio: " + e.message);
  } finally {
    if (btn) {
      btn.innerText = "Salva impostazioni account";
      btn.disabled = false;
    }
  }
};

/**
 * INTERAZIONI UI: Menu e Eventi
 */
document.addEventListener('DOMContentLoaded', () => {
  const island = document.getElementById('profileIsland');
  const dropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  // Toggle Isola Dinamica
  if (island && dropdown) {
    island.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      console.log("Dropdown status:", dropdown.classList.contains('active'));
    });
  }


  // Chiusura dropdown intelligente
  window.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  // Logout sicuro
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm("Sei sicuro di voler uscire?")) {
        await signOut(auth);
        window.location.href = 'login.html';
      }
    });
  }
});

/**
 * AUTENTICAZIONE: Login e Registrazione
 */
window.handleAuth = async () => {
  const emailField = document.getElementById('email');
  const passField = document.getElementById('password');
  const authBtn = document.getElementById('authBtn');

  if (!emailField || !passField) return;

  const email = emailField.value;
  const pass = passField.value;
  const isLogin = authBtn.innerText === "Accedi";

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      await createUserWithEmailAndPassword(auth, email, pass);
    }
  } catch (err) {
    console.error("Errore Auth:", err.code);
    alert("Accesso negato: " + err.message);
  }
};

document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        // Colleghiamo il click del pulsante alla funzione handleAuth
        authBtn.addEventListener('click', window.handleAuth);
    }
});