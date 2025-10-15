const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

document.getElementById('login').addEventListener('click', () => {
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    alert('Login successful');
  } else {
    alert('Invalid credentials');
  }
});