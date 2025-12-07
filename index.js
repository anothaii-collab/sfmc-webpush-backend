import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";

// -----------------------------
// CONFIG
// -----------------------------
const PORT = process.env.PORT || 3000;

// Paste your Firebase service account JSON here
const serviceAccount = {
  "type": "service_account",
  "project_id": "webpush-test-2cfd9",
  "private_key_id": "2a1f4b93d7dfeb08282e964d3330f0a194818e35",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@webpush-test-2cfd9.iam.gserviceaccount.com",
  "client_id": "110144192312269067430",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40webpush-test-2cfd9.iam.gserviceaccount.com"
};

// JWT Signing Secret from SFMC
const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET || "YOUR_JWT_SIGNING_SECRET_HERE";

// -----------------------------
// INIT
// -----------------------------
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

// -----------------------------
// ROUTE
// -----------------------------
app.post("/custom-activity", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Missing JWT");

  try {
    const payload = jwt.verify(token, JWT_SIGNING_SECRET);
    console.log("SFMC payload:", payload);

    const { fcmToken, title, body } = req.body;

    if (!fcmToken) return res.status(400).send("Missing FCM token");

    // Send push
    admin.messaging().send({
      token: fcmToken,
      notification: { title: title || "Test Push", body: body || "Hello from SFMC" },
    })
    .then(response => {
      console.log("Push sent:", response);
      res.status(200).send({ success: true, response });
    })
    .catch(err => {
      console.error("Push error:", err);
      res.status(500).send({ success: false, error: err.message });
    });

  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).send("Invalid JWT");
  }
});

// -----------------------------
// START SERVER
// -----------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
