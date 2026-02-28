import { OpenAI } from "openai";
import { createStory } from "./dist/cjs/index.js";

/**
 * Test that verifies the createStory function works end-to-end
 */

const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_TOKEN;

if (!apiKey) {
    console.error("Error: OPENAI_API_KEY or OPENAI_TOKEN environment variable is required");
    process.exit(1);
}

const openai = new OpenAI({ apiKey });

console.log("🚀 Starting create story test\n");

async function testCreateStory() {
    console.log("📝 Testing createStory()");
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
    console.log(`   Image URL: ${story.image.length > 50 ? story.image.substring(0, 50) + "..." : story.image}`);
}

testCreateStory()
    .then(() => {
        console.log("\n🎉 Create story test passed!");
        process.exit(0);
    })
    .catch(error => {
        console.error("\n❌ Create story test failed:", error.message);
        process.exit(1);
    });
