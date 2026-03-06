import http from 'http';

const data = JSON.stringify({ email: "Tokuirotokuiro@gmail.com" });

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let output = '';
    res.on('data', (d) => { output += d; });
    res.on('end', () => { console.log("Status:", res.statusCode, "Body:", output); });
});

req.on('error', (e) => { console.error("Error:", e); });
req.write(data);
req.end();
