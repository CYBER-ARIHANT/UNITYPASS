const sheetUrl = "https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

// Registration
document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const skill = document.getElementById('skill').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const location = document.getElementById('location').value.trim();
  const msg = document.getElementById('message');

  if(!/^\d{10}$/.test(phone)) { msg.innerText = "Phone must be 10 digits"; msg.style.color="red"; return; }

  const data = { NAME: name, SKILL: skill, PHONE: phone, LOCATION: location };
  try {
    const res = await fetch(sheetUrl, {
      method: 'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
    });
    if(!res.ok) throw new Error("Sheet error");
    localStorage.setItem('profile', JSON.stringify(data));
    msg.innerText="Registration successful!"; msg.style.color="green";
    setTimeout(()=>window.location.href="profile.html",1000);
  } catch(err) { console.error(err); msg.innerText="Registration failed!"; msg.style.color="red"; }
});

// Profile
document.addEventListener('DOMContentLoaded', ()=>{
  const profile = JSON.parse(localStorage.getItem('profile'));
  const container = document.getElementById('profileContainer');
  if(!profile) { alert("No profile found."); window.location.href="register.html"; return; }

  container.innerHTML = `
    <p><strong>Name:</strong> ${profile.NAME}</p>
    <p><strong>Skill:</strong> ${profile.SKILL}</p>
    <p><strong>Phone:</strong> ${profile.PHONE}</p>
    <p><strong>Location:</strong> ${profile.LOCATION}</p>
    <div id="qrcode"></div>
    <button id="downloadPDF" class="btn">Download PDF</button>
    <button id="deleteProfile" class="btn danger">Delete Profile</button>
  `;

  new QRCode(document.getElementById("qrcode"), {
    text:`Name:${profile.NAME}\nSkill:${profile.SKILL}\nPhone:${profile.PHONE}\nLocation:${profile.LOCATION}`,
    width:150,height:150
  });

  document.getElementById('downloadPDF').addEventListener('click', ()=>{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const logo = new Image(); logo.src='Unitypass.jpg';
    logo.onload = ()=>{
      doc.addImage(logo,'JPEG',10,10,40,20);
      doc.setFontSize(16); doc.text("UnityPass Profile",60,25);
      doc.setFontSize(12);
      doc.text(`Name: ${profile.NAME}`,20,50);
      doc.text(`Skill: ${profile.SKILL}`,20,60);
      doc.text(`Phone: ${profile.PHONE}`,20,70);
      doc.text(`Location: ${profile.LOCATION}`,20,80);
      const qrCanvas = document.querySelector('#qrcode canvas');
      doc.addImage(qrCanvas.toDataURL('image/png'),'PNG',150,50,40,40);
      doc.save('UnityPass_Profile.pdf');
    };
  });

  document.getElementById('deleteProfile').addEventListener('click', ()=>{
    if(confirm("Are you sure?")) { localStorage.removeItem('profile'); window.location.href="index.html"; }
  });
});