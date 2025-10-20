// Hamburger toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Highlight current page
const currentPage = window.location.pathname.split("/").pop();

switch(currentPage) {
  case "index.html":
    document.getElementById("home-link").classList.add("active");
    break;
  case "register.html":
    document.getElementById("register-link").classList.add("active");
    break;
  case "profile.html":
    document.getElementById("profile-link").classList.add("active");
    break;
  case "admin.html":
    document.getElementById("admin-link").classList.add("active");
    break;
}

// Register form submission
const form = document.getElementById("register-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const skills = document.getElementById("skills").value;

    document.getElementById("register-msg").innerText = `Registered ${name} with skills: ${skills}`;
    form.reset();

    // TODO: Add Google Sheet API integration here
  });
}

// Profile QR Code + PDF
if (document.getElementById("profile-card")) {
  const name = document.getElementById("profile-name").innerText;
  const email = document.getElementById("profile-email").innerText;
  const skills = document.getElementById("profile-skills").innerText;

  // QR Code
  new QRCode(document.getElementById("qrcode"), {
    text: `Name: ${name}\nEmail: ${email}\nSkills: ${skills}`,
    width: 128,
    height: 128,
  });

  // Download PDF
  document.getElementById("download-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("UnityPass", 20, 20);
    doc.setFontSize(14);
    doc.text(`Name: ${name}`, 20, 40);
    doc.text(`Email: ${email}`, 20, 50);
    doc.text(`Skills: ${skills}`, 20, 60);

    const qrImg = document.querySelector("#qrcode img");
    if (qrImg) {
      doc.addImage(qrImg.src, "PNG", 150, 20, 40, 40);
    }

    doc.save(`${name}_UnityPass.pdf`);
  });
}