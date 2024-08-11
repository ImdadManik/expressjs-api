const { safeStringify } = require('./loggerUtils');

function logRequest(req, res, next) {
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', safeStringify(req.headers));
  console.log('Request body:', safeStringify(req.body));
  console.log('Query parameters:', safeStringify(req.query));
  next();
}

module.exports = logRequest;
