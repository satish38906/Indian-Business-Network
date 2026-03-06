const http = require('http');

async function testServer() {
  console.log('=== Backend Server Test ===\n');

  // Test if server is running on port 5001
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/',
    method: 'GET'
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      console.log(`✅ Server is running on port 5001`);
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', data);
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Server not reachable on port 5001: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Request timeout - server may not be running');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

testServer().then(() => {
  console.log('\n=== Network IP Check ===');
  console.log('Current API URL: http://10.107.12.47:5001');
  console.log('Make sure this IP matches your computer\'s network IP');
  process.exit(0);
});