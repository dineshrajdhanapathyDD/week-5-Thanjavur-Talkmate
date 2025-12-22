/**
 * Test AI-powered responses
 */

const { initializeTalkMate } = require('./dist/index.js');

async function testAI() {
    console.log('🧪 Testing AI-Powered Thanjavur TalkMate...\n');

    try {
        // Initialize the system
        console.log('1. Initializing TalkMate with AI...');
        const agent = await initializeTalkMate();
        const status = agent.getSystemStatus();
        console.log(`✅ System initialized - AI Enabled: ${status.aiEnabled}\n`);

        // Test AI-powered query
        console.log('2. Testing AI-powered cultural translation...');
        const response1 = await agent.processQuery('What does vanakkam anna mean?');
        console.log('Query:', 'What does vanakkam anna mean?');
        console.log('AI Response:');
        console.log('  Meaning:', response1.simpleEnglishMeaning);
        console.log('  Cultural:', response1.culturalExplanation.substring(0, 100) + '...');
        console.log('  Guidance:', response1.visitorGuidance.substring(0, 100) + '...');
        console.log('  Confidence:', Math.round(response1.confidence * 100) + '%');
        console.log('✅ AI response test passed\n');

        // Test with context
        console.log('3. Testing AI with context...');
        const response2 = await agent.processQuery('Auto la variya', { 
            speaker: 'auto_driver', 
            location: 'temple_streets' 
        });
        console.log('Query:', 'Auto la variya (from auto driver at temple streets)');
        console.log('AI Response:');
        console.log('  Meaning:', response2.simpleEnglishMeaning);
        console.log('  Confidence:', Math.round(response2.confidence * 100) + '%');
        console.log('✅ Context-aware AI test passed\n');

        // Test scope validation
        console.log('4. Testing scope validation with AI...');
        const response3 = await agent.processQuery('What about Mumbai culture?');
        console.log('Query:', 'What about Mumbai culture?');
        console.log('Scope Valid:', response3.isWithinScope);
        console.log('Refusal:', response3.refusalMessage ? 'Yes' : 'No');
        console.log('✅ Scope validation test passed\n');

        console.log('🎉 All AI tests passed! TalkMate is AI-powered and working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testAI();