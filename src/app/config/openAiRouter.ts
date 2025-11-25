import OpenAI from 'openai';
import { envVars } from './env';

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: envVars.OPENAI_API_KEY,

});


