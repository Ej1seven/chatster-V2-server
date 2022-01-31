//connects to the Stream API
const { connect } = require("getstream");
const StreamChat = require("stream-chat").StreamChat;
//library used to hash passwords
const bcrypt = require("bcrypt");
//performs data encryption and decryption. This is used for security purpose
const crypto = require("crypto");
//dependency module that loads environment variables from the .env file
require("dotenv").config();
//Credentials needed to login to Stream account
const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;
//registers the user into my Stream account
const signup = async (req, res) => {
  try {
    const { fullName, username, password, phoneNumber } = req.body;
    //created a random userId for the user creating a new account
    const userId = crypto.randomBytes(16).toString("hex");
    //connects to my Stream account using the api_key, api_secret, and app_id
    const serverClient = connect(api_key, api_secret, app_id);
    //creates a hash password from the password provided by the user
    const hashedPassword = await bcrypt.hash(password, 10);
    //Stream creates a token which uses the random userId created by crypto
    const token = serverClient.createUserToken(userId);
    //if the post request is successful the server responds with the information provided by the user as well as the token created by crypto
    res
      .status(200)
      .json({ token, fullName, username, userId, hashedPassword, phoneNumber });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({ message: error });
  }
};
//Logs the user into my Stream account
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    //connects to my Stream account using the api_key, api_secret, and app_id
    const serverClient = connect(api_key, api_secret, app_id);
    //gives the client full access to the Stream API
    const client = StreamChat.getInstance(api_key, api_secret);
    //searchs for the user attempting to login by matching their username which is their email
    const { users } = await client.queryUsers({ name: username });
    //If the server does not find a user name it responds with a 400 error message
    if (!users.length)
      return res.status(400).json({ message: "User not found" });
    //If the user is found it matches their password with the hash password using bcrypt
    const success = await bcrypt.compare(password, users[0].hashedPassword);
    //Stream creates a token which uses the random userId created by crypto when the user first registered
    const token = serverClient.createUserToken(users[0].id);
    //if the password match is successful the server responds with the users profile within the Stream API
    if (success) {
      res.status(200).json({
        token,
        fullName: users[0].fullName,
        username,
        userId: users[0].id,
        phoneNumber: users[0].phoneNumber,
        avatarURL: users[0].avatarURL,
        hashedPassword: users[0].hashedPassword,
        password: users[0].password,
      });
    } else {
      res.status(500).json({ message: "Incorrect password" });
    }
  } catch (error) {
    ads;
    console.log(error);

    res.status(500).json({ message: error });
  }
};

module.exports = { signup, login };
