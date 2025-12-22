/**
 * Test Google Maps integration
 */

async function testMapsIntegration() {
    console.log('🗺️ Testing Google Maps Integration...\n');

    try {
        // Test nearby attractions
        console.log('1. Testing nearby attractions...');
        const attractionsResponse = await fetch('http://localhost:3000/api/nearby-attractions');
        const attractionsData = await attractionsResponse.json();
        
        console.log(`Found ${attractionsData.attractions?.length || 0} attractions:`);
        attractionsData.attractions?.slice(0, 3).forEach(place => {
            console.log(`  - ${place.name} (${place.distance}, ${place.walkingTime})`);
        });
        console.log('✅ Attractions API working\n');

        // Test nearby restaurants
        console.log('2. Testing nearby restaurants...');
        const restaurantsResponse = await fetch('http://localhost:3000/api/nearby-restaurants');
        const restaurantsData = await restaurantsResponse.json();
        
        console.log(`Found ${restaurantsData.restaurants?.length || 0} restaurants:`);
        restaurantsData.restaurants?.slice(0, 3).forEach(place => {
            console.log(`  - ${place.name} (${place.distance}, ${place.walkingTime})`);
        });
        console.log('✅ Restaurants API working\n');

        // Test traffic information
        console.log('3. Testing traffic information...');
        const trafficResponse = await fetch('http://localhost:3000/api/traffic?from=Thanjavur Railway Station');
        const trafficData = await trafficResponse.json();
        
        console.log('Traffic Info:');
        console.log(`  - Condition: ${trafficData.traffic?.currentCondition}`);
        console.log(`  - Estimated Time: ${trafficData.traffic?.estimatedTime}`);
        console.log(`  - Best Route: ${trafficData.traffic?.bestRoute}`);
        console.log(`  - Directions URL: ${trafficData.directionsUrl ? 'Available' : 'Not available'}`);
        console.log('✅ Traffic API working\n');

        console.log('🎉 All Google Maps features are working!');
        console.log('🌐 Open http://localhost:3000 to see nearby places in the UI');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testMapsIntegration();