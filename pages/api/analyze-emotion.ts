import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid';
import { log } from '../../lib/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const transactionId = uuidv4()
  log.info(`Transaction ID: ${transactionId} - Emotion analysis request received.`)

  if (req.method !== 'POST') {
    log.error(`Transaction ID: ${transactionId} - Invalid request method.`)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { transcript } = req.body

  if (!transcript) {
    log.error(`Transaction ID: ${transactionId} - Missing transcript in request.`)
    return res.status(400).json({ error: 'Transcript is required' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI trained to analyze the emotional content of conversations. Your task is to determine the overall mood of the speaker based on their words. Respond with only one of these four options: Stressed, Anxious, Normal or Cheerful.',
          },
          {
            role: 'user',
            content: `Analyze the following conversation transcript and determine the speaker's mood: "${transcript}"`,
          },
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      log.error(`Transaction ID: ${transactionId} - API error:`, data)
      return res.status(response.status).json({ error: data })
    }

    const mood = data.choices[0].message.content.trim()

    if (['Stressed', 'Anxious', 'Normal', 'Cheerful'].includes(mood)) {
      log.info(`Transaction ID: ${transactionId} - Success: Mood analyzed as ${mood}`)
      res.status(200).json({ mood })
    } else {
      log.error(`Transaction ID: ${transactionId} - Invalid mood analysis result: ${mood}`)
      res.status(500).json({ error: 'Invalid mood analysis result' })
    }
  } catch (error) {
    log.error(`Transaction ID: ${transactionId} - Error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
}