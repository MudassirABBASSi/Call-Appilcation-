const http = require('http');

function post(path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

(async () => {
    try {
        console.log('Registering test teacher...');
        const reg = await post('/api/auth/register', { name: 'TestTeacher', email: 'testteacher@example.com', password: 'secret123', role: 'teacher' });
        console.log('register:', reg.status, reg.body);
        console.log('Logging in...');
        const login = await post('/api/auth/login', { email: 'testteacher@example.com', password: 'secret123' });
        console.log('login:', login.status, login.body);
    } catch (e) {
        console.error(e);
    }
})();