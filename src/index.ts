import { OpenAI } from "openai";
import { Story, systemInfo } from "./story.js";
import { ImageGenerator } from "./image.js";
import { verifyPrompt } from "./verify.js";

/** Payload with story data */
export type StoryPayload = {
    /** Prompt used to generate the story */
    prompt: string;
    title: string;
    /** Content of the story */
    content: string;
    /** Temperature used to generate the story */
    temperature: number;
    /** URL for the story image. 
     * This link expires so be sure to download it */
    image: string;
}

/**
 * Utility method that creates a story object with a title and an image
 * @param prompt the prompt to be used as the entry point
 * @param openai the authenticated open ai client
 * @returns a payload with all the information required for the story {@link StoryPayload}
 */
export async function createStory(prompt: string, openai: OpenAI): Promise<StoryPayload> {
    const story = await Story.generateStory(prompt, openai);
    return {
        prompt,
        title: await story.generateTitle(),
        content: story.content,
        temperature: story.temperature,
        image: await story.generateImage()
    }
}

export { Story, ImageGenerator, systemInfo, verifyPrompt }
