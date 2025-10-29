// Google Sheet API
const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

/* ---------------- Registration ---------------- */
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
    alert("Registration failed. Please check Sheet URL or column names.");
  }
});

/* ---------------- Profile Page ---------------- */
window.addEventListener('DOMContentLoaded', () => {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const profileInfo = document.getElementById('profileInfo');

  if (profile.NAME && profileInfo) {
    profileInfo.innerHTML = `
      <div class="profile-card fade-in">
        <img src="images/avatar.png" class="avatar" alt="Avatar">
        <div>
          <p><strong>Name:</strong> ${profile.NAME}</p>
          <p><strong>Skill:</strong> ${profile.SKILL}</p>
          <p><strong>Phone:</strong> ${profile.PHONE}</p>
          <p><strong>Location:</strong> ${profile.LOCATION}</p>
        </div>
      </div>
    `;

    // QR Code Generation
    const qrContainer = document.getElementById("qrCode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: `Name: ${profile.NAME}\nSkill: ${profile.SKILL}\nPhone: ${profile.PHONE}\nLocation: ${profile.LOCATION}`,
      width: 200,
      height: 200
    });

    // Small bounce animation on QR load
    setTimeout(() => {
      qrContainer.style.transition = "transform 0.3s ease";
      qrContainer.style.transform = "scale(1.1)";
      setTimeout(() => { qrContainer.style.transform = "scale(1)"; }, 300);
    }, 400);

    // PDF Download
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

      const qrCanvas = qrContainer.querySelector('canvas');
      if (qrCanvas) {
        const qrImg = qrCanvas.toDataURL("image/png");
        doc.addImage(qrImg, 'PNG', 20, 80, 50, 50);
      }

      doc.save('UnityPass_Profile.pdf');
    });

    // Delete Profile
    document.getElementById('deleteProfile').addEventListener('click', () => {
      if (confirm("Are you sure you want to delete your profile?")) {
        localStorage.removeItem('profile');
        alert("Profile deleted successfully!");
        window.location.href = "index.html";
      }
    });

  } else if (profileInfo) {
    profileInfo.innerHTML = "<p>No profile found. Please register first.</p>";
  }
});

/* ---------------- Search Feature ---------------- */
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

      const filtered = data.filter(item =>
        item.NAME?.toLowerCase().includes(query) ||
        item.SKILL?.toLowerCase().includes(query) ||
        item.LOCATION?.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = '<p>No matching results found.</p>';
      } else {
        searchResults.innerHTML = filtered.map(p => `
          <div class="profile-card fade-in">
            <img src="images/avatar.png" class="avatar" alt="Avatar">
            <div>
              <p><strong>Name:</strong> ${p.NAME}</p>
              <p><strong>Skill:</strong> ${p.SKILL}</p>
              <p><strong>Phone:</strong> ${p.PHONE}</p>
              <p><strong>Location:</strong> ${p.LOCATION}</p>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error("Search error:", e);
      searchResults.innerHTML = "<p>Failed to fetch profiles.</p>";
    }
  });
}