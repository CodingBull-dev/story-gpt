import type { OpenAI } from "openai";

type Conversation = {
    /** The answer the system gave to the prompt */
    answer: OpenAI.Chat.Completions.ChatCompletionMessage;
    /** Continue the conversation keeping the old messages in the history */
    chat(message: OpenAI.Chat.Completions.ChatCompletionMessageParam): Promise<Conversation>;
}

export class ChatAssistant {
    public constructor(private readonly openai: OpenAI, public readonly temperature: number, public readonly chatModel: string = "gpt-4-turbo") {
    }

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
