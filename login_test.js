const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'Ali@ali.com', password: 'password' })
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
})();