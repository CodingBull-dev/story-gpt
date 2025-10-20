import type { OpenAI } from "openai";
import type { ILogger } from "./types";

export type ImageSize = '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
export type Model = 'dall-e-2' | 'dall-e-3';

/**
 * Class used to generate images using OpenAI's DALL-E
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
     * @param size Optional, the size of the image. Defaults to "512x512"
     * @param model Optional, the DALL-E model to use. Defaults to "dall-e-3"
     * @returns A Promise that resolves to the URL of the generated image
     */
    public async generateImage(prompt: string, size: ImageSize = "512x512", model: Model = "dall-e-3"): Promise<string> {
        const image = await this.generateImages(prompt, 1, size, model);
        return image[0]!;
    }

    /**
     * Generates multiple images from a text prompt
     * @param prompt The text prompt describing the images to generate
     * @param numberOfImages The number of images to generate (1-5)
     * @param size Optional, the size of the images. Defaults to "512x512"
     * @param model Optional, the DALL-E model to use. Defaults to "dall-e-3"
     * @returns A Promise that resolves to an array of URLs for the generated images
     */
    public async generateImages(prompt: string, numberOfImages: 1 | 2 | 3 | 4 | 5, size: ImageSize = "512x512", model: Model = "dall-e-3"): Promise<string[]> {
        const response = await this.openai.images.generate({
            model,
            prompt,
            n: numberOfImages,
            size,
        });

        const { data } = response;

        this.logger.log("Got image!", data);

        if (!data || data.length < numberOfImages) {
            throw new Error("Insufficient amount of images generated");
        }

        const imageUrls = new Array<string>(numberOfImages);

        for (let i = 0; i < data.length; i++) {
            const url = data[i]?.url;
            if (!url) {
                throw new Error("Image URL is null");
            }
            imageUrls[i] = url;
        }

        return imageUrls;
    }
}
