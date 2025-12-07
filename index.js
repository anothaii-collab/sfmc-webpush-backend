// index.js
import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("✅ Firebase initialized successfully");

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => {
  res.send("Web Push Backend is running!");
});

// SFMC Custom Activity endpoint
app.post("/custom-activity", async (req, res) => {
  try {
    const { fcmToken, title, body } = req.body;

    if (!fcmToken || !title || !body) {
      return res.status(400).json({ error: "Missing fcmToken, title, or body" });
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      webpush: { headers: { TTL: "300" } }
    };

    const response = await admin.messaging().send(message);
    console.log("Push sent:", response);

    res.json({ success: true, response });
  } catch (error) {
    console.error("Error sending push:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Web Push Backend listening on port ${PORT}`);
});
