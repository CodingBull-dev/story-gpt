import type { OpenAI } from "openai";
import type { ILogger } from "./types.js";

export type ImageSize = '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
export type Model = 'dall-e-2' | 'dall-e-3';

/**
 * Class used to generate images
 */
export class ImageGenerator {
    public constructor(private readonly openai: OpenAI, private readonly logger: ILogger) {
    }

    public async generateImage(prompt: string, size: ImageSize = "512x512", model: Model = "dall-e-3"): Promise<string> {
        const image = await this.generateImages(prompt, 1, size, model);
        return image[0]!;
    }

    public async generateImages(prompt: string, numberOfImages: 1 | 2 | 3 | 4 | 5, size: ImageSize = "512x512", model: Model = "dall-e-3"): Promise<string[]> {
        const response = await this.openai.images.generate({
            model,
            prompt,
            n: numberOfImages,
            size,
        });

        const { data } = response;

        this.logger.log("Got image!", data);

        if (data.length < numberOfImages) {
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
