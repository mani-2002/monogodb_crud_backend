const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const port = 5000;
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//connection url
const url = "mongodb://127.0.0.1:27017";

//database name
const dbName = "bookstore";

//function to connect to database
async function connectDB() {
  const client = await MongoClient.connect(url);
  return client.db(dbName);
}

//route to fetch books from database
app.get("/api/books", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("books");
    const books = await collection.find().toArray();
    res.json(books);
  } catch (error) {
    console.error("Error while fetching books from the database", error);
    res.status(500).json({ error: "internal server error" });
  }
});

//route to add a book
app.post("/api/books", async (req, res) => {
  try {
    const { bookName, authorName } = req.body;
    if (!bookName || !authorName) {
      res.status(400).json({ error: "book name and author name are required" });
    }
    const db = await connectDB();
    const collection = db.collection("books");
    const result = await collection.insertOne({ bookName, authorName });
    res
      .status(201)
      .json({ message: "book added succefully", bookId: result.insertedId });
  } catch (error) {
    console.error("Error occured while adding book", error);
    res.status(500).json({ error: "internal server error" });
  }
});

//route to delete a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("books");
    const { id } = req.params;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ message: "book deleted successfully" });
    } else {
      res.status(404).json({ error: "book not found" });
    }
  } catch (error) {
    console.error("error occured while deleting the book", error);
    res.status(500).json("internal server error");
  }
});

// Route to update a book's name and author
app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Valid book ID is required" });
    }

    const { bookName, authorName } = req.body;
    if (!bookName && !authorName) {
      return res
        .status(400)
        .json({ error: "Book name or author name is required" });
    }

    const updateFields = {};
    if (bookName) {
      updateFields.bookName = bookName;
    }
    if (authorName) {
      updateFields.authorName = authorName;
    }

    const db = await connectDB();
    const collection = db.collection("books");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 1) {
      res.json({ message: "Book updated successfully" });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
