import { systemMessage, userMessage } from './PromptTemplates.js';
import { config } from '../config.js';

export async function callOpenAI(reviews) {
  try {
    const response = await fetch(config.OPENAI_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, userMessage(reviews)],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API request failed:', errorData);
      throw new Error(
        `OpenAI API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    return data;
  } catch (error) {
    console.error('Error during OpenAI API call:', error);
    throw error;
  }
}
