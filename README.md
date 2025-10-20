# Story-GPT

Typescript library used to generate the stories for [StoryBot](https://storybot.dev)

## Installation

[![NPM Release](https://github.com/CodingBull-dev/story-gpt/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/CodingBull-dev/story-gpt/actions/workflows/npm-publish.yml)
[![E2E Tests](https://github.com/CodingBull-dev/story-gpt/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/CodingBull-dev/story-gpt/actions/workflows/e2e-tests.yml)

[![NPM Version](https://img.shields.io/npm/v/story-gpt)](https://npmjs.com/story-gpt)

`npm install --save story-gpt`

## Usage

### Quick Start

```typescript
import { createStory } from "story-gpt";
import { OpenAI } from "openai";

const story = await createStory("A story about a happy horse", new OpenAI({apiKey: ">my api key<"}));

console.log("The story is named %s and it's tells the following story:", story.title, story.content);
console.log("See the cover picture for the story here:", story.image);
```

## API Reference

### `createStory(prompt, openai)`

Main utility function that creates a complete story with title and image.

**Parameters:**
- `prompt` (string): The prompt to generate the story from
- `openai` (OpenAI): The authenticated OpenAI client

**Returns:** `Promise<StoryPayload>` containing:
- `prompt`: The original prompt
- `title`: Generated story title
- `content`: The story content
- `temperature`: Temperature value used for generation
- `image`: URL to the generated image (Note: this link expires, so download it)

**Example:**
```typescript
import { createStory } from "story-gpt";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const story = await createStory("A tale of a brave knight", openai);
console.log(story.title); // e.g., "The Knight's Quest"
```

### `Story` Class

Class for generating and managing stories.

#### `Story.generateStory(prompt, openai, chatModel?, logger?)`

Static method to generate a story from a prompt.

**Parameters:**
- `prompt` (string): The prompt to generate the story from
- `openai` (OpenAI): The authenticated OpenAI client
- `chatModel` (string, optional): The model to use. Defaults to `gpt-5-mini`. Note: `gpt-5-mini` only supports temperature=1
- `logger` (ILogger, optional): Logger instance for debugging. Defaults to console

**Returns:** `Promise<Story>`

**Example:**
```typescript
import { Story } from "story-gpt";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const story = await Story.generateStory("A mystery in the old mansion", openai);
console.log(story.content); // The generated story text
```

#### `story.generateTitle()`

Generates a title for the story.

**Returns:** `Promise<string>` - The generated title

#### `story.generateImage(size?, model?)`

Generates an image for the story using DALL-E.

**Parameters:**
- `size` (ImageSize, optional): Image size. Defaults to `"1024x1024"`. Options: `'256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'`
- `model` (Model, optional): DALL-E model. Defaults to `"dall-e-3"`. Options: `'dall-e-2' | 'dall-e-3'`

**Returns:** `Promise<string>` - URL to the generated image

### `verifyPrompt(prompt, openai, chatModel?)`

Utility function that verifies if a prompt contains potentially harmful content and if it qualifies as a story.

**Parameters:**
- `prompt` (string): The prompt to analyze
- `openai` (OpenAI): The authenticated OpenAI client
- `chatModel` (string, optional): The model to use. Defaults to `gpt-5-mini`

**Returns:** `Promise<StoryResult>` where StoryResult is:
- `{ validStory: true }` if the prompt is valid
- `{ validStory: false, reasonForRejection: string }` if invalid

**Example:**
```typescript
import { verifyPrompt } from "story-gpt";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const result = await verifyPrompt("Write a story about a dragon", openai);
if (result.validStory) {
    console.log("Prompt is valid!");
} else {
    console.log("Rejected:", result.reasonForRejection);
}
```

### `ImageGenerator` Class

Class for generating images using OpenAI's DALL-E.

#### Constructor: `new ImageGenerator(openai, logger)`

**Parameters:**
- `openai` (OpenAI): The authenticated OpenAI client
- `logger` (ILogger): Logger instance for debugging

#### `imageGenerator.generateImage(prompt, size?, model?)`

Generates a single image from a text prompt.

**Parameters:**
- `prompt` (string): The text prompt describing the image
- `size` (ImageSize, optional): Image size. Defaults to `"512x512"`
- `model` (Model, optional): DALL-E model. Defaults to `"dall-e-3"`

**Returns:** `Promise<string>` - URL to the generated image

**Example:**
```typescript
import { ImageGenerator } from "story-gpt";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const imageGen = new ImageGenerator(openai, console);
const imageUrl = await imageGen.generateImage("A sunset over mountains", "1024x1024", "dall-e-3");
```

#### `imageGenerator.generateImages(prompt, numberOfImages, size?, model?)`

Generates multiple images from a text prompt.

**Parameters:**
- `prompt` (string): The text prompt describing the images
- `numberOfImages` (number): Number of images to generate (1-5)
- `size` (ImageSize, optional): Image size. Defaults to `"512x512"`
- `model` (Model, optional): DALL-E model. Defaults to `"dall-e-3"`

**Returns:** `Promise<string[]>` - Array of URLs to the generated images

### `ChatAssistant` Class

Assistant class for having conversations while keeping the history.

#### Constructor: `new ChatAssistant(openai, temperature, chatModel?)`

**Parameters:**
- `openai` (OpenAI): The authenticated OpenAI client
- `temperature` (number): Temperature for response generation (0-2). Note: `gpt-5-mini` only supports temperature=1
- `chatModel` (string, optional): The model to use. Defaults to `gpt-5-mini`

#### `chatAssistant.chat(...messages)`

Starts a conversation and returns an answer with the ability to continue the conversation.

**Parameters:**
- `messages` (ChatCompletionMessageParam[]): Thread messages, usually the system message and a first message

**Returns:** `Promise<Conversation>` with:
- `answer`: The response from the assistant
- `chat(message)`: Function to continue the conversation

**Example:**
```typescript
import { ChatAssistant } from "story-gpt";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assistant = new ChatAssistant(openai, 1, "gpt-5-mini");
const conv = await assistant.chat({role: "user", content: "Where is Argentina?"});
console.log("Answer is", conv.answer.content);
const followUp = await conv.chat({role: "user", content: "And how big is it?"});
console.log("Argentina size is:", followUp.answer.content);
```

## Important Notes

- **Temperature with gpt-5-mini**: The `gpt-5-mini` model only supports the default temperature value (1). When using this model, the library automatically omits the temperature parameter to avoid API errors.
- **Image URLs**: Generated image URLs are temporary and will expire. Make sure to download the images if you need to persist them.
- **API Key**: You need a valid OpenAI API key to use this library. Set it as an environment variable or pass it directly to the OpenAI client.

## Development

### Running E2E Tests

The repository includes comprehensive end-to-end tests that verify all endpoints of the library. These tests run automatically on every push and pull request.

To run the E2E tests locally:

```bash
# Build the project
npm run build

# Set your OpenAI API key
export OPENAI_TOKEN=your_openai_api_key_here

# Run the E2E tests
node e2e-test.mjs
```

The E2E tests cover:
- Story creation with `createStory()`
- Story generation with `Story.generateStory()`
- Prompt validation with `verifyPrompt()`
- Image generation with `ImageGenerator.generateImage()`
