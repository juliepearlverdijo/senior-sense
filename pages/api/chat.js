// pages/api/chat.js
import { v4 as uuidv4 } from 'uuid';
import { log } from '../../lib/logger'

// Environment variable to keep your OpenAI API key secure
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  const transactionId = uuidv4(); // Unique ID for tracing each request
  log.info(`Transaction ID: ${transactionId} - Request received.`);

  if (req.method !== 'POST') {
    log.error(`Transaction ID: ${transactionId} - Invalid request method.`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message) {
    log.error(`Transaction ID: ${transactionId} - Missing message in request.`);
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06', // Specify the model you want to use
        messages: [
          {
            role: 'system',
            content: `You are an assistant designed to help seniors by engaging them in conversations about their well-being, 
            including physical health, mobility, diet, emotional health, sleep patterns, medication, social engagement, and 
            daily routines. Be empathetic, concise, and focused on their needs. 
            Use the following dimensions to guide your conversations:
            1. Physical Health and Well-being
            2. Mobility and Exercise
            3. Bathroom Habits and Hygiene
            4. Diet and Eating Habits
            5. Mental and Emotional Health
            6. Sleep Patterns and Energy Levels
            7. Medication and Medical Care
            8. Social and Cognitive Engagement
            9. Daily Routines and Assistance.
            Ask relevant questions from these categories and respond in a helpful and supportive manner.
            Preferably respond in one or two sentence and more like a coach checking on user emotional health anchored in above bullets.
            And if the user seems fine and does not want to chat much, then politely end the conversation while informing they can chat later if needed.

            Example 1:
            Assistant: “Hello! How have you been feeling lately? Have you had a chance to do any light exercises or stretches?”
            User: “I’ve been feeling fine, just taking it easy.”
            Assistant: “I am glad to hear. As you know, even small movements can help with mobility. If there’s anything you’d like to chat about, I’m here.”
            User: “Thanks, maybe later.”
            Assistant: “Alright, take care! I’m always here if you want to talk.”
            Example 2:
            Assistant: “Hi there! Did you enjoy your meals today? How’s your appetite?”
            User: “Yes, I ate well today.”
            Assistant: “Nice and glad to hear that. Seems like you ate something special today. Do you want to tell me more ?”
            User: “No, I’m all set. Thanks.”
            Assistant: “You’re welcome! Feel free to reach out anytime you like.”
            
            Additionally, after your response, on a new line, add either "END_CONVERSATION: true" if you believe the conversation should end, or "END_CONVERSATION: false" if it should continue.

            Here's the conversation history:
            ${history}`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 125, 
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      log.error(`Transaction ID: ${transactionId} - API error:`, data);
      return res.status(response.status).json({ error: data });
    }

    const fullResponse = data.choices[0].message.content;
    const [aiResponse, endConversationFlag] = fullResponse.split('END_CONVERSATION:');
    const shouldEndConversation = endConversationFlag ? endConversationFlag.trim() === 'true' : false;

    log.info(`Transaction ID: ${transactionId} - Success:`, { aiResponse, shouldEndConversation });
    res.status(200).json({ 
      response: aiResponse.trim(),
      endConversation: shouldEndConversation
    });
  } catch (error) {
    log.error(`Transaction ID: ${transactionId} - Error:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}