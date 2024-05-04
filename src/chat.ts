import type { OpenAI } from "openai";

type Conversation = {
    /** The answer the system gave to the prompt */
    answer: OpenAI.Chat.Completions.ChatCompletionMessage;
    /** Continue the conversation keeping the old messages in the history */
    chat(message: OpenAI.Chat.Completions.ChatCompletionMessageParam): Promise<Conversation>;
}

/**
 * Assistant class that allows to have conversations while keeping the history
 */
export class ChatAssistant {
    public constructor(private readonly openai: OpenAI, public readonly temperature: number, public readonly chatModel: string = "gpt-4-turbo") {
    }

    /**
     * Allows to start a conversation and returns an answer and an function with the history
     * @param messages thread messages, usually the system one and a first message
     * @returns an object with the response and the function `chat` 
     * which allows to continue the conversation using the previous history
     * 
     * @example 
     * ```ts
     * const conv = await chat.chat({role: "user", content: "Where is Argentina?"});
     * console.log("Answer is", conv.answer.content);
     * const followUp = conv.chat({role: "user", content: "And how big is it?"});
     * console.log("Argentina size is:", followUp.answer.content);
     */
    public async chat(...messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<Conversation> {
        const response = await this.openai.chat.completions.create({
            model: this.chatModel,
            temperature: this.temperature,
            messages: messages,
        });

        if (response.choices.length < 1) {
            throw new Error("No results found on prompt request");
        }

        const chatResponse = response.choices[0]?.message;

        if (!chatResponse) {
            throw new Error("Chat response is null");
        }

        return {
            answer: chatResponse,
            chat: (message: OpenAI.Chat.Completions.ChatCompletionMessageParam): Promise<Conversation> => {
                return this.chat(...messages, chatResponse, message);
            },
        };
    }
}
