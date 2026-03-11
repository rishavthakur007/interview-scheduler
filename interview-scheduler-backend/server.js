import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());

// Helper: read database
const readDB = () => {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
};

// Helper: write database
const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// ─── ROUTES ───────────────────────────────────────────

// GET /interviews → Frontend fetches all interviews
app.get("/interviews", (req, res) => {
  const db = readDB();
  res.json(db.interviews);
});

// POST /interviews → Frontend adds a new interview when call is triggered
app.post("/interviews", (req, res) => {
  const { name, phone, role, round, day, time } = req.body;
  const db = readDB();

  const newInterview = {
    id: Date.now().toString(),
    name,
    phone,
    role,
    round,
    requestedDay: day,
    requestedTime: time,
    confirmedSlot: null, // filled by webhook later
    status: "calling", // calling | scheduled | busy | failed
    transcript: null, // filled by webhook later
    createdAt: new Date().toISOString(),
  };

  db.interviews.push(newInterview);
  writeDB(db);

  res.json({ success: true, interview: newInterview });
});

// PATCH /interviews/:id/callid → save Bolna call ID
app.patch("/interviews/:id/callid", (req, res) => {
  const { callId } = req.body;
  const db = readDB();
  const interview = db.interviews.find((i) => i.id === req.params.id);
  if (interview) {
    interview.callId = callId;
    writeDB(db);
    console.log(`🔗 Linked call ID ${callId} to ${interview.name}`);
  }
  res.json({ success: true });
});

// POST /webhook → Bolna sends call result here after call ends
app.post("/webhook", (req, res) => {
  console.log("📞 Webhook received:", JSON.stringify(req.body, null, 2));

  const { status, transcript, extracted_data } = req.body;
  const incomingCallId = req.body?.id;
  const db = readDB();

  const interview = db.interviews.find(
    (i) => i.callId === incomingCallId
  );

  if (interview) {
    const statusMap = {
      "initiated": "calling",
      "ringing":   "calling",
      "busy":      "busy",
      "completed": "scheduled",
      "failed":    "failed",
    };
    interview.status = statusMap[status] || status;
    interview.transcript = transcript || interview.transcript;
    interview.confirmedSlot = extracted_data?.confirmed_slot 
                              || interview.confirmedSlot;
    writeDB(db);
    console.log(`✅ Updated interview for ${interview.name} → ${interview.status}`);
  } else {
    console.log("⚠️ No matching interview found for webhook");
  }

  res.json({ success: true });
});

// DELETE /interviews/:id → HR can remove an interview
app.delete("/interviews/:id", (req, res) => {
  const db = readDB();
  db.interviews = db.interviews.filter((i) => i.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// ─── START SERVER ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
