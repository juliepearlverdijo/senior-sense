import { v4 as uuidv4 } from 'uuid';
import { log } from '../../lib/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  const transactionId = uuidv4();
  log.info(`Transaction ID: ${transactionId} - Request received.`);

  if (req.method !== 'POST') {
    log.error(`Transaction ID: ${transactionId} - Invalid request method.`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversationTexts } = req.body;

  if (!Array.isArray(conversationTexts) || conversationTexts.length === 0) {
    log.error(`Transaction ID: ${transactionId} - Missing or invalid conversation texts.`);
    return res.status(400).json({ error: 'conversationTexts is required and must be an array.' });
  }

  try {
    console.log('run here')
    const analysisResults = await Promise.all(
      conversationTexts.map(async (message) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `
                  You are an advanced analysis assistant. Analyze the given conversation array of message texts to provide a detailed evaluation based on these dimensions: 
                  1. Time Analysis
                  2. Emotion Analysis
                  3. Alertness Analysis
                  4. Medical Information
                  5. Support System Reliability
                  6. Independence / Autonomy
                  7. Emotional / Mental Health
                  8. Social Interactions / Isolation
                  9. Engagement in Daily Activities
                  
                  If analysis for any dimension is not possible, set the status to "Not available".
                  VERY IMPORTANT:Be tolerant to the input if some array elements are empty/unstructured then ignore them, but definitely present the results in the following JSON format:
                  {
                    "time": {
                      "consistency": "<string>",
                      "typicalConversationTime": "<string>",
                      "durationInsight": "<string>",
                      "score": "<string>"
                    },
                    "emotion": {
                      "consistency": "<string>",
                      "detectedEmotions": ["<string>", "<string>", ...],
                      "score": "<string>"
                    },
                    "alertness": {
                      "consistency": "<string>",
                      "contextualResponse": "<string>",
                      "score": "<string>"
                    },
                    "medicalInformation": {
                      "painLevels": {
                        "status": "<Fluctuating | Stable | Increasing | Decreasing | Not available>",
                        "description": "<brief description>"
                      },
                      "medicationAdherence": {
                        "status": "<Consistent | Inconsistent | Not available>",
                        "description": "<brief description>"
                      },
                      "fatigueOrTiredness": {
                        "status": "<Increased | Stable | Decreased | Not available>",
                        "description": "<brief description>"
                      }
                    },
                    "supportSystemReliability": {
                      "caregiverAvailability": {
                        "status": "<Frequent | Occasional | Rare | Not available>",
                        "description": "<brief description>"
                      },
                      "trustInCaregivers": {
                        "status": "<High | Moderate | Low | Not available>",
                        "description": "<brief description>"
                      }
                    },
                    "independenceAutonomy": {
                      "needForAssistance": {
                        "status": "<High | Moderate | Low | Not available>",
                        "description": "<brief description>"
                      },
                      "abilityToManageDailyTasks": {
                        "status": "<Independent | Needs Help | Dependent | Not available>",
                        "description": "<brief description>"
                      }
                    },
                    "emotionalMentalHealth": {
                      "emotionalWellbeing": {
                        "status": "<Stable | Fluctuating | Declining | Improving | Not available>",
                        "description": "<brief description>"
                      },
                      "emotionalExpression": {
                        "status": "<Open | Reserved | Varied | Not available>",
                        "description": "<brief description>"
                      }
                    },
                    "socialInteractionsIsolation": {
                      "communicationWithFamilyFriends": {
                        "status": "<Frequent | Occasional | Rare | Not available>",
                        "description": "<brief description>"
                      }
                    },
                    "engagementInDailyActivities": {
                      "selfCare": {
                        "status": "<Consistent | Inconsistent | Declining | Not available>",
                        "description": "<brief description>"
                      }
                    }
                  }
                  `,
              },
              {
                role: 'user',
                content: JSON.stringify(message),
              },
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          log.error(`Transaction ID: ${transactionId} - API error:`, data);
          return { error: data };
        }

        const content = data.choices[0].message.content;
        const jsonString = content.replace(/```json\n|\n```/g, '');
        console.log('jsonString:', JSON.parse(jsonString))

        return JSON.parse(jsonString)
      })
    );

    console.log('analysisResults:', analysisResults)

    const aggregatedAnalysis = aggregateResults(analysisResults);

    //log.info(`Transaction ID: ${transactionId} - Success:`, aggregatedAnalysis);
    res.status(200).json(aggregatedAnalysis);
  } catch (error) {
    log.error(`Transaction ID: ${transactionId} - Error:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function aggregateResults(results) {
  const aggregated = {
    time: {
      consistency: getMostCommonValue(results, 'time.consistency'),
      typicalConversationTime: getMostCommonValue(results, 'time.typicalConversationTime'),
      durationInsight: getRandomValue(results, 'time.durationInsight'),
      score: calculateAverageScore(results, 'time.score'),
    },
    emotion: {
      consistency: getMostCommonValue(results, 'emotion.consistency'),
      detectedEmotions: getMostCommonEmotions(results),
      score: calculateAverageScore(results, 'emotion.score'),
    },
    alertness: {
      consistency: getMostCommonValue(results, 'alertness.consistency'),
      contextualResponse: getRandomValue(results, 'alertness.contextualResponse'),
      score: calculateAverageScore(results, 'alertness.score'),
    },
    medicalInformation: {
      painLevels: { 
        status: getMostCommonValue(results, 'medicalInformation.painLevels.status'),
        description: getRandomValue(results, 'medicalInformation.painLevels.description'),
      },
      medicationAdherence: { 
        status: getMostCommonValue(results, 'medicalInformation.medicationAdherence.status'),
        description: getRandomValue(results, 'medicalInformation.medicationAdherence.description'),
      },
      fatigueOrTiredness: { 
        status: getMostCommonValue(results, 'medicalInformation.fatigueOrTiredness.status'),
        description: getRandomValue(results, 'medicalInformation.fatigueOrTiredness.description'),
      },
    },
    supportSystemReliability: {
      caregiverAvailability: { 
        status: getMostCommonValue(results, 'supportSystemReliability.caregiverAvailability.status'),
        description: getRandomValue(results, 'supportSystemReliability.caregiverAvailability.description'),
      },
      trustInCaregivers: { 
        status: getMostCommonValue(results, 'supportSystemReliability.trustInCaregivers.status'),
        description: getRandomValue(results, 'supportSystemReliability.trustInCaregivers.description'),
      },
    },
    independenceAutonomy: {
      needForAssistance: { 
        status: getMostCommonValue(results, 'independenceAutonomy.needForAssistance.status'),
        description: getRandomValue(results, 'independenceAutonomy.needForAssistance.description'),
      },
      abilityToManageDailyTasks: { 
        status: getMostCommonValue(results, 'independenceAutonomy.abilityToManageDailyTasks.status'),
        description: getRandomValue(results, 'independenceAutonomy.abilityToManageDailyTasks.description'),
      },
    },
    emotionalMentalHealth: {
      emotionalWellbeing: { 
        status: getMostCommonValue(results, 'emotionalMentalHealth.emotionalWellbeing.status'),
        description: getRandomValue(results, 'emotionalMentalHealth.emotionalWellbeing.description'),
      },
      emotionalExpression: { 
        status: getMostCommonValue(results, 'emotionalMentalHealth.emotionalExpression.status'),
        description: getRandomValue(results, 'emotionalMentalHealth.emotionalExpression.description'),
      },
    },
    socialInteractionsIsolation: {
      communicationWithFamilyFriends: { 
        status: getMostCommonValue(results, 'socialInteractionsIsolation.communicationWithFamilyFriends.status'),
        description: getRandomValue(results, 'socialInteractionsIsolation.communicationWithFamilyFriends.description'),
      },
    },
    engagementInDailyActivities: {
      selfCare: { 
        status: getMostCommonValue(results, 'engagementInDailyActivities.selfCare.status'),
        description: getRandomValue(results, 'engagementInDailyActivities.selfCare.description'),
      },
    },
  };

  return aggregated;
}

function getMostCommonValue(results, path) {
  const values = results.map(r => getNestedValue(r, path)).filter(Boolean);
  return mode(values) || "Not available";
}

function getRandomValue(results, path) {
  const values = results.map(r => getNestedValue(r, path)).filter(Boolean);
  return values[Math.floor(Math.random() * values.length)] || "Not available";
}

function calculateAverageScore(results, path) {
  const scores = results.map(r => parseFloat(getNestedValue(r, path))).filter(Boolean);
  if (scores.length === 0) return "Not available";
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return average.toFixed(2);
}

function getMostCommonEmotions(results) {
  const allEmotions = results.flatMap(r => r.emotion.detectedEmotions);
  const emotionCounts = allEmotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});
  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);
  return sortedEmotions.length > 0 ? sortedEmotions : ["Not available"];
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((p, c) => p && p[c], obj);
}

function mode(array) {
  if (array.length === 0) return null;
  const modeMap = {};
  let maxEl = array[0], maxCount = 1;
  for(let i = 0; i < array.length; i++) {
    let el = array[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}