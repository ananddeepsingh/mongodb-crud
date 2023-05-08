const express = require('express');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

// init app & middleware
const app = express();
app.use(express.json());

// db connection
let db;
const PORT = 3000;
connectToDb((err) => {
  if (!err) {
    app.listen((PORT), () => {
      console.log(`server started on port ${PORT}`);
    });
    db = getDb();
  }
})


// routes

// get all books
app.get('/books', (req, res) => {
  const books = [];
  const page = req.query.page || 0;
  const booksPerPage = req.query.perPage || 2;


  db.collection('books')
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books)
    })
    .catch((err) => {
      res.status(500).json({ error: 'Could not fetch the documents' })
    })
});

// get single book
app.get('/books/:id', (req, res) => {
  const id = req.params.id

  if (ObjectId.isValid(id)) {
    db.collection('books')
      .findOne({ _id: new ObjectId(id) })
      .then(doc => {
        res.status(200).json(doc)
      })
      .catch((err) => {
        res.status(500).json({ error: 'Book not found' })
      })
  } else {
    res.status(500).json({ error: 'Not valid document id' })
  }
})

// Add new book
app.post('/book', async (req, res) => {
  const newBook = req.body;

  try {
    const result = await db.collection('books').insertOne(newBook);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: 'Could not post new object.' });
  }
});

// delete a book
app.delete('/book/:id', async (req, res) => {

  const id = req.params.id
  const isIdExists = await db.collection('books').countDocuments({ _id: new ObjectId(id) }) === 0 ? false : true;

  if (ObjectId.isValid(id) && isIdExists) {
    try {
      await db.collection('books').deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ success: `Record deleted successfully` })
    } catch (err) {
      res.status(500).json({ error: 'Could not delete record' });
    }
  } else {
    res.status(500).json({ error: 'Not valid document id' })
  }
})

app.patch('/book/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const isIdExists = await db.collection('books').countDocuments({ _id: new ObjectId(id) }) === 0 ? false : true;

  if (ObjectId.isValid(id) && isIdExists) {
    try {
      const result = await db.collection('books').updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
      res.status(200).json(result)
    } catch (err) {
      res.status(500).json({ error: 'Could not update the record' });
    }
  } else {
    res.status(500).json({ error: 'Not valid document id' })
  }
})
