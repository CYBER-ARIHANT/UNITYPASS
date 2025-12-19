const sheetUrl="https://api.sheetbest.com/sheets/6370568b-e4ec-43f3-b14d-13875e2b5bfe";
document.getElementById("registerForm")?.addEventListener("submit",async e=>{
e.preventDefault();
const data={NAME:name.value,SKILL:skill.value,PHONE:phone.value,LOCATION:location.value};
await fetch(sheetUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
localStorage.setItem("profile",JSON.stringify(data));
location.href="profile.html";
});
window.onload=()=>{
const p=JSON.parse(localStorage.getItem("profile")||"{}");
if(!p.NAME)return;
profileInfo.innerHTML=p.NAME;
new QRCode(document.getElementById("qrCode"),JSON.stringify(p));
downloadPdf.onclick=()=>{
const doc=new jspdf.jsPDF();
doc.text("UnityPass Certificate",20,20);
doc.save("UnityPass.pdf");
}
};