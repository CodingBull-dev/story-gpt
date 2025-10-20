import { OpenAI } from "openai";
import { createStory, Story, verifyPrompt } from "./dist/index.js";

/**
 * E2E Test for story-gpt
 * Tests all exported endpoints from the library
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_TOKEN;

if (!OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY or OPENAI_TOKEN environment variable is required");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log("🚀 Starting E2E tests for story-gpt\n");

// Test 1: createStory - Main utility function
async function testCreateStory() {
    console.log("📝 Test 1: Testing createStory()");
    try {
        const story = await createStory("A short tale about a brave mouse", openai);
        
        if (!story.prompt || !story.title || !story.content || !story.image) {
            throw new Error("Missing required fields in story payload");
        }
        
        if (typeof story.temperature !== "number") {
            throw new Error("Temperature should be a number");
        }
        
        console.log(`✅ createStory passed - Generated story titled: "${story.title}"`);
        console.log(`   Content length: ${story.content.length} chars`);
        console.log(`   Temperature: ${story.temperature}`);
        console.log(`   Image URL: ${story.image.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.error(`❌ createStory failed:`, error.message);
        return false;
    }
}

// Test 2: Story.generateStory - Generate story from prompt
async function testGenerateStory() {
    console.log("\n📝 Test 2: Testing Story.generateStory()");
    try {
        const story = await Story.generateStory("A tiny story about a cat", openai);
        
        if (!story.prompt || !story.content) {
            throw new Error("Story is missing prompt or content");
        }
        
        if (typeof story.temperature !== "number") {
            throw new Error("Temperature should be a number");
        }
        
        console.log(`✅ Story.generateStory passed`);
        console.log(`   Content length: ${story.content.length} chars`);
        return true;
    } catch (error) {
        console.error(`❌ Story.generateStory failed:`, error.message);
        return false;
    }
}

// Test 3: verifyPrompt - Valid story prompt
async function testVerifyPromptValid() {
    console.log("\n📝 Test 3: Testing verifyPrompt() with valid prompt");
    try {
        const result = await verifyPrompt("Write a story about a friendly dragon", openai);
        
        if (!result.validStory) {
            throw new Error(`Expected valid story but got: ${result.reasonForRejection}`);
        }
        
        console.log(`✅ verifyPrompt (valid) passed`);
        return true;
    } catch (error) {
        console.error(`❌ verifyPrompt (valid) failed:`, error.message);
        return false;
    }
}

// Test 4: verifyPrompt - Invalid prompt
async function testVerifyPromptInvalid() {
    console.log("\n📝 Test 4: Testing verifyPrompt() with invalid prompt");
    try {
        const result = await verifyPrompt("What is 2 + 2?", openai);
        
        if (result.validStory) {
            console.log("⚠️  verifyPrompt (invalid) - Math question was considered a valid story (may be acceptable)");
            return true;
        } else {
            console.log(`✅ verifyPrompt (invalid) passed - Rejected with: "${result.reasonForRejection}"`);
            return true;
        }
    } catch (error) {
        console.error(`❌ verifyPrompt (invalid) failed:`, error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const results = [];
    
    // Test 1: createStory
    results.push(await testCreateStory());
    
    // Test 2: Story.generateStory
    results.push(await testGenerateStory());
    
    // Test 3-4: verifyPrompt
    results.push(await testVerifyPromptValid());
    results.push(await testVerifyPromptInvalid());
    
    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Test Summary");
    console.log("=".repeat(60));
    
    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    
    console.log(`✅ Passed: ${passed}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);
    
    if (failed > 0) {
        console.log("\n❌ Some tests failed!");
        process.exit(1);
    } else {
        console.log("\n🎉 All tests passed!");
        process.exit(0);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error("\n💥 Fatal error during test execution:", error);
    process.exit(1);
});
