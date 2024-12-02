// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Initialize Express App
const app = express();
app.use(bodyParser.json());


// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/contacts", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Schema and Model
const contactSchema = new mongoose.Schema({
  contactId: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  isPrimary: { type: Boolean, required: true },
  primaryContactId: { type: String },
});

const Contact = mongoose.model("Contact", contactSchema);


app.post("/contacts", async (req, res) => {
  try {
    const { contactId, email, phone, isPrimary, primaryContactId } = req.body;

    // Validate data
    if (!contactId || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!isPrimary && !primaryContactId) {
      return res
        .status(400)
        .json({ error: "Secondary contact must have a primaryContactId" });
    }

    const contact = new Contact({ contactId, email, phone, isPrimary, primaryContactId });
    await contact.save();
    res.status(201).json({ message: "Contact created successfully", contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single contact by ID
app.get("/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findOne({ contactId: req.params.id });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a contact
app.put("/contacts/:id", async (req, res) => {
  try {
    const { email, phone, isPrimary, primaryContactId } = req.body;
    const contact = await Contact.findOneAndUpdate(
      { contactId: req.params.id },
      { email, phone, isPrimary, primaryContactId },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json({ message: "Contact updated successfully", contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a contact
app.delete("/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ contactId: req.params.id });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running ");
});