// Hamburger toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
hamburger.addEventListener("click", () => { navLinks.classList.toggle("active"); });

// Highlight current page
const currentPage = window.location.pathname.split("/").pop();
switch(currentPage){
  case "index.html": document.getElementById("home-link").classList.add("active"); break;
  case "register.html": document.getElementById("register-link").classList.add("active"); break;
  case "profile.html": document.getElementById("profile-link").classList.add("active"); break;
}

// Register form
const form = document.getElementById("register-form");
if(form){
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name=document.getElementById("name").value;
    const phone=document.getElementById("phone").value;
    const skills=document.getElementById("skills").value;

    localStorage.setItem("unityName",name);
    localStorage.setItem("unityPhone",phone);
    localStorage.setItem("unitySkills",skills);

    const sheetUrl="YOUR_SHEETBEST_API_ENDPOINT";
    try{
      const res=await fetch(sheetUrl,{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({Name:name, Phone:phone, Skills:skills})});
      document.getElementById("register-msg").innerText = res.ok ? `Registered successfully!` : `Registration failed!`;
      form.reset();
    }catch(err){
      console.error(err);
      document.getElementById("register-msg").innerText=`Registration failed!`;
    }
  });
}

// Profile QR + PDF
if(document.getElementById("profile-card")){
  const name=localStorage.getItem("unityName")||"Unknown";
  const phone=localStorage.getItem("unityPhone")||"Unknown";
  const skills=localStorage.getItem("unitySkills")||"Unknown";

  document.getElementById("profile-name").innerText=name;
  document.getElementById("profile-phone").innerText=phone;
  document.getElementById("profile-skills").innerText=skills;

  new QRCode(document.getElementById("qrcode"),{text:`Name:${name}\nPhone:${phone}\nSkills:${skills}`, width:128, height:128 });

  document.getElementById("download-pdf").addEventListener("click", ()=>{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF();
    doc.setFontSize(18); doc.text("UnityPass",20,20);
    doc.setFontSize(14); doc.text(`Name: ${name}`,20,40); doc.text(`Phone: ${phone}`,20,50); doc.text(`Skills: ${skills}`,20,60);
    const qrImg=document.querySelector("#qrcode img");
    if(qrImg){doc.addImage(qrImg.src,"PNG",150,20,40,40);}
    doc.save(`${name}_UnityPass.pdf`);
  });
}