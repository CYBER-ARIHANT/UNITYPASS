// ======================
// 📌 Google Sheet API URL
// ======================
const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

// ======================
// 📝 REGISTRATION
// ======================
document.getElementById('registerForm')?.addEventListener('submit', async function(e){
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const skill = document.getElementById('skill').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();

    // Validate phone number
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

        localStorage.setItem('profile', JSON.stringify(data));
        alert("Registration successful!");
        window.location.href = "profile.html";
    } catch(err) {
        console.error(err);
        alert("Registration failed. Check Sheet URL and column names.");
    }
});

// ======================
// 👤 PROFILE PAGE
// ======================
window.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if(!profile.NAME) return;

    const nameEl = document.getElementById('pName');
    const skillEl = document.getElementById('pSkill');
    const phoneEl = document.getElementById('pPhone');
    const locationEl = document.getElementById('pLocation');

    if (nameEl) nameEl.innerText = profile.NAME;
    if (skillEl) skillEl.innerText = profile.SKILL;
    if (phoneEl) phoneEl.innerText = profile.PHONE;
    if (locationEl) locationEl.innerText = profile.LOCATION;

    const qrCanvas = document.getElementById('qrCode');
    if (qrCanvas) {
        new QRious({
            element: qrCanvas,
            value: `Name: ${profile.NAME}\nSkill: ${profile.SKILL}\nPhone: ${profile.PHONE}\nLocation: ${profile.LOCATION}`,
            size: 200
        });
    }

    document.getElementById('downloadPdf')?.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("UnityPass Profile", 20, 20);
        doc.setFontSize(12);
        doc.text(`Name: ${profile.NAME}`, 20, 40);
        doc.text(`Skill: ${profile.SKILL}`, 20, 50);
        doc.text(`Phone: ${profile.PHONE}`, 20, 60);
        doc.text(`Location: ${profile.LOCATION}`, 20, 70);
        doc.addImage(qrCanvas.toDataURL("image/png"), 'PNG', 20, 80, 50, 50);
        doc.save('UnityPass_Profile.pdf');
    });

    document.getElementById('deleteProfile')?.addEventListener('click', () => {
        if(confirm("Are you sure you want to delete your profile?")){
            localStorage.removeItem('profile');
            alert("Profile deleted successfully!");
            window.location.href = "index.html";
        }
    });
});

// ======================
// 🔍 SEARCH BAR FUNCTIONALITY
// ======================
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

if (searchInput) {
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (query.length === 0) return;

        try {
            const res = await fetch(sheetUrl);
            const data = await res.json();

            const filtered = data.filter(item =>
                item.NAME?.toLowerCase().includes(query) ||
                item.SKILL?.toLowerCase().includes(query) ||
                item.LOCATION?.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                searchResults.innerHTML = '<p>No matching results found.</p>';
            } else {
                filtered.forEach(person => {
                    const card = document.createElement('div');
                    card.className = 'profile-card';
                    card.innerHTML = `
                        <h3>${person.NAME}</h3>
                        <p><strong>Skill:</strong> ${person.SKILL}</p>
                        <p><strong>Phone:</strong> ${person.PHONE}</p>
                        <p><strong>Location:</strong> ${person.LOCATION}</p>
                    `;
                    searchResults.appendChild(card);
                });
            }
        } catch (error) {
            console.error("Search error:", error);
            searchResults.innerHTML = '<p>Failed to load search results.</p>';
        }
    });
}
