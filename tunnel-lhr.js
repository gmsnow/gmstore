const { spawn } = require('child_process');
const fs = require('fs');
const log = fs.createWriteStream(process.env.TEMP + '\\tunnel.log', { flags: 'a' });

const ssh = spawn('ssh', [
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=30',
  '-o', 'ExitOnForwardFailure=yes',
  '-R', '80:localhost:3000',
  'nokey@localhost.run'
], { stdio: ['ignore', 'pipe', 'pipe'] });

ssh.stdout.on('data', d => {
  const text = d.toString();
  log.write(text);
  const match = text.match(/https:\/\/[^\s]+\.lhr\.life/);
  if (match) {
    console.log('TUNNEL_URL=' + match[0]);
  }
});
ssh.stderr.on('data', d => log.write(d.toString()));
ssh.on('exit', code => { log.write('SSH exited: ' + code + '\n'); process.exit(1); });

process.on('SIGTERM', () => ssh.kill());
process.on('SIGINT', () => ssh.kill());
