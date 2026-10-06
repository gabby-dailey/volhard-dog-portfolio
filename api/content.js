const episodes = require('./_episodes');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({ ok: true, episodes });
};
