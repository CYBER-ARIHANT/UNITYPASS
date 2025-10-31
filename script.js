const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

/* ---------- Registration ---------- */
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const skill = document.getElementById('skill').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const location = document.getElementById('location').value.trim();

  if (!/^\d{10}$/.test(phone)) {
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

    if (!res.ok) throw new Error("Failed to register");

    localStorage.setItem('profile', JSON.stringify(data));
    alert("Registration successful!");
    window.location.href = "profile.html";
  } catch (err) {
    console.error(err);
    alert("Registration failed. Please check SheetBest link.");
  }
});

/* ---------- Profile Page ---------- */
window.addEventListener('DOMContentLoaded', () => {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const info = document.getElementById('profileInfo');
  const qrContainer = document.getElementById('qrCode');

  if (profile.NAME && info) {
    info.innerHTML = `
      <div class="profile-card">
        <img src="images/avatar.png" class="avatar">
        <div>
          <p><strong>Name:</strong> ${profile.NAME}</p>
          <p><strong>Skill:</strong> ${profile.SKILL}</p>
          <p><strong>Phone:</strong> ${profile.PHONE}</p>
          <p><strong>Location:</strong> ${profile.LOCATION}</p>
        </div>
      </div>
    `;

    new QRCode(qrContainer, {
      text: `Name: ${profile.NAME}\nSkill: ${profile.SKILL}\nPhone: ${profile.PHONE}\nLocation: ${profile.LOCATION}`,
      width: 200,
      height: 200
    });

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
      const qrCanvas = qrContainer.querySelector('canvas');
      if (qrCanvas) {
        const qrImg = qrCanvas.toDataURL("image/png");
        doc.addImage(qrImg, 'PNG', 20, 80, 50, 50);
      }
      doc.save('UnityPass_Profile.pdf');
    });

    document.getElementById('deleteProfile')?.addEventListener('click', () => {
      if (confirm("Delete your profile?")) {
        localStorage.removeItem('profile');
        alert("Profile deleted successfully!");
        window.location.href = "index.html";
      }
    });
  }

  /* ---------- Search ---------- */
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput) {
    searchInput.addEventListener('input', async () => {
      const query = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';

      if (!query) return;

      try {
        const res = await fetch(sheetUrl);
        const data = await res.json();
        const filtered = data.filter(p =>
          p.NAME?.toLowerCase().includes(query) ||
          p.SKILL?.toLowerCase().includes(query) ||
          p.LOCATION?.toLowerCase().includes(query)
        );

        searchResults.innerHTML = filtered.length
          ? filtered.map(p => `
            <div class="profile-card">
              <img src="images/avatar.png" class="avatar">
              <div>
                <p><strong>Name:</strong> ${p.NAME}</p>
                <p><strong>Skill:</strong> ${p.SKILL}</p>
                <p><strong>Phone:</strong> ${p.PHONE}</p>
                <p><strong>Location:</strong> ${p.LOCATION}</p>
              </div>
            </div>`).join('')
          : "<p>No matching profiles found.</p>";
      } catch {
        searchResults.innerHTML = "<p>Failed to fetch profiles.</p>";
      }
    });
  }
});