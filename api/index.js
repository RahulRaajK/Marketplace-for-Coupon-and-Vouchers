const app = require('../backend/index');

// Vercel Node.js Serverless Functions receive (req, res)
// Express apps are compatible handlers, so just forward the call
module.exports = (req, res) => app(req, res);


