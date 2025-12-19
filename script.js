const sheetUrl =
"https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";

/* ---------- REGISTER ---------- */
document.getElementById("registerForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const phone = document.getElementById("phone").value.trim();
  if (!/^\d{10}$/.test(phone)) {
    alert("Phone must be exactly 10 digits");
    return;
  }

  const data = {
    NAME: name.value.trim(),
    SKILL: skill.value.trim(),
    PHONE: phone,
    LOCATION: location.value.trim()
  };

  await fetch(sheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  localStorage.setItem("profile", JSON.stringify(data));
  location.href = "profile.html";
});

/* ---------- PROFILE ---------- */
window.onload = () => {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  if (!profile.NAME) return;

  profileInfo.innerHTML = `
    <p><strong>Name:</strong> ${profile.NAME}</p>
    <p><strong>Skill:</strong> ${profile.SKILL}</p>
    <p><strong>Phone:</strong> ${profile.PHONE}</p>
    <p><strong>Location:</strong> ${profile.LOCATION}</p>
  `;

  new QRCode(document.getElementById("qrCode"), {
    text: `Name: ${profile.NAME}
Skill: ${profile.SKILL}
Phone: ${profile.PHONE}
Location: ${profile.LOCATION}`,
    width: 180,
    height: 180
  });

  document.getElementById("downloadPdf").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("UNITYPASS SKILL ID", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Name: ${profile.NAME}`, 20, 50);
    doc.text(`Skill: ${profile.SKILL}`, 20, 65);
    doc.text(`Phone: ${profile.PHONE}`, 20, 80);
    doc.text(`Location: ${profile.LOCATION}`, 20, 95);

    const qrCanvas = document.querySelector("#qrCode canvas");
    doc.addImage(qrCanvas.toDataURL("image/png"), "PNG", 130, 60, 50, 50);

    doc.save("UnityPass_ID.pdf");
  };
};