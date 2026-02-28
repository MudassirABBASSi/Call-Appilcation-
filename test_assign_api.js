const http = require('http');

function request(options, data=null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk=>body+=chunk);
            res.on('end', ()=>resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async ()=>{
    try {
        // login existing testteacher
        const loginRes = await request({
            hostname:'localhost', port:5000, path:'/api/auth/login', method:'POST',
            headers:{'Content-Type':'application/json'}
        }, { email:'testteacher@example.com', password:'secret123' });
        console.log('login', loginRes.status, loginRes.body);
        const token = JSON.parse(loginRes.body).token;

        // test GET without class_id (expect 400 now)
        const getRes1 = await request({
            hostname:'localhost', port:5000, path:'/api/teacher/assignments', method:'GET',
            headers:{ Authorization: `Bearer ${token}` }
        });
        console.log('get all/none', getRes1.status, getRes1.body);

        // test GET with blank class_id (also treated as missing)
        const getRes2 = await request({
            hostname:'localhost', port:5000, path:'/api/teacher/assignments?class_id=', method:'GET',
            headers:{ Authorization: `Bearer ${token}` }
        });
        console.log('get class blank', getRes2.status, getRes2.body);

        // test POST create assignment with invalid fields
        const postRes = await request({
            hostname:'localhost', port:5000, path:'/api/teacher/assignments', method:'POST',
            headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }
        }, { title:'Test assignment' });
        console.log('post missing', postRes.status, postRes.body);
    } catch(err){ console.error('error', err); }
})();