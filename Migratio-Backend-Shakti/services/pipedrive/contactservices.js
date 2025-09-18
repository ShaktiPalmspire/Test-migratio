const axios = require('axios');

exports.getContacts = async function(token) {
  const response = await axios.get('https://api.pipedrive.com/v1/persons', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
