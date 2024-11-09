const Groq = require("groq-sdk");
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const CancerData = require("./models/upload.js");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const https = require("https");
const API_KEY = process.env.PDF_API_KEY;
const predict = require("./AI/testModel.js");

const cloudinary = require("cloudinary").v2;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const flash = require("connect-flash");

const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });
const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (error) => {
  console.log("Error in MONGO SESSION STORE: ", error);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connection Succeeded");
  })
  .catch((err) => console.log(err));

app.use(session(sessionOptions));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("public/media/", express.static("./public/media"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.json());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();


async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connection Succeeded");
  })
  .catch((err) => console.log(err));

app.use(session(sessionOptions));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("public/media/", express.static("./public/media"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.json());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

let port = 3000;

app.listen(port, (req, res) => {
  console.log("Listening to the Port: http://localhost:3000/scan");
});

app.get("/scan", (req, res) => {
  res.render("index.ejs");
});

async function reportAnalysis(report) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Predicts the type of cancer based on the provided data. The report includes ${report}; however, for an accurate diagnosis and further evaluation, consultation with a medical professional is essential. Summarize the report in three key bullet points.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
