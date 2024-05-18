const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;

const uri =
  "mongodb+srv://dominikabrylaa:qxiyxSyYCNPdFaAU@myapppwa.11a24n3.mongodb.net/?retryWrites=true&w=majority&appName=myAppPWA";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    serverSelectionTimeoutMS: 60000 ,
  },
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("myapppwa");
    const usersCollection = db.collection("users");

    app.use(express.json());

    app.get("/api/users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
      } catch (error) {
        console.error("Błąd podczas pobierania użytkowników:", error);
        res
          .status(500)
          .json({ message: "Wystąpił błąd podczas pobierania użytkowników." });
      }
    });

    app.post("/api/users", async (req, res) => {
      const { username, password } = req.body;

      try {
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: "Użytkownik już istnieje." });
        }

        const newUser = { username, password };
        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "Utworzono nowego użytkownika." });
      } catch (error) {
        console.error("Błąd podczas tworzenia użytkownika:", error);
        res
          .status(500)
          .json({ message: "Wystąpił błąd podczas tworzenia użytkownika." });
      }
    });

    app.listen(PORT, () => {
      console.log(`Serwer nasłuchuje na porcie ${PORT}.`);
    });
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

module.exports.handler = serverless(app);
