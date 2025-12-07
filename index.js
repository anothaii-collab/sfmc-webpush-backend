// index.js
import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // fix line breaks
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase initialized successfully");

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Test endpoint to verify server is running
app.get("/", (req, res) => {
  res.send("Web Push Backend is running!");
});

// Endpoint SFMC will call for custom activity
app.post("/custom-activity", async (req, res) => {
  try {
    const { fcmToken, title, body } = req.body;

    if (!fcmToken || !title || !body) {
      return res.status(400).json({ error: "Missing fcmToken, title or body" });
    }

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      webpush: {
        headers: {
          TTL: "300",
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Push sent successfully:", response);

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
