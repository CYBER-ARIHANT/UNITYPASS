// Google Sheet API URL (replace with your own)
const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

// Registration form submission
document.getElementById('registerForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const skill = document.getElementById('skill').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();

    if(!/^\d{10}$/.test(phone)){
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    const data = { NAME: name, SKILL: skill, PHONE: phone, LOCATION: location };

    fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        document.getElementById('message').innerText = "Registration successful!";
        localStorage.setItem('profile', JSON.stringify(data));
        setTimeout(() => { window.location.href = "profile.html"; }, 1000);
    })
    .catch(err => {
        document.getElementById('message').innerText = "Registration failed. Try again.";
    });
});

// Profile page
window.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if(!profile.NAME) return;

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

    // Download PDF
    document.getElementById('downloadPdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("UnityPass Profile", 20, 20);
        doc.setFontSize(12);
        doc.text(`Name: ${profile.NAME}`, 20, 40);
        doc.text(`Skill: ${profile.SKILL}`, 20, 50);
        doc.text(`Phone: ${profile.PHONE}`, 20, 60);
        doc.text(`Location: ${profile.LOCATION}`, 20, 70);
        const qrCanvas = document.getElementById('qrCode');
        doc.addImage(qrCanvas.toDataURL("image/png"), 'PNG', 20, 80, 50, 50);
        doc.save('UnityPass_Profile.pdf');
    });
});