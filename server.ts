import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Lazy Initialize Google GenAI Client
// Set User-Agent to 'aistudio-build' for telemetry as requested
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but is currently missing. Please configure it.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.use(express.json());

// Server-side cache for tracking the active user support conversation
let latestChatMessages: any[] = [];

// GET endpoint to retrieve the active chat history for cross-view recommendation audits
app.get("/api/chat/latest-history", (req, res) => {
  res.json({ messages: latestChatMessages });
});

// POST endpoint to clear the cached active chat history on the server
app.post("/api/chat/clear", (req, res) => {
  latestChatMessages = [];
  res.json({ success: true, message: "Server-side chat cache cleared." });
});

// POST endpoint to sync the cached active chat history with server
app.post("/api/chat/sync", (req, res) => {
  const { messages } = req.body;
  if (messages && Array.isArray(messages)) {
    latestChatMessages = messages;
    return res.json({ success: true, count: latestChatMessages.length });
  }
  res.status(400).json({ error: "Invalid messages format. Expected array." });
});

// API endpoints
// AI Support Chat (Streaming)
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, context, modelSelection, responseLength, language } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Cache the active chat messages for real-time recommendations
    latestChatMessages = messages;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let lengthInstruction = "";
    if (responseLength === "short") {
      lengthInstruction = "\nRESPONSE LENGTH CONSTRAINT: You MUST keep your responses extremely short, concise, and direct (maximum 2-3 sentences or 50 words). Avoid any extra explanation.";
    } else if (responseLength === "long") {
      lengthInstruction = "\nRESPONSE LENGTH CONSTRAINT: You MUST provide highly detailed, comprehensive explanations, outlining all technical steps, logs, commands, and options fully.";
    } else {
      lengthInstruction = "\nRESPONSE LENGTH CONSTRAINT: You MUST keep your response medium-sized (around 2-3 short paragraphs), balancing brevity and detail.";
    }

    let languageInstruction = "";
    if (language && language !== "English") {
      languageInstruction = `\nLANGUAGE CONSTRAINT: You MUST write your entire response in the ${language} language. Keep code blocks, technical logs, or console command parameters in English if standard, but all conversational text must be translated to ${language}.`;
    }

    const systemInstruction = `You are "SupportPilot AI", an elite, professional, and friendly customer support virtual assistant.
Your goal is to help support agents and customers solve their inquiries with clear, accurate, and empathetic guidance.
Always be polite and structured (use lists or bullet points when helpful).
Context about current workspace/ticket: ${context || "General inquiries."}
If asked to troubleshoot, provide step-by-step instructions.
Never expose internal technical credentials or backend configuration details.
${lengthInstruction}
${languageInstruction}`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const modelToUse = modelSelection || "gemini-3.5-flash";

    const responseStream = await getGenAI().models.generateContentStream({
      model: modelToUse,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error in SupportPilot AI Chat stream endpoint:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Internal server error during streaming." })}\n\n`);
    res.end();
  }
});

// AI Chat Conversation Classifier (Real-Time Analytics)
app.post("/api/chat/classify", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Skip empty or default assistant greeting-only histories to avoid unnecessary API costs
    if (messages.length <= 1) {
      return res.json({
        intent: "General Inquiry",
        sentiment: "Neutral",
        urgency: "Low",
        keyPhrases: ["Greetings", "Inquiry Started"],
        summary: "The customer is starting a new conversation with the virtual support agent."
      });
    }

    const historyText = messages
      .map((m: any) => `[${m.role === "assistant" ? "AI" : "User"}]: ${m.content}`)
      .join("\n");

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please analyze this support dialogue and provide classifications based on the user's responses:

${historyText}`,
      config: {
        systemInstruction: `You are an elite real-time customer support classification engine. Analyze the conversation history and return a structured JSON response.
You MUST choose values exactly as defined:
- intent: MUST be exactly one of: "Billing", "Technical Issue", "Account", "Refund", "Complaint", "General Inquiry".
- sentiment: MUST be exactly one of: "Positive", "Neutral", "Negative".
- urgency: MUST be exactly one of: "Low", "Medium", "High".
- keyPhrases: An array of 1 to 4 extracted key terms, products, error codes, or specific issues.
- summary: A single, brief, professional sentence summarizing the current state of the customer's request.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "The primary ticket intent. Values: Billing, Technical Issue, Account, Refund, Complaint, General Inquiry.",
            },
            sentiment: {
              type: Type.STRING,
              description: "Customer's prevailing tone: Positive, Neutral, Negative.",
            },
            urgency: {
              type: Type.STRING,
              description: "Detected urgency level: Low, Medium, High.",
            },
            keyPhrases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of relevant tags or keywords from the chat history.",
            },
            summary: {
              type: Type.STRING,
              description: "A one-sentence summary of the conversation.",
            },
          },
          required: ["intent", "sentiment", "urgency", "keyPhrases", "summary"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in SupportPilot AI Chat Classify endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to classify conversation." });
  }
});

// AI Support Chat (Regular)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Map client messages to Gemini contents structure
    const systemInstruction = `You are "SupportPilot AI", an elite, professional, and friendly customer support virtual assistant.
Your goal is to help support agents and customers solve their inquiries with clear, accurate, and empathetic guidance.
Always be polite, concise, and structured (use lists or bullet points when helpful).
Context about current workspace/ticket: ${context || "General inquiries."}
If asked to troubleshoot, provide step-by-step instructions.
Never expose internal technical credentials or backend configuration details.`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I apologize, but I could not generate a response. Please try again." });
  } catch (error: any) {
    console.error("Error in SupportPilot AI Chat endpoint:", error);
    res.status(500).json({ error: error.message || "Internal server error during chat generation." });
  }
});

// Ticket Summarizer (structured JSON output)
app.post("/api/summarize", async (req, res) => {
  try {
    const { ticketDetails } = req.body;

    if (!ticketDetails) {
      return res.status(400).json({ error: "ticketDetails is required" });
    }

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please review and summarize the following support ticket details:
Title: ${ticketDetails.title}
Category: ${ticketDetails.category}
Customer: ${ticketDetails.customer}
Description: ${ticketDetails.description}
Messages Log:
${(ticketDetails.messages || []).map((m: any) => `[${m.sender}]: ${m.text}`).join("\n")}`,
      config: {
        systemInstruction: "You are a ticket intelligence engine. Analyze the ticket details and output structured insights in JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A 1-2 sentence concise summary of the core issue.",
            },
            keyIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of the critical issues or technical blockers mentioned.",
            },
            sentiment: {
              type: Type.STRING,
              description: "Customer's tone: positive, neutral, frustrated, or angry.",
            },
            priority: {
              type: Type.STRING,
              description: "Recommended ticket priority: low, medium, high, or urgent.",
            },
            suggestedCategory: {
              type: Type.STRING,
              description: "Best fit ticket category, e.g., Billing, API Integration, Login, Bug, Sales.",
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step concrete actions required by the agent to resolve this ticket.",
            },
          },
          required: ["summary", "keyIssues", "sentiment", "priority", "suggestedCategory", "actionPlan"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in SupportPilot AI Summarize endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate ticket summary." });
  }
});

// Advanced Ticket Summary (satisfying specific customer support audit requirements)
app.post("/api/ticket/advanced-summary", async (req, res) => {
  try {
    const { ticketDetails } = req.body;

    if (!ticketDetails) {
      return res.status(400).json({ error: "ticketDetails is required" });
    }

    const messagesText = (ticketDetails.messages || [])
      .map((m: any) => `[${m.sender === "customer" ? "Customer" : "Agent"}]: ${m.text}`)
      .join("\n");

    const prompt = `Please review and perform an elite-tier support audit/summary of the following ticket details:
Title: ${ticketDetails.title}
Category: ${ticketDetails.category}
Customer Name: ${ticketDetails.customer}
Customer Email: ${ticketDetails.customerEmail}
Priority (reported): ${ticketDetails.priority}
Status: ${ticketDetails.status}

Original Customer Complaint:
${ticketDetails.description}

Dialogue Log History:
${messagesText || "No chat history messages logged yet."}`;

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert customer support audit agent. Your job is to analyze the support incident and generate a high-fidelity Ticket Summary.
You must return a structured JSON response containing:
- issueSummary: A concise, clear summary of the core incident.
- customerConcern: A specific assessment of the customer's main pain points, emotional friction, or business impacts.
- rootCause: An analytical deduction of the underlying technical, procedural, or account-level root cause of the incident.
- suggestedResolution: Clear, actionable, and step-by-step resolution path for the support agent to execute.
- priorityLevel: Must be exactly one of: "Low", "Medium", "High", "Urgent". Determine this by evaluating the complaint severity and urgency.
- estimatedResolutionTime: A realistic time estimate to fully solve this issue (e.g., "15 minutes", "2 hours", "1-2 business days").
- humanEscalationRecommendation: A clear recommendation on whether this requires higher-level human escalation (e.g. senior DevOps, engineering, billing specialist, or security team) and why.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueSummary: {
              type: Type.STRING,
              description: "A clear, concise, and professional summary of the core issue.",
            },
            customerConcern: {
              type: Type.STRING,
              description: "The primary pain point, business impact, or frustration felt by the customer.",
            },
            rootCause: {
              type: Type.STRING,
              description: "The technical, systemic, or procedural root cause of the issue.",
            },
            suggestedResolution: {
              type: Type.STRING,
              description: "A complete, itemized, step-by-step resolution guide for support teams.",
            },
            priorityLevel: {
              type: Type.STRING,
              description: "Urgency classification: Low, Medium, High, Urgent.",
            },
            estimatedResolutionTime: {
              type: Type.STRING,
              description: "Typical estimated timeframe required to fully close the ticket.",
            },
            humanEscalationRecommendation: {
              type: Type.STRING,
              description: "Detailed evaluation of whether/how to escalate this to engineering or specialized staff.",
            },
          },
          required: [
            "issueSummary",
            "customerConcern",
            "rootCause",
            "suggestedResolution",
            "priorityLevel",
            "estimatedResolutionTime",
            "humanEscalationRecommendation",
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in SupportPilot advanced summary endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to compile advanced ticket summary." });
  }
});

// Knowledge Base Article Draft Generator
app.post("/api/generate-article", async (req, res) => {
  try {
    const { topic, context } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const systemInstruction = `You are an expert technical writer and knowledge-base manager.
Create a comprehensive, elegantly structured Knowledge Base article in Markdown format based on the topic.
The article must contain:
1. An engaging Title (H1)
2. Quick Summary / TL;DR section
3. Root Cause / Overview
4. Step-by-step Resolution / Tutorial with code block examples or config formats if applicable
5. Frequently Asked Questions (FAQ) section
6. Related links or tags.
Use a modern, helpful, professional, and clear tone. Maintain high technical accuracy.`;

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Draft a knowledge base article about: "${topic}". Additional Context: ${context || "None"}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ markdown: response.text || "Failed to generate article draft." });
  } catch (error: any) {
    console.error("Error in Knowledge Base draft generation:", error);
    res.status(500).json({ error: error.message || "Failed to generate article draft." });
  }
});

// AI Knowledge Base Article Recommender (Real-Time Recommendation based on Active Chat Conversation)
app.post("/api/kb/recommend", async (req, res) => {
  try {
    const { articles, messages } = req.body;

    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: "Articles array is required." });
    }

    // Fallback to cached messages if none passed in body
    const activeMessages = (messages && Array.isArray(messages)) ? messages : latestChatMessages;

    if (!activeMessages || activeMessages.length === 0) {
      return res.json({ recommendations: [] });
    }

    const dialogueText = activeMessages
      .map((m: any) => `[${m.role === "assistant" ? "AI" : "User"}]: ${m.content}`)
      .join("\n");

    const articlesBrief = articles.map((art: any) => ({
      id: art.id,
      title: art.title,
      category: art.category,
      summary: art.summary,
      tags: art.tags || [],
    }));

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Dialogue History:
${dialogueText}

Knowledge Base Articles List:
${JSON.stringify(articlesBrief, null, 2)}`,
      config: {
        systemInstruction: `You are an elite support knowledge search and routing AI. Your task is to recommend the top 1 to 3 relevant articles from the given list of Knowledge Base articles based on the active dialogue history.
Provide a clear relevance score (0 to 100) and a brief reason (1-2 sentences) explaining how that article helps resolve the specific issue described in the dialogue. Return your response as a structured JSON object containing a 'recommendations' array. Do not suggest articles that are completely irrelevant.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  articleId: { type: Type.STRING, description: "The ID of the recommended article (e.g. KB-102)" },
                  relevanceScore: { type: Type.INTEGER, description: "The confidence rating from 0 to 100 of how relevant this article is" },
                  recommendationReason: { type: Type.STRING, description: "A highly concise 1-2 sentence explanation of why this article is relevant to the active dialogue" },
                },
                required: ["articleId", "relevanceScore", "recommendationReason"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const resultText = response.text || "{\"recommendations\": []}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in SupportPilot KB recommendation endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate recommendations." });
  }
});

// Vite Dev Server Integration & Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SupportPilot AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
