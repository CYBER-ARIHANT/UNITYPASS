const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
hamburger.addEventListener("click",()=>{navLinks.classList.toggle("active");});

const currentPage=window.location.pathname.split("/").pop();
switch(currentPage){
  case "index.html": document.getElementById("home-link").classList.add("active"); break;
  case "register.html": document.getElementById("register-link").classList.add("active"); break;
  case "profile.html": document.getElementById("profile-link").classList.add("active"); break;
}

// Register form
const form=document.getElementById("register-form");
if(form){
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name=document.getElementById("name").value;
    const phone=document.getElementById("phone").value;
    const skills=document.getElementById("skills").value;
    const location=document.getElementById("location").value;

    localStorage.setItem("unityName",name);
    localStorage.setItem("unityPhone",phone);
    localStorage.setItem("unitySkills",skills);
    localStorage.setItem("unityLocation",location);

    const sheetUrl="https://sheet.best/api/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";
    try{
      const res = await fetch(sheetUrl,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({Name:name, Phone:phone, Skills:skills, Location:location})
      });

      if(res.ok){
        document.getElementById("register-msg").innerText="Registered successfully!";
        form.reset();
      } else {
        const text = await res.text();
        console.error("SheetBest POST failed:", res.status, text);
        document.getElementById("register-msg").innerText="Registration failed!";
      }
    } catch(err){
      console.error("Fetch error:", err);
      document.getElementById("register-msg").innerText="Registration failed!";
    }
  });
}

// Profile QR + PDF
if(document.getElementById("profile-card")){
  const name=localStorage.getItem("unityName")||"Unknown";
  const phone=localStorage.getItem("unityPhone")||"Unknown";
  const skills=localStorage.getItem("unitySkills")||"Unknown";
  const location=localStorage.getItem("unityLocation")||"Unknown";

  document.getElementById("profile-name").innerText=name;
  document.getElementById("profile-phone").innerText=phone;
  document.getElementById("profile-skills").innerText=skills;
  document.getElementById("profile-location").innerText=location;

  new QRCode(document.getElementById("qrcode"),{text:`Name:${name}\nPhone:${phone}\nSkills:${skills}\nLocation:${location}`, width:128,height:128});

  document.getElementById("download-pdf").addEventListener("click",()=>{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF();
    doc.setFontSize(18); doc.text("UnityPass",20,20);
    doc.setFontSize(14);
    doc.text(`Name: ${name}`,20,40);
    doc.text(`Phone: ${phone}`,20,50);
    doc.text(`Skills: ${skills}`,20,60);
    doc.text(`Location: ${location}`,20,70);
    const qrImg=document.querySelector("#qrcode img");
    if(qrImg){doc.addImage(qrImg.src,"PNG",150,20,40,40);}
    doc.save(`${name}_UnityPass.pdf`);
  });
}