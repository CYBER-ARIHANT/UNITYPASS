const API_URL = 'https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe';
const container = document.getElementById('idCardsContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
let workers = [];

async function loadData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    workers = Array.isArray(data) ? data : [];
    displayWorkers(workers);
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error loading data</p>`;
  }
}

function displayWorkers(list) {
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<p>No records found.</p>';
    return;
  }
  list.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'id-card';
    card.innerHTML = `
      <h2>${w.Name || '—'}</h2>
      <p><strong>Skill:</strong> ${w.Skill || '—'}</p>
      <p><strong>Phone:</strong> ${w.Phone || '—'}</p>
      <p><strong>Location:</strong> ${w.Location || '—'}</p>
      <div class="qr-code" id="qr-${i}"></div>
      <button class="download-btn" data-i="${i}">Download PDF</button>
    `;
    container.appendChild(card);

    const qrText = `Name: ${w.Name}\nSkill: ${w.Skill}\nPhone: ${w.Phone}\nLocation: ${w.Location}`;
    new QRCode(document.getElementById(`qr-${i}`), { text: qrText, width: 100, height: 100 });

    card.querySelector('.download-btn').addEventListener('click', () => downloadPDF(w));
  });
}

function downloadPDF(worker) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a6' });
  doc.text(`Name: ${worker.Name}`, 10, 20);
  doc.text(`Skill: ${worker.Skill}`, 10, 30);
  doc.text(`Phone: ${worker.Phone}`, 10, 40);
  doc.text(`Location: ${worker.Location}`, 10, 50);
  doc.save(`${worker.Name}_UnityPass.pdf`);
}

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  const filtered = workers.filter(w =>
    (w.Name || '').toLowerCase().includes(term) ||
    (w.Skill || '').toLowerCase().includes(term) ||
    (w.Location || '').toLowerCase().includes(term)
  );
  displayWorkers(filtered);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  displayWorkers(workers);
});

loadData();