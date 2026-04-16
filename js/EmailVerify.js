import { auth } from './auth.js'; // Assicurati che il percorso sia corretto
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";

const resendBtn = document.getElementById('resendEmail');

resendBtn.onclick = async () => {
    const user = auth.currentUser;

    if (user) {
        try {
            await sendEmailVerification(user);
            alert("Email di verifica inviata! Controlla anche nella cartella SPAM.");
        } catch (error) {
            console.error("Errore nell'invio:", error);
            alert("Errore: troppe richieste. Riprova più tardi.");
        }
    } else {
        alert("Nessun utente loggato. Torna al login.");
        window.location.href = "/login.html";
    }
};