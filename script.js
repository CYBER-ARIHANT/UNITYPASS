// Google Sheet API URL
const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

/* ---------------- Registration ---------------- */
document.getElementById('registerForm')?.addEventListener('submit', async function(e){
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

/* ---------------- Profile Page ---------------- */
window.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    if(profile.NAME){
        const profileHTML = `
            <p><strong>Name:</strong> ${profile.NAME}</p>
            <p><strong>Skill:</strong> ${profile.SKILL}</p>
            <p><strong>Phone:</strong> ${profile.PHONE}</p>
            <p><strong>Location:</strong> ${profile.LOCATION}</p>
        `;
        document.getElementById('profileInfo').innerHTML = profileHTML;

        const qr = new QRious({
            element: document.getElementById('qrCode'),
            value: `Name: ${profile.NAME}\nSkill: ${profile.SKILL}\nPhone: ${profile.PHONE}\nLocation: ${profile.LOCATION}`,
            size: 200
        });

        document.getElementById('qrCode').addEventListener('click', () => {
            document.getElementById('qrCode').style.transform = "scale(1.2)";
            setTimeout(() => { document.getElementById('qrCode').style.transform = "scale(1.1)"; }, 200);
        });

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
            doc.addImage(document.getElementById('qrCode').toDataURL("image/png"), 'PNG', 20, 80, 50, 50);
            doc.save('UnityPass_Profile.pdf');
        });

        document.getElementById('deleteProfile')?.addEventListener('click', async () => {
            if(confirm("Are you sure you want to delete your profile?")){
                if(profile.PHONE){
                    try { await fetch(`${sheetUrl}/PHONE/${profile.PHONE}`, { method: 'DELETE' }); } 
                    catch(e){ console.log("Failed to delete from sheet"); }
                }
                localStorage.removeItem('profile');
                alert("Profile deleted successfully!");
                window.location.href = "index.html";
            }
        });

    } else {
        document.getElementById('profileInfo').innerHTML = "<p>No profile found. Please register first.</p>";
        document.getElementById('qrCode').style.display = "none";
        document.getElementById('downloadPdf').style.display = "none";
        document.getElementById('deleteProfile').style.display = "none";
    }

    /* ---------------- Search Functionality ---------------- */
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if(searchInput){
        searchInput.addEventListener('input', async () => {
            const query = searchInput.value.trim().toLowerCase();
            if(!query){
                searchResults.innerHTML = "";
                return;
            }

            try {
                const res = await fetch(sheetUrl);
                const data = await res.json();

                const filtered = data.filter(item => 
                    item.NAME?.toLowerCase().includes(query) ||
                    item.SKILL?.toLowerCase().includes(query) ||
                    item.LOCATION?.toLowerCase().includes(query)
                );

                if(filtered.length === 0){
                    searchResults.innerHTML = "<p>No matching profiles found.</p>";
                } else {
                    searchResults.innerHTML = filtered.map(p => `
                        <div class="profile-card">
                            <p><strong>Name:</strong> ${p.NAME}</p>
                            <p><strong>Skill:</strong> ${p.SKILL}</p>
                            <p><strong>Phone:</strong> ${p.PHONE}</p>
                            <p><strong>Location:</strong> ${p.LOCATION}</p>
                        </div>
                    `).join('');
                }
            } catch(e){
                console.error("Search error:", e);
                searchResults.innerHTML = "<p>Failed to fetch profiles.</p>";
            }
        });
    }
});