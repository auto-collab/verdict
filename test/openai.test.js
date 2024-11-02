import { callOpenAI } from '../openai/openaiHandler';
import fetchMock from 'fetch-mock';
import { config } from '../config.js';
import { systemMessage, userMessage } from '../openai/promptTemplates';

describe('callOpenAI', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  test('should successfully call OpenAI', async () => {
    const mockResposne = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Test response',
          },
        },
      ],
    };
    
    fetchMock.post(config.OPENAI_URI, {
        status: 200,
        body: JSON.stringify(mockResponse)
    });
    
});

    const reviews = ['This product is amazing!', 'I love it!'];
    const data = await callOpenAI(reviews);

    expect(data).toEqual(mockResponse);
    expect(fetchMock.called(config.OPENAI_URI)).toBe(true);
    const fetchCall = fetchMock.calls(config.OPENAI_URI)[0];
    expect(fetchCall[1].headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
    });
    expect(fetchCall[1].body).toEqual(
      JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, userMessage(reviews)],
        max_tokens: 1500,
      }),
    );
  });
