import http from 'http';
import './index';

const port = process.env.PORT || 4001;

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'webhook-auto-worker', timestamp: new Date().toISOString() }));
  })
  .listen(port, () => {
    console.log(`🟢 Worker Health Probe listening on port ${port}`);
  });
