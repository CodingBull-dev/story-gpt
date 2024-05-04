import { OpenAI } from "openai";
import { Story, systemInfo } from "./story";
import { ImageGenerator } from "./image";

export type StoryPayload = {
    /** Prompt used to generate the story */
    prompt: string;
    title: string;
    /** Content of the story */
    content: string;
    temperature: number;
    /** URL for the story image. 
     * This link expires so be sure to download it */
    image: string;
}

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

export { Story, ImageGenerator, systemInfo }
