# Story-GPT

Typescript library used to generate the stories for [StoryBot](https://storybot.dev)

## Installation

[![NPM Release](https://github.com/CodingBull-dev/story-gpt/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/CodingBull-dev/story-gpt/actions/workflows/npm-publish.yml)
[![E2E Tests](https://github.com/CodingBull-dev/story-gpt/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/CodingBull-dev/story-gpt/actions/workflows/e2e-tests.yml)

[![NPM Version](https://img.shields.io/npm/v/story-gpt)](https://npmjs.com/story-gpt)

`npm install --save story-gpt`

## Usage

```typescript
import { createStory } from "story-gpt";

const story = await createStory("A story about a happy horse", new OpenAI({apiKey: ">my api key<"}));

console.log("The story is named %s and it's tells the following story:", story.title, story.content);
console.log("See the cover picture for the story here:", story.image);
```

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
