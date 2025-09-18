const axios = require('axios');

exports.getDeals = async function(token) {
  const response = await axios.get('https://api.pipedrive.com/v1/deals', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}; 