import { config } from '../config';

test('API key is defined', () => {
  expect(config.OPENAI_API_KEY).toBeDefined();
});

test('API URI is defined', () => {
  expect(config.OPENAI_URI).toBeDefined();
});
