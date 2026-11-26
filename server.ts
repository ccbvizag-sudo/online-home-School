import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSafetyInstruction(ageGroup: string, parentalControl: string, language: string): string {
  const controlRule =
    parentalControl === 'strict'
      ? 'Use strict child-safe guidance suitable for supervised young learners. Avoid complex mature, violent, or speculative topics; keep all examples uplifting, gentle, and educational.'
      : parentalControl === 'moderate'
        ? 'Use age-appropriate educational framing suitable for school learners with positive civic and ethical context.'
        : 'Maintain respectful, factual, constructive educational tone suitable for older students and young entrepreneurs.';

  return [
    'You are Acharya AI, the personal learning guide of Bharat Gurukul 360.',
    `Target learner age group: ${ageGroup}.`,
    `Language preference: Respond primarily in ${language} (when using Sanskrit or Indian terms, provide clear transliteration and plain meaning).`,
    `Parental control level: ${controlRule}`,
    'Ground explanations in clear pedagogy, authentic Indian knowledge context where relevant, real-world analogies, and encourage critical thinking and curiosity.',
    'Do not use markdown code-comment prefixes or robotic jargon. Write warm, clear, structured prose.',
  ].join(' ');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'bharat-gurukul-360' });
  });

  // 1. Conversational AI Guru Assistant
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const {
        prompt,
        mode = 'explain',
        subject = 'General Learning',
        ageGroup = 'Middle School (12-14)',
        language = 'English',
        parentalControl = 'strict',
        history = [],
      } = req.body ?? {};

      if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 2000) {
        res.status(400).json({ error: 'Please provide a valid question under 2000 characters.' });
        return;
      }

      const ai = getAiClient();
      const modeDirective: Record<string, string> = {
        explain: 'Explain the concept simply with clear step-by-step intuition and a practical everyday example.',
        story: 'Teach this concept through a memorable, age-appropriate story set in Indian heritage or everyday student life, ending with a 2-sentence takeaway.',
        revision: 'Create a focused revision summary with 4 key takeaways, 2 common pitfalls, and a 3-question self-check.',
        shastra: 'Explain the traditional Indian knowledge or philosophical concept respectfully with historical context, authentic source attribution, and practical value for modern life.',
        business: 'Guide the young learner like an entrepreneurship mentor: break down customer need, simple unit economics, and a 3-step mini-experiment.',
      };

      const systemInstruction = `${buildSafetyInstruction(ageGroup, parentalControl, language)} Subject focus: ${subject}. Mode instruction: ${modeDirective[mode] || modeDirective.explain}`;

      const safeHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .filter(
              (m): m is { role: 'user' | 'model'; text: string } =>
                m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string'
            )
            .map((m) => `${m.role === 'user' ? 'Student' : 'Acharya AI'}: ${m.text.slice(0, 600)}`)
            .join('\n')
        : '';

      const fullPrompt = safeHistory
        ? `Previous context:\n${safeHistory}\n\nStudent's current request: ${prompt.trim()}`
        : prompt.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: fullPrompt,
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply: response.text ?? 'I could not formulate a response. Please try rephrasing your question.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI service request failed.';
      console.error('AI assistant error:', message);
      res.status(500).json({ error: message });
    }
  });

  // 2. AI Customized Study & Homeschool Plan Generator
  app.post('/api/ai/study-plan', async (req, res) => {
    try {
      const {
        learnerName = 'Student',
        ageGroup = 'Preparatory (9-11)',
        interests = ['Mathematics', 'Sanskrit', 'Robotics'],
        pace = 'Balanced',
        hoursPerDay = 3,
        language = 'English',
        parentalControl = 'strict',
      } = req.body ?? {};

      const ai = getAiClient();
      const systemInstruction = buildSafetyInstruction(ageGroup, parentalControl, language);

      const prompt = `Create a structured weekly homeschool & holistic learning plan for ${String(learnerName).slice(0, 80)} (${ageGroup}), learning pace: ${pace}, daily study hours: ${Number(hoursPerDay) || 3}, interests: ${Array.isArray(interests) ? interests.slice(0, 10).join(', ') : 'Holistic learning'}. Balance modern academics, Gurukul values/yoga, hands-on entrepreneurship/projects, and physical sports.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planTitle: { type: Type.STRING },
              weeklyObjective: { type: Type.STRING },
              dailyBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeSlot: { type: Type.STRING },
                    pillar: { type: Type.STRING },
                    activity: { type: Type.STRING },
                  },
                },
              },
              recommendedProjects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              parentTip: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Study plan generation failed.';
      console.error('Study plan error:', message);
      res.status(500).json({ error: message });
    }
  });

  // 3. AI Quiz & Worksheet Generator
  app.post('/api/ai/quiz', async (req, res) => {
    try {
      const {
        topic = 'Ancient Indian Mathematics',
        ageGroup = 'Middle School (12-14)',
        level = 'Beginner',
        language = 'English',
        parentalControl = 'strict',
      } = req.body ?? {};

      const ai = getAiClient();
      const systemInstruction = buildSafetyInstruction(ageGroup, parentalControl, language);

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Create an interactive 4-question multiple-choice quiz and 2 practical worksheet activities on the topic "${String(topic).slice(0, 120)}" at ${level} difficulty.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                },
              },
              worksheetActivities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Quiz generation failed.';
      console.error('Quiz error:', message);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bharat Gurukul 360 running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
