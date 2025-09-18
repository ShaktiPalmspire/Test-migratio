const { getAuthUrl, exchangeCodeForToken } = require('../pipedrive/auth');
const { getAccountDetails, getContacts, getDeals, getTickets } = require('../services/pipedriveService');

exports.install = (req, res) => {
  const { url, state } = getAuthUrl();
  req.session.state = state;
  console.log('Generated state:', state);
  res.redirect(url);
};

exports.callback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  console.log('Session state:', req.session.state, 'Callback state:', state);
  if (state !== req.session.state) {
    return res.status(400).send('Error: Invalid state parameter (potential CSRF attack)');
  }
  try {
    const tokenData = await exchangeCodeForToken(code);
    req.session.pipedriveToken = tokenData.access_token;
    req.session.pipedriveRefreshToken = tokenData.refresh_token;
    res.redirect('/pipedrive/status');
  } catch (err) {
    console.error('Pipedrive OAuth callback error:', err);
    res.status(500).send('Error during Pipedrive OAuth callback: ' + (err && err.message ? err.message : JSON.stringify(err)));
  }
};

exports.status = async (req, res) => {
  const token = req.session.pipedriveToken;
  if (!token) {
    return res.json({ connected: false, message: 'App not connected. Contact the developer.' });
  }
  try {
    const details = await getAccountDetails(token);
    res.json({ connected: true, message: 'Your app is connected successfully!', details });
  } catch (err) {
    res.json({ connected: false, message: 'App not connected. Contact the developer.' });
  }
};

exports.companiesDetails = async (req, res) => {
  const token = req.session.pipedriveToken;
  try {
    const details = await getAccountDetails(token);
    res.json(details);
  } catch (err) {
    res.redirect('/error?msg=' + encodeURIComponent('Failed to fetch Pipedrive account details'));
  }
};

exports.contacts = async (req, res) => {
  const token = req.session.pipedriveToken;
  try {
    const contacts = await getContacts(token);
    res.json({ contacts });
  } catch (err) {
    if (err.response && err.response.status === 401) {
      // Token expired, handle refresh here if needed
      return res.redirect('/error?msg=' + encodeURIComponent('Token expired, please reconnect.'));
    }
    res.redirect('/error?msg=' + encodeURIComponent('Failed to fetch Pipedrive contacts'));
  }
};

exports.deals = async (req, res) => {
  const token = req.session.pipedriveToken;
  try {
    const deals = await getDeals(token);
    res.json({ deals });
  } catch (err) {
    if (err.response && err.response.status === 401) {
      return res.redirect('/error?msg=' + encodeURIComponent('Token expired, please reconnect.'));
    }
    res.redirect('/error?msg=' + encodeURIComponent('Failed to fetch Pipedrive deals'));
  }
};

exports.tickets = async (req, res) => {
  const token = req.session.pipedriveToken;
  try {
    const tickets = await getTickets(token);
    res.json({ tickets });
  } catch (err) {
    if (err.response && err.response.status === 401) {
      return res.redirect('/error?msg=' + encodeURIComponent('Token expired, please reconnect.'));
    }
    res.redirect('/error?msg=' + encodeURIComponent('Failed to fetch Pipedrive tickets'));
  }
};

exports.root = async (req, res) => {
  const token = req.session.pipedriveToken;
  if (token) {
    try {
      const details = await getAccountDetails(token);
      res.send(`<h2>Pipedrive Account Info</h2><p><strong>Company ID:</strong> ${details.company_id}</p><p><strong>Owner Name:</strong> ${details.owner_id.name}</p>`);
    } catch (err) {
      res.send('Failed to fetch Pipedrive account info');
    }
  } else {
    res.send('<a href="/pipedrive/install">Install Pipedrive App</a>');
  }
};
