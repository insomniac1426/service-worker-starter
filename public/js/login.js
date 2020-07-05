const loginBtn = document.getElementById('login-btn');
const usernameInp = document.getElementById('username');
const passInp = document.getElementById('password');

loginBtn.addEventListener('click', function() {
  fetch('http://localhost:8082/api/auth', {
    method: 'POST',
    body: JSON.stringify({
      username: usernameInp.value,
      password: passInp.value,
    }),
    headers: {
      'content-type': 'application/json',
    },
    credentials: 'include'
  })
})