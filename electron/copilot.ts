import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import {CompletionCopilot} from 'monacopilot';

export const copilotApp = express();
copilotApp.use(cors());
copilotApp.use(express.json());

export const copilot = new CompletionCopilot(undefined, {
    provider: undefined,
    model: async prompt => {
        const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {role: 'system', content: prompt.context},
                    {
                        role: 'user',
                        content: `${prompt.instruction}\n\n${prompt.fileContent}`,
                    },
                ],
                temperature: 0.1,
                max_tokens: 2048,
            }),
        },
        );
        
        const data = await response.json();

        return {
            text: data.choices.length > 0? data.choices[0].message.content: null,
        };
    },
});