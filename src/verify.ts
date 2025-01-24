import { OpenAI } from "openai";
import { Moderation } from "openai/resources";

type StoryResult = { validStory: true } | { validStory: false, reasonForRejection: string }

/**
 * Utility method that verifies if a prompt qualifies as a story.
 * Useful to be used as the filter before processing a story and receiving an answer like
 * "I'm sorry, but X is not a prompt for a story"
 * @param prompt The prompt to analyze
 * @param openai The openai authenticated client
 * @param chatModel optional, the model to use. Defaults to gpt-4-turbo
 * @returns a `{validStory:boolean,reasonForRejection?:string}` object. 
 * If validStory is false, the reasonForRejection will contain the information
 */
export async function verifyPrompt(prompt: string, openai: OpenAI, chatModel: string = "gpt-4-turbo"): Promise<StoryResult> {
    const moderator = await openai.moderations.create({
        model: "text-moderation-latest",
        input: `A user submitted the following input to generate a story or blogpost: ${prompt}`
    });

    for (const moderation of moderator.results) {
        if (moderation.flagged) {
            const rejectionFlags: (keyof Moderation.Categories)[] = [];
            for (const key of Object.keys(moderation.categories)) {
                // We need to capture all the categories that were flagged
                if (moderation.categories[key as keyof Moderation.Categories]) {
                    rejectionFlags.push(key as keyof Moderation.Categories);
                }
            }
            return { validStory: false, reasonForRejection: `User prompt contains the following flagged topics: ${rejectionFlags.join(", ")}` };
        }
    }

    const response = await openai.chat.completions.create({
        model: chatModel,
        messages: [{
            role: "system", content: "You verify if a prompt is a set of instructions to a story or blogpost or if it is an unrelated command"
        },
        { role: "user", content: `Is the following prompt a prompt for a story?\n\n${prompt}` },
        ],
        tools: [{
            type: "function",
            function: {
                name: "is_story_prompt",
                description: "Informs if a prompt is a story prompt",
                parameters: {
                    type: "object",
                    properties: {
                        isStory: {
                            type: "boolean",
                            description: "True if the prompt is an instruction for a story or a blog. False if the prompt is unrelated"
                        },
                        kindOfPrompt: {
                            type: "string",
                            description: "Explain what is missing to be a story prompt. Around 140 characters"
                        }
                    },
                    required: ["isStory", "kindOfPrompt"],
                }
            }
        }],
        tool_choice: "auto"
    });

    const responseMessage = response.choices[0]?.message;
    if (!responseMessage?.tool_calls || !responseMessage.tool_calls[0]?.function.arguments) {
        throw new Error("Missing tool calls");
    }

    const { isStory, kindOfPrompt } = JSON.parse(responseMessage.tool_calls[0].function.arguments) as { isStory: boolean, kindOfPrompt: string };

    return isStory ? { validStory: true } : { validStory: false, reasonForRejection: kindOfPrompt };
}
