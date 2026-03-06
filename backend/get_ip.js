const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  console.log('=== Available Network IPs ===\n');
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`${name}: ${interface.address}`);
        console.log(`Use: http://${interface.address}:5001\n`);
      }
    }
  }
  
  console.log('Update your API_CONFIG.BASE_URL with one of the above URLs');
  console.log('For React Native:');
  console.log('- Use localhost:5001 for iOS Simulator');
  console.log('- Use 10.0.2.2:5001 for Android Emulator');
  console.log('- Use your computer\'s IP for physical devices');
}

getNetworkIP();