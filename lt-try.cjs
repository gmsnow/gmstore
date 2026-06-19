const { spawn } = require('child_process');
const lt = spawn('npx.cmd', ['-y', 'localtunnel', '--port', '3000', '--subdomain', 'gmstorewano'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});
lt.stdout.on('data', d => {
  const text = d.toString();
  console.log(text);
  if (text.includes('://')) {
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) {
      console.log('TUNNEL_URL=' + match[0]);
    }
  }
});
lt.stderr.on('data', d => console.error(d.toString()));
setTimeout(() => lt.kill(), 30000);
