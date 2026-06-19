const { spawn } = require('child_process');
const fs = require('fs');
const log = fs.createWriteStream(process.env.TEMP + '\\cf-node.log');

const cf = spawn('C:\\Users\\GMSNOW\\cloudflared.exe', [
  'tunnel', '--url', 'http://127.0.0.1:80', '--protocol', 'http2'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let urlFound = false;

cf.stdout.on('data', d => {
  const text = d.toString();
  log.write(text);
  if (!urlFound) {
    const match = text.match(/https:\/\/[a-z-]+\.trycloudflare\.com/);
    if (match) {
      urlFound = true;
      console.log('TUNNEL_URL=' + match[0]);
    }
  }
});
cf.stderr.on('data', d => {
  const text = d.toString();
  log.write(text);
  if (!urlFound) {
    const match = text.match(/https:\/\/[a-z-]+\.trycloudflare\.com/);
    if (match) {
      urlFound = true;
      console.log('TUNNEL_URL=' + match[0]);
    }
  }
});
cf.on('exit', code => { log.write('EXIT:' + code + '\n'); });

process.on('SIGTERM', () => cf.kill());
