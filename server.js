const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Use express.json() to parse JSON bodies

const port = process.env.PORT || 8000;

// MongoDB connection URI
const uri =
  "mongodb+srv://dominikabrylaa:qxiyxSyYCNPdFaAU@myapppwa.11a24n3.mongodb.net/userAuthDB?retryWrites=true&w=majority";
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
    console.log("Połączono z bazą danych MongoDB!");
  } catch (err) {
    console.error("Błąd połączenia z MongoDB:", err);
  }
}
connectToDatabase();

// Function to create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const database = client.db("userAuthDB");
    const collection = database.collection("users");

    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const newUser = {
      username: username,
      password: password, // Plain text password
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

// Function to get all users
app.get("/api/users", async (req, res) => {
  try {
    const database = client.db("userAuthDB");
    const collection = database.collection("users");

    const users = await collection.find({}).toArray();

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Serwer nasłuchuje na porcie ${port}.`);
});
