const localtunnel = require('localtunnel');
(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'gmstorewano' });
    console.log('Tunnel URL:', tunnel.url);
    tunnel.on('close', () => {
      console.log('Tunnel closed');
      process.exit(1);
    });
  } catch (err) {
    console.error('Tunnel error:', err.message);
    process.exit(1);
  }
})();
