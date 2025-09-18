const axios = require('axios');

exports.getTickets = async function(token) {
  const response = await axios.get('https://api.pipedrive.com/v1/activities', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}; 