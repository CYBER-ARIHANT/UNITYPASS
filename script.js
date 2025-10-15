const API_URL = 'https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe';

const container = document.getElementById('idCardsContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');

let workers = [];

// 1️⃣ Load data from SheetBest
async function loadData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Network error: ' + res.status);
    const data = await res.json();
    workers = Array.isArray(data) ? data : [];
    // DO NOT display all cards immediately
    container.innerHTML = '<p style="text-align:center;color:#666">Type a name, skill, or location to search</p>';
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;text-align:center">Error loading data</p>`;
  }
}

// 2️⃣ Display workers function
function displayWorkers(list) {
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<p style="text-align:center;color:#666">No matching records found.</p>';
    return;
  }

  list.forEach((w, idx) => {
    const safeId = (w.Name || 'no-name').replace(/\s+/g,'_').replace(/[^\w\-]/g,'');
    const card = document.createElement('div');
    card.className = 'id-card';
    card.innerHTML = `
      <h2>${w.Name || '—'}</h2>
      <p><strong>Skill:</strong> ${w.Skill || '—'}</p>
      <p><strong>Phone:</strong> ${w.Phone || '—'}</p>
      <p><strong>Location:</strong> ${w.Location || '—'}</p>
      <div class="qr-code" id="qr-${safeId}-${idx}"></div>
      <button class="download-btn" data-idx="${idx}">Download PDF</button>
    `;
    container.appendChild(card);

    // QR code
    const qrText = `Name: ${w.Name || ''}\nSkill: ${w.Skill || ''}\nPhone: ${w.Phone || ''}\nLocation: ${w.Location || ''}`;
    new QRCode(document.getElementById(`qr-${safeId}-${idx}`), {
      text: qrText,
      width: 100,
      height: 100
    });

    // PDF download
    card.querySelector('.download-btn').addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a6' });
      doc.setFontSize(14);
      doc.text(`Name: ${w.Name || ''}`, 10, 20);
      doc.setFontSize(12);
      doc.text(`Skill: ${w.Skill || ''}`, 10, 30);
      doc.text(`Phone: ${w.Phone || ''}`, 10, 40);
      doc.text(`Location: ${w.Location || ''}`, 10, 50);
      doc.save((w.Name || 'idcard').replace(/\s+/g,'_') + '_UnityPass.pdf');
    });
  });
}

// 3️⃣ Search input event
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    container.innerHTML = '<p style="text-align:center;color:#666">Type a name, skill, or location to search</p>';
    return;
  }
  const filtered = workers.filter(w =>
    (w.Name || '').toLowerCase().includes(term) ||
    (w.Skill || '').toLowerCase().includes(term) ||
    (w.Location || '').toLowerCase().includes(term)
  );
  displayWorkers(filtered);
});

// 4️⃣ Clear button
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  container.innerHTML = '<p style="text-align:center;color:#666">Type a name, skill, or location to search</p>';
});

// Start
loadData();