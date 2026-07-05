import { Router, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { AuthenticatedRequest, authorize } from "../middleware/authMiddleware";

const router = Router();
const apiKey = process.env.GEMINI_API_KEY;

/**
 * Helper: Get offline AI reply
 */
function getOfflineAiReply(message: string, role: string): string {
  const query = message.toLowerCase();
  let base = `[Offline Mode] `;

  if (role === "Student") {
    if (query.includes("attendance")) {
      return base + "Your overall attendance is currently **87%**, which is well above the required 75% threshold.";
    }
    if (query.includes("class") || query.includes("timetable")) {
      return base + "Today you have 2 lectures: **Data Structures** (CS-201) at 09:00 AM and **Database Systems** (CS-204) at 11:00 AM.";
    }
    if (query.includes("placement") || query.includes("google")) {
      return base + "Google is holding placements for 'Software Engineering Associate' with 22 LPA. Deadline: 15th July 2026.";
    }
    return base + "I am your CampusPilot AI Student Agent. Ask me about classes, attendance, or placements.";
  }

  if (role === "Faculty") {
    if (query.includes("performance") || query.includes("student")) {
      return base + "Your class average SGPA is 8.4. **Sneha Reddy** leads at 91%, **Vikram Mehta** needs support at 72%.";
    }
    return base + "I am your CampusPilot AI Faculty Agent. I can help with assignments, performance analysis, or announcements.";
  }

  return base + "I am the CampusPilot AI assistant. How can I help you today?";
}

/**
 * POST /api/ai/chat
 * Chat with AI assistant (requires auth)
 */
router.post("/chat", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    let reply = "";

    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { "User-Agent": "campuspilot-ai" } },
        });

        const systemInstruction =
          req.user.role === "Student"
            ? "You are the CampusPilot Student AI Agent. Help students with attendance, timetables, assignments, placements, and library resources."
            : req.user.role === "Faculty"
              ? "You are the CampusPilot Faculty AI Agent. Help faculty with assignment generation, class performance analysis, and student announcements."
              : "You are the CampusPilot Admin AI Agent. Help administrators manage users, audit logs, and system health.";

        const formattedHistory = Array.isArray(history)
          ? history.map((item: any) => ({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.parts?.[0]?.text || item.text || "" }],
            }))
          : [];

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [...formattedHistory, { role: "user", parts: [{ text: message }] }],
          config: { systemInstruction, temperature: 0.7 },
        });

        reply = response.text || "I was unable to generate a response.";
      } catch (err: any) {
        console.warn("Gemini API error, using fallback:", err.message);
        reply = getOfflineAiReply(message, req.user.role);
      }
    } else {
      reply = getOfflineAiReply(message, req.user.role);
    }

    res.json({ reply });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed." });
  }
});

/**
 * POST /api/ai/faculty
 * Faculty-specific AI tools (requires Faculty role)
 */
router.post(
  "/faculty",
  authorize("Faculty"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { action, params } = req.body;

      if (!action) {
        res.status(400).json({ error: "Action is required." });
        return;
      }

      let result = "";

      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { "User-Agent": "campuspilot-ai" } },
          });

          let prompt = "";

          if (action === "generateAssignment") {
            prompt = `Generate a university level assignment for course "${params.courseName}" (${params.courseCode}) on topic "${params.topic}". Total marks: 100.`;
          } else if (action === "generatePaper") {
            prompt = `Create an exam question paper for "${params.courseName}" (${params.courseCode}). Format with Sections A, B, C. Total marks: 100.`;
          } else if (action === "suggestMarks") {
            prompt = `Suggest an evaluation scheme for "${params.courseName}" (${params.courseCode}) worth 100 marks total. Include quizzes, lab, assignments, exams, and attendance.`;
          } else if (action === "analyzePerformance") {
            prompt = `Analyze this class performance data and provide insights: ${JSON.stringify(params.students || [])}`;
          } else if (action === "draftAnnouncement") {
            prompt = `Draft a professional announcement for students regarding "${params.topic}" in "${params.courseName}".`;
          }

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0.7 },
          });

          result = response.text || "No output generated.";
        } catch (err: any) {
          console.warn("Gemini faculty AI error, using fallback:", err.message);
          result = getFacultyFallback(action, params);
        }
      } else {
        result = getFacultyFallback(action, params);
      }

      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Faculty AI error:", error);
      res.status(500).json({ error: "Faculty AI request failed." });
    }
  }
);

function getFacultyFallback(action: string, params: any): string {
  if (action === "generateAssignment") {
    return `### Assignment: ${params.topic || "Advanced Practice"}
**Course:** ${params.courseName} (${params.courseCode})
**Total Marks:** 100

#### Questions:
1. Define the core concepts and explain with real-world examples (40 marks)
2. Design and implement a practical solution (40 marks)
3. Provide critical analysis and improvements (20 marks)`;
  } else if (action === "generatePaper") {
    return `### Question Paper: ${params.courseName} (${params.courseCode})
**Duration:** 3 Hours | **Max Marks:** 100

#### SECTION A (10 x 2 = 20 Marks)
Answer all questions briefly (50 words max each)

#### SECTION B (5 x 8 = 40 Marks)
Answer any 5 questions (250 words max each)

#### SECTION C (2 x 20 = 40 Marks)
Answer any 2 comprehensive questions`;
  }
  return "Faculty AI feature not available in offline mode.";
}

export default router;
