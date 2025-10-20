import { OpenAI } from "openai";
import { ILogger } from "./types";
import { ImageGenerator, ImageSize, Model } from "./image";
import { ChatAssistant } from "./chat";

type StoryParams = { prompt: string, story: string, temperature: number };

const DEFAULT_MODEL = "gpt-5-mini";

/** Prompt used to generate the story */
export const systemInfo = `You are Story Bot, a language model that helps users create stories, scripts and more. 
        Follow the user's instructions carefully and generate the content they requested.
        When writing a post, story or script, try to extend the text as much as possible without making it boring.
        Do NOT include the title in the post unless you are asked for it.`;

/**
 * Story object which contains a prompt and story and can generate a title and an image
 */
export class Story {
    private readonly creationPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    private readonly chat: ChatAssistant;
    public readonly prompt: string;
    public readonly content: string;
    public readonly temperature: number;

    /**
     * Creates a new Story instance
     * @param openai The authenticated OpenAI client
     * @param storyParams Story parameters including prompt, story content, and temperature
     * @param chatModel Optional, the model to use. Defaults to gpt-5-mini. Note: gpt-5-mini only supports temperature=1 (default)
     * @param logger Optional logger instance for debugging. Defaults to console
     */
    constructor(private readonly openai: OpenAI, storyParams: StoryParams, chatModel: string = DEFAULT_MODEL, private readonly logger: ILogger = console) {
        this.prompt = storyParams.prompt;
        this.content = storyParams.story;
        this.temperature = storyParams.temperature;
        this.creationPrompt = [{ role: "system", content: systemInfo }, { role: "user", content: storyParams.prompt }, { role: "assistant", content: storyParams.story }];
        this.chat = new ChatAssistant(this.openai, storyParams.temperature, chatModel);
    }

    /** 
     * Utility method which allows a Story object to be generated from a prompt with a story 
     * @param prompt The prompt to generate the story from
     * @param openai The authenticated OpenAI client
     * @param chatModel Optional, the model to use. Defaults to gpt-5-mini. Note: gpt-5-mini only supports temperature=1 (default)
     * @param logger Optional logger instance for debugging. Defaults to console
     * @returns A Promise that resolves to a Story instance
     */
    static async generateStory(prompt: string, openai: OpenAI, chatModel: string = DEFAULT_MODEL, logger: ILogger = console): Promise<Story> {
        const chat = new ChatAssistant(openai, Math.round(Math.random() * 100) / 100, chatModel);
        logger.log("Generating story for prompt", prompt);
        const story = await chat.chat({ role: "system", content: systemInfo }, { role: "user", content: prompt });

        if (!story.answer.content) {
            throw new Error("Story content is empty");
        }

        logger.log("Got the story!", `It is ${story.answer.content.split(" ").length} words long!`);
        return new Story(openai, { prompt, story: story.answer.content, temperature: chat.temperature }, chatModel);
    }

    /**
     * Generates a title for the story
     * @returns A Promise that resolves to the generated title
     */
    async generateTitle(): Promise<string> {
        const titleQuestion = await this.chat.chat(...this.creationPrompt, { role: "user", content: "What would you call the story (or post)? Respond only with the name, no other text is needed." });
        let title = titleQuestion.answer.content;

        if (!title) {
            throw new Error("Did not get a title for the story");
        }

        // Remove dots at the end of the title
        if (title[title.length - 1] === ".") {
            title = title.slice(0, -1);
        }

        this.logger.log("Got the story title:", title);

        return title;
    }

    /**
     * Generates an image for the story using DALL-E
     * @param size Optional, the size of the image. Defaults to "1024x1024"
     * @param model Optional, the DALL-E model to use. Defaults to "dall-e-3"
     * @returns A Promise that resolves to the URL of the generated image
     */
    async generateImage(size: ImageSize = "1024x1024", model: Model = "dall-e-3"): Promise<string> {
        this.logger.log("Generating image prompts");
        const imgPrompt = "Based on the previous story, write a prompt for an image generation service Dall-E. " +
            "Keep the prompt detailed and tell the system to use a particular art style referring to a particular artist/painter. " +
            "Make the prompt be less than 400 characters. " +
            "Respond only with the prompt. No other text is needed.";

        const dallePrompt = await this.chat.chat(...this.creationPrompt, { role: "user", content: imgPrompt });

        if (!dallePrompt.answer.content) {
            throw new Error("Image prompt is empty. There was an error");
        }

        this.logger.log("Generating image for the story with the following prompt:", dallePrompt.answer.content);

        const image = new ImageGenerator(this.openai, this.logger);

        const imgUrl = await image.generateImage(dallePrompt.answer.content, size, model);

        if (!imgUrl) {
            throw new Error("No image!");
        }

        this.logger.log("Got image!");

        return imgUrl;
    }
}
