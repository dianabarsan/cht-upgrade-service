const express = require('express');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json({ limit: '32mb' });
const PORT = 5100;

const app = express();
const containers = require('./containers');

const upgrade = async (req, res) => {
  if (!req.body || !req.body['docker-compose'] || !Object.keys(req.body['docker-compose']).length) {
    return res.status(400).json({ error: true, reason: 'Invalid payload.' });
  }

  const payload = Object.entries(req.body['docker-compose']);
  const response = {};

  try {
    for (const [fileName, fileContents] of payload) {
      await containers.upgrade(fileName, fileContents);
      console.log(`${fileName} upgrade was successful`);
      response[fileName] = { ok: true };
    }
    res.json(response);
  } catch (err) {
    console.error('Error while upgrading', err);
    res.status(500).json({ error: true, reason: err.message });
  }
};

const status = (req, res) => {
  res.json({ ok: true });
};

app.get('/', status);
app.post('/upgrade', jsonParser, upgrade);

const listen = () => {
  app.listen(PORT);
  console.log('listening on port 5100');
};

module.exports = {
  listen,
};
