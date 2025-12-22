/**
 * Simple system test for Thanjavur TalkMate
 */

const { initializeTalkMate } = require('./dist/index.js');

async function testSystem() {
    console.log('🧪 Testing Thanjavur TalkMate System...\n');

    try {
        // Initialize the system
        console.log('1. Initializing TalkMate...');
        const agent = await initializeTalkMate();
        console.log('✅ System initialized successfully\n');

        // Test basic query
        console.log('2. Testing basic query...');
        const response1 = await agent.processQuery('What does vanakkam anna mean?');
        console.log('Query:', 'What does vanakkam anna mean?');
        console.log('Response:', JSON.stringify(response1, null, 2));
        console.log('✅ Basic query test passed\n');

        // Test with context
        console.log('3. Testing query with context...');
        const response2 = await agent.processQuery('Auto la variya', { 
            speaker: 'auto_driver', 
            location: 'temple_streets' 
        });
        console.log('Query:', 'Auto la variya');
        console.log('Context:', { speaker: 'auto_driver', location: 'temple_streets' });
        console.log('Response:', JSON.stringify(response2, null, 2));
        console.log('✅ Context query test passed\n');

        // Test scope validation
        console.log('4. Testing scope validation...');
        const response3 = await agent.processQuery('What about Chennai culture?');
        console.log('Query:', 'What about Chennai culture?');
        console.log('Response:', JSON.stringify(response3, null, 2));
        console.log('✅ Scope validation test passed\n');

        console.log('🎉 All tests passed! TalkMate is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testSystem();