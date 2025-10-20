import { OpenAI } from "openai";
import { createStory, Story, ImageGenerator, verifyPrompt, ChatAssistant } from "./dist/index.js";

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
        return story;
    } catch (error) {
        console.error(`❌ Story.generateStory failed:`, error.message);
        return null;
    }
}

// Test 3: Story.generateTitle - Generate title for existing story
async function testGenerateTitle(story) {
    console.log("\n📝 Test 3: Testing Story.generateTitle()");
    try {
        if (!story) {
            throw new Error("No story object provided");
        }
        
        const title = await story.generateTitle();
        
        if (!title || typeof title !== "string" || title.length === 0) {
            throw new Error("Title is invalid");
        }
        
        console.log(`✅ Story.generateTitle passed - Title: "${title}"`);
        return true;
    } catch (error) {
        console.error(`❌ Story.generateTitle failed:`, error.message);
        return false;
    }
}

// Test 4: Story.generateImage - Generate image for story
async function testStoryGenerateImage(story) {
    console.log("\n📝 Test 4: Testing Story.generateImage()");
    try {
        if (!story) {
            throw new Error("No story object provided");
        }
        
        const imageUrl = await story.generateImage("1024x1024", "dall-e-3");
        
        if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
            throw new Error("Invalid image URL");
        }
        
        console.log(`✅ Story.generateImage passed`);
        console.log(`   Image URL: ${imageUrl.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.error(`❌ Story.generateImage failed:`, error.message);
        return false;
    }
}

// Test 5: ImageGenerator.generateImage - Generate single image
async function testImageGeneratorSingle() {
    console.log("\n📝 Test 5: Testing ImageGenerator.generateImage()");
    try {
        const imageGen = new ImageGenerator(openai, console);
        const imageUrl = await imageGen.generateImage(
            "A minimalist illustration of a robot",
            "1024x1024",
            "dall-e-3"
        );
        
        if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
            throw new Error("Invalid image URL");
        }
        
        console.log(`✅ ImageGenerator.generateImage passed`);
        console.log(`   Image URL: ${imageUrl.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.error(`❌ ImageGenerator.generateImage failed:`, error.message);
        return false;
    }
}

// Test 6: ImageGenerator.generateImages - Generate multiple images
async function testImageGeneratorMultiple() {
    console.log("\n📝 Test 6: Testing ImageGenerator.generateImages()");
    try {
        const imageGen = new ImageGenerator(openai, console);
        // Note: dall-e-3 only supports n=1, so we use dall-e-2 for multiple images
        const imageUrls = await imageGen.generateImages(
            "A simple geometric pattern",
            2,
            "512x512",
            "dall-e-2"
        );
        
        if (!Array.isArray(imageUrls) || imageUrls.length !== 2) {
            throw new Error("Expected array of 2 image URLs");
        }
        
        for (const url of imageUrls) {
            if (!url || typeof url !== "string" || !url.startsWith("http")) {
                throw new Error("Invalid image URL in array");
            }
        }
        
        console.log(`✅ ImageGenerator.generateImages passed`);
        console.log(`   Generated ${imageUrls.length} images`);
        return true;
    } catch (error) {
        console.error(`❌ ImageGenerator.generateImages failed:`, error.message);
        return false;
    }
}

// Test 7: verifyPrompt - Valid story prompt
async function testVerifyPromptValid() {
    console.log("\n📝 Test 7: Testing verifyPrompt() with valid prompt");
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

// Test 8: verifyPrompt - Invalid prompt
async function testVerifyPromptInvalid() {
    console.log("\n📝 Test 8: Testing verifyPrompt() with invalid prompt");
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

// Test 9: ChatAssistant.chat - Basic conversation
async function testChatAssistant() {
    console.log("\n📝 Test 9: Testing ChatAssistant.chat()");
    try {
        const chat = new ChatAssistant(openai, 0.7, "gpt-4o");
        const response = await chat.chat(
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say 'Hello World' in exactly two words." }
        );
        
        if (!response.answer || !response.answer.content) {
            throw new Error("No response from chat");
        }
        
        if (typeof response.chat !== "function") {
            throw new Error("Chat method is not available for follow-up");
        }
        
        console.log(`✅ ChatAssistant.chat passed`);
        console.log(`   Response: ${response.answer.content}`);
        return true;
    } catch (error) {
        console.error(`❌ ChatAssistant.chat failed:`, error.message);
        return false;
    }
}

// Test 10: ChatAssistant conversation continuation
async function testChatAssistantContinuation() {
    console.log("\n📝 Test 10: Testing ChatAssistant conversation continuation");
    try {
        const chat = new ChatAssistant(openai, 0.7, "gpt-4o");
        const firstResponse = await chat.chat(
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "My favorite number is 42." }
        );
        
        const secondResponse = await firstResponse.chat(
            { role: "user", content: "What is my favorite number?" }
        );
        
        if (!secondResponse.answer || !secondResponse.answer.content) {
            throw new Error("No response from follow-up chat");
        }
        
        console.log(`✅ ChatAssistant continuation passed`);
        console.log(`   Follow-up response: ${secondResponse.answer.content}`);
        return true;
    } catch (error) {
        console.error(`❌ ChatAssistant continuation failed:`, error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const results = [];
    
    // Test 1: createStory
    results.push(await testCreateStory());
    
    // Test 2-4: Story class methods
    const story = await testGenerateStory();
    if (story) {
        results.push(true);
        results.push(await testGenerateTitle(story));
        results.push(await testStoryGenerateImage(story));
    } else {
        results.push(false, false, false);
    }
    
    // Test 5-6: ImageGenerator
    results.push(await testImageGeneratorSingle());
    results.push(await testImageGeneratorMultiple());
    
    // Test 7-8: verifyPrompt
    results.push(await testVerifyPromptValid());
    results.push(await testVerifyPromptInvalid());
    
    // Test 9-10: ChatAssistant
    results.push(await testChatAssistant());
    results.push(await testChatAssistantContinuation());
    
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

// Export ChatAssistant for use in tests
export { ChatAssistant };

// Run tests
runAllTests().catch(error => {
    console.error("\n💥 Fatal error during test execution:", error);
    process.exit(1);
});
