import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

// Simple health check
app.get("/", (req, res) => {
  res.send("Web Push Custom Activity Backend is running!");
});

// Endpoint for SFMC Custom Activity
app.post("/custom-activity", async (req, res) => {
  try {
    const { fcmToken, title, body } = req.body;

    if (!fcmToken || !title || !body) {
      return res.status(400).json({ error: "Missing fcmToken, title, or body" });
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      webpush: { headers: { TTL: "300" } },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
