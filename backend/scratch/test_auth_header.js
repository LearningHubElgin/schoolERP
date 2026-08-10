const http = require('http');

// First login to get token
const loginData = JSON.stringify({
  loginId: 'admin@gmail.com',
  password: 'admin123',
  role: 'admin'
});

const loginReq = http.request({
  hostname: 'localhost',
  port: 7005,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(body);
    const token = parsed.token;
    console.log('Login Token Obtained:', token ? 'YES' : 'NO');

    // Test GET /api/admin/users with Bearer token
    const userReq = http.request({
      hostname: 'localhost',
      port: 7005,
      path: '/api/admin/users?page=1&limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, userRes => {
      let uBody = '';
      userRes.on('data', c => uBody += c);
      userRes.on('end', () => {
        console.log('/api/admin/users Status Code:', userRes.statusCode);
        console.log('/api/admin/users Response:', uBody.slice(0, 150));
      });
    });

    userReq.end();
  });
});

loginReq.write(loginData);
loginReq.end();
