# Story-GPT

Typescript library used to generate the stories for [StoryBot](https://storybot.dev)

## Installation

[![NPM Release](https://github.com/CodingBull-dev/story-gpt/actions/workflows/npm-publish.yml/badge.svg?branch=main)](https://github.com/CodingBull-dev/story-gpt/actions/workflows/npm-publish.yml)

![NPM Version](https://img.shields.io/npm/v/story-gpt)

`npm install --save story-gpt`

## Usage

```typescript
import { createStory } from "story-gpt";

const story = await createStory("A story about a happy horse", new OpenAI({apiKey: ">my api key<"}));

console.log("The story is named %s and it's tells the following story:", story.title, story.content);
console.log("See the cover picture for the story here:", story.image);
```
