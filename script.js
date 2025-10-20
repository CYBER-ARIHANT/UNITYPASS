// Google Sheet API URL
const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

/* ---------------- Registration ---------------- */
document.getElementById('registerForm')?.addEventListener('submit', async function(e){
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const skill = document.getElementById('skill').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();

    // Validate phone: exactly 10 digits
    if(!/^\d{10}$/.test(phone)){
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    const data = {
        NAME: name,
        SKILL: skill,
        PHONE: phone,
        LOCATION: location
    };

    try {
        const res = await fetch(sheetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(!res.ok) throw new Error("Failed to register");

        const response = await res.json();
        console.log("SheetBest response:", response);

        // Save profile locally
        localStorage.setItem('profile', JSON.stringify(data));

        alert("Registration successful!");
        window.location.href = "profile.html";
    } catch(err) {
        console.error(err);
        alert("Registration failed. Check Sheet URL and column names.");
    }
});

/* ---------------- Profile Page ---------------- */
window.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    if(!profile.NAME){
        alert("No profile found. Please register first.");
        window.location.href = "register.html";
        return;
    }

    // Display profile info
    document.getElementById('pName').innerText = profile.NAME;
    document.getElementById('pSkill').innerText = profile.SKILL;
    document.getElementById('pPhone').innerText = profile.PHONE;
    document.getElementById('pLocation').innerText = profile.LOCATION;

    // Generate QR code
    const qr = new QRious({
        element: document.getElementById('qrCode'),
        value: `Name: ${profile.NAME}\nSkill: ${profile.SKILL}\nPhone: ${profile.PHONE}\nLocation: ${profile.LOCATION}`,
        size: 200
    });

    // QR bounce on click
    const qrCanvas = document.getElementById('qrCode');
    qrCanvas.addEventListener('click', () => {
        qrCanvas.style.transform = "scale(1.2)";
        setTimeout(() => { qrCanvas.style.transform = "scale(1.1)"; }, 200);
    });

    // PDF download
    document.getElementById('downloadPdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(16);
        doc.setTextColor(255,102,0);
        doc.text("UnityPass Profile", 20, 20);

        // Profile Info
        doc.setFontSize(12);
        doc.setTextColor(0,0,0);
        doc.text(`Name: ${profile.NAME}`, 20, 40);
        doc.text(`Skill: ${profile.SKILL}`, 20, 50);
        doc.text(`Phone: ${profile.PHONE}`, 20, 60);
        doc.text(`Location: ${profile.LOCATION}`, 20, 70);

        // About Us
        doc.setFontSize(12);
        doc.text("About Us:", 20, 85);
        doc.text("We are a team of students from class 9 — Arihant Jha, Aarav Arora, and Prisha Jain. We created this website to facilitate employment and empowerment opportunities for unskilled laborers.", 20, 92, {maxWidth: 170});

        // About UnityPass
        doc.text("About UnityPass:", 20, 110);
        doc.text("UnityPass is a digital skill ID card designed to help individuals document and showcase their skills in a professional manner, connect with employers, and access employment opportunities.", 20, 117, {maxWidth: 170});

        // QR Code
        doc.addImage(document.getElementById('qrCode').toDataURL("image/png"), 'PNG', 150, 30, 50, 50);

        doc.save('UnityPass_Profile.pdf');
    });

    // Delete profile
    document.getElementById('deleteProfile')?.addEventListener('click', async () => {
        if(confirm("Are you sure you want to delete your profile?")){
            if(profile.PHONE){
                try {
                    await fetch(`https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe/PHONE/${profile.PHONE}`, { method: 'DELETE' });
                } catch(e){ console.log("Failed to delete from sheet"); }
            }
            localStorage.removeItem('profile');
            alert("Profile deleted successfully!");
            window.location.href = "index.html";
        }
    });
});