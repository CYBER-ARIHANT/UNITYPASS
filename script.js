const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

/* ---------- Smooth scroll and small UI helpers ---------- */
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'registerNow') {
    window.location.href = 'register.html';
  }
});

/* ---------- Registration ---------- */
document.getElementById('registerForm')?.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const name = document.getElementById('name').value.trim();
  const skill = document.getElementById('skill').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const location = document.getElementById('location').value.trim();
  if (!/^\d{10}$/.test(phone)) { alert('Phone number must be exactly 10 digits.'); return; }
  const data = { NAME: name, SKILL: skill, PHONE: phone, LOCATION: location };
  try {
    const res = await fetch(sheetUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to register');
    localStorage.setItem('profile', JSON.stringify(data));
    alert('Registration successful!');
    window.location.href = 'profile.html';
  } catch (err) {
    console.error(err);
    alert('Registration failed. Please check SheetBest link and sheet column names.');
  }
});

/* ---------- Profile page: display profile and QR ---------- */
window.addEventListener('DOMContentLoaded', () => {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const info = document.getElementById('profileInfo');
  const qrContainer = document.getElementById('qrCode');

  if (profile.NAME && info) {
    info.innerHTML = `<div class="profile-card"><img src="images/avatar.png" class="avatar" alt="Avatar"><div><p><strong>Name:</strong> ${profile.NAME}</p><p><strong>Skill:</strong> ${profile.SKILL}</p><p><strong>Phone:</strong> ${profile.PHONE}</p><p><strong>Location:</strong> ${profile.LOCATION}</p></div></div>`;

    // Generate QR: try QRCode lib, else use Google Chart API fallback image
    const qrText = `Name: ${profile.NAME}\\nSkill: ${profile.SKILL}\\nPhone: ${profile.PHONE}\\nLocation: ${profile.LOCATION}`;
    qrContainer.innerHTML = '';
    try {
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, { text: qrText, width: 200, height: 200 });
      } else {
        const img = document.createElement('img');
        img.alt = 'QR code';
        img.src = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + encodeURIComponent(qrText);
        qrContainer.appendChild(img);
      }
    } catch (e) {
      console.error('QR error', e);
      const img = document.createElement('img');
      img.src = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + encodeURIComponent(qrText);
      qrContainer.appendChild(img);
    }

    // PDF: try jspdf, else open printable window (user can save as PDF)
    document.getElementById('downloadPdf')?.addEventListener('click', () => {
      const qrImg = qrContainer.querySelector('img') || qrContainer.querySelector('canvas');
      if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        try {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          doc.setFontSize(16);
          doc.text('UnityPass Profile', 20, 20);
          doc.setFontSize(12);
          doc.text(`Name: ${profile.NAME}`, 20, 40);
          doc.text(`Skill: ${profile.SKILL}`, 20, 50);
          doc.text(`Phone: ${profile.PHONE}`, 20, 60);
          doc.text(`Location: ${profile.LOCATION}`, 20, 70);
          if (qrImg) {
            // if canvas
            if (qrImg.tagName === 'CANVAS') {
              const dataUrl = qrImg.toDataURL('image/png');
              doc.addImage(dataUrl, 'PNG', 20, 80, 50, 50);
            } else if (qrImg.tagName === 'IMG') {
              doc.addImage(qrImg.src, 'PNG', 20, 80, 50, 50);
            }
          }
          doc.save('UnityPass_Profile.pdf');
          return;
        } catch (e) { console.warn('jsPDF failed, fallback to print', e); }
      }
      // Fallback: open printable page
      const win = window.open('', '_blank');
      const html = `<html><head><title>UnityPass Profile</title><style>body{font-family:Arial;padding:20px} .card{border:1px solid #ddd;padding:16px;border-radius:8px}</style></head><body><h2>UnityPass Profile</h2><div class="card"><p><strong>Name:</strong> ${profile.NAME}</p><p><strong>Skill:</strong> ${profile.SKILL}</p><p><strong>Phone:</strong> ${profile.PHONE}</p><p><strong>Location:</strong> ${profile.LOCATION}</p></div><div>${qrImg ? ('<img src=\"'+(qrImg.tagName==='IMG'?qrImg.src:qrImg.toDataURL())+'\"/>') : ''}</div></body></html>`;
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
    });

    document.getElementById('deleteProfile')?.addEventListener('click', () => {
      if (confirm('Delete your profile?')) {
        localStorage.removeItem('profile');
        alert('Profile deleted.');
        window.location.href = 'index.html';
      }
    });
  }

  /* ---------- Search ---------- */
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => doSearch(searchInput.value.trim().toLowerCase()), 250);
    });
    async function doSearch(q) {
      searchResults.innerHTML = '';
      if (!q) return;
      try {
        const res = await fetch(sheetUrl);
        const data = await res.json();
        const filtered = data.filter(p => (p.NAME||'').toLowerCase().includes(q) || (p.SKILL||'').toLowerCase().includes(q) || (p.LOCATION||'').toLowerCase().includes(q));
        if (!filtered.length) { searchResults.innerHTML = '<p>No matching profiles found.</p>'; return; }
        searchResults.innerHTML = filtered.map(p=>`<div class="profile-card"><img src="images/avatar.png" class="avatar"><div><p><strong>Name:</strong> ${p.NAME}</p><p><strong>Skill:</strong> ${p.SKILL}</p><p><strong>Phone:</strong> ${p.PHONE}</p><p><strong>Location:</strong> ${p.LOCATION}</p></div></div>`).join('');
      } catch (e) { console.error(e); searchResults.innerHTML = '<p>Failed to fetch profiles.</p>'; }
    }
  }

});