import type { OpenAI } from "openai";
import type { ImageModel } from "openai/resources/images";
import type { ILogger } from "./types";

export type ImageSize = '1024x1024' | '1536x1024' | '1024x1536';
export type Model = Extract<ImageModel, 'gpt-image-1' | 'gpt-image-1-mini' | 'gpt-image-1.5' | 'gpt-image-2' | 'gpt-image-2-2026-04-21' | 'chatgpt-image-latest'>;

/**
 * Class used to generate images using OpenAI's GPT image models
 */
export class ImageGenerator {
    /**
     * Creates a new ImageGenerator instance
     * @param openai The authenticated OpenAI client
     * @param logger Logger instance for debugging
     */
    public constructor(private readonly openai: OpenAI, private readonly logger: ILogger) {
    }

    /**
     * Generates a single image from a text prompt
     * @param prompt The text prompt describing the image to generate
     * @param size Optional, the size of the image. Defaults to "1024x1024"
     * @param model Optional, the GPT image model to use. Defaults to "gpt-image-1-mini"
     * @returns A Promise that resolves to the PNG data URL of the generated image
     */
    public async generateImage(prompt: string, size: ImageSize = "1024x1024", model: Model = "gpt-image-1-mini"): Promise<string> {
        const image = await this.generateImages(prompt, 1, size, model);
        return image[0]!;
    }

    /**
     * Generates multiple images from a text prompt
     * @param prompt The text prompt describing the images to generate
     * @param numberOfImages The number of images to generate (1-5)
     * @param size Optional, the size of the images. Defaults to "1024x1024"
     * @param model Optional, the GPT image model to use. Defaults to "gpt-image-1-mini"
     * @returns A Promise that resolves to an array of PNG data URLs for the generated images
     */
    public async generateImages(prompt: string, numberOfImages: 1 | 2 | 3 | 4 | 5, size: ImageSize = "1024x1024", model: Model = "gpt-image-1-mini"): Promise<string[]> {
        const outputFormat = "png" as const;
        const response = await this.openai.images.generate({
            model,
            prompt,
            n: numberOfImages,
            size,
            output_format: outputFormat,
        });

        const { data } = response;
        const mimeType = `image/${outputFormat}`;

        this.logger.log("Got image!", data);

        if (!data || data.length < numberOfImages) {
            throw new Error("Insufficient amount of images generated");
        }

        const imageUrls = new Array<string>(numberOfImages);

        for (let i = 0; i < data.length; i++) {
            const imageData = data[i];
            const base64 = imageData?.b64_json;
            if (!base64) {
                throw new Error("Image data is missing");
            }

            imageUrls[i] = `data:${mimeType};base64,${base64}`;
        }

        return imageUrls;
    }
}
