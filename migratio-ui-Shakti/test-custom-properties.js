// Test script to check custom properties fetching
// This will help debug the custom properties issue

console.log('🧪 Testing Custom Properties Fetch...');

// Test the API endpoint directly
async function testCustomPropertiesAPI() {
  try {
    console.log('🔄 Testing API endpoint...');
    
    // Test contacts custom properties
    const response = await fetch('/api/hubspot/schema/contacts?propertyType=custom&userId=test&instance=a');
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Response data:', data);
      console.log('📊 Custom properties count:', data.data?.results?.length || 0);
      
      if (data.data?.results) {
        const customProps = data.data.results.filter(prop => !prop.hubspotDefined);
        console.log('📊 Actual custom properties:', customProps.length);
        console.log('📊 Sample custom property:', customProps[0]);
      }
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Run the test
testCustomPropertiesAPI();
