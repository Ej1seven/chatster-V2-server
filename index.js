//server framework used to build JSON APIs
const express = require("express");
//node.js package used to enable CORS in various options
const cors = require("cors");
//authorization routes used to register and login users to the Stream API
const authRoutes = require("./routes/auth");

const app = express();

const PORT = process.env.PORT || 5000;
//dependency module that loads environment variables from the .env file
require("dotenv").config();
//Credentials linked to my Twilio account
//Twilio is used in this app to provided users with a notification when they receive a new message through the Stream API
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require("twilio")(accountSid, authToken);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/", (req, res) => {
  const { message, user: sender, type, members } = req.body;

  if (type === "message.new") {
    members
      .filter((member) => member.user_id !== sender.id)
      .forEach(({ user }) => {
        if (!user.online) {
          twilioClient.messages
            .create({
              body: `You have a new message from ${message.user.fullName} - ${message.text}`,
              messagingServiceSid: messagingServiceSid,
              to: user.phoneNumber,
            })
            .then(() => console.log("Message sent!"))
            .catch((err) => console.log(err));
        }
      });

    return res.status(200).send("Message sent!");
  }

  return res.status(200).send("Not a new message request");
});
//path used to route the server to the authorization requests
app.use("/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
