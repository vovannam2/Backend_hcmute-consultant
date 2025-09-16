function parseBoolean(obj) {
  for (let key in obj) {
    if (obj[key] === 'true') obj[key] = true;
    if (obj[key] === 'false') obj[key] = false;
  }
}

module.exports = (req, res, next) => {
  if (req.query) parseBoolean(req.query);
  if (req.body) parseBoolean(req.body);
  next();
};