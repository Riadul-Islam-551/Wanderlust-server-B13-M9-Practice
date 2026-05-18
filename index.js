// google dns server
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGO_URI;
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("wonderlust");
    const destinationCollection = db.collection("destinations");

    // load all the destination data
    app.get("/destinations", async (req, res) => {
      const result = await destinationCollection.find().toArray();

      res.json(result);
    });

    // insert destination data in destinationCollection
    app.post("/destinations", async (req, res) => {
      const destinationData = req.body;
      console.log(destinationData);
      const result = await destinationCollection.insertOne(destinationData);

      res.json(result);
    });

    // load single destination
    app.get(`/destinations/:id`, async (req, res) => {
      const { id } = req.params;

      const result = await destinationCollection.findOne({
        _id: new ObjectId(id),
      });

      res.json(result);
    });

    // update destination data
    app.patch(`/destinations/:id`, async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const result = await destinationCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );

      res.json(result);
    });

    // delete destination data
    app.delete(`/destinations/:id`, async (req, res) => {
      const { id } = req.params;
      const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) });

      res.json(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Wander last");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
