const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

// MongoDB connection URI
const uri =
  "mongodb+srv://dominikabrylaa:qxiyxSyYCNPdFaAU@myapppwa.11a24n3.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}
connectToDatabase();

app.post("/api/users", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const database = client.db("sample_mflix");
    const collection = database.collection("users");

    const newUser = {
      username: username,
      email: `${username}@example.com`,
      password: hashedPassword,
    };

    const result = await collection.insertOne(newUser);

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const database = client.db("sample_mflix");
    const collection = database.collection("users");

    const users = await collection.find({}).toArray();

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
