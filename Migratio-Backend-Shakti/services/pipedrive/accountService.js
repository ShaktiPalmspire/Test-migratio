const axios = require('axios');

exports.getAccountDetails = async function(token) {
  const response = await axios.get('https://api.pipedrive.com/v1/organizations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const org = response.data.data && response.data.data[0];
  if (!org) throw new Error('No organization found');
  return {
    owner_id: {
      id: org.owner_id?.id,
      name: org.owner_id?.name
    },
    company_id: org.company_id
  };
};
