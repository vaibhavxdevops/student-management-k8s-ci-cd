require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, init } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

const origins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
app.use(cors({ origin: origins }));
app.use(express.json());

// Health check (used later by Kubernetes probes)
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

// List students
app.get("/api/students", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load students" });
  }
});

// Add student
app.post("/api/students", async (req, res) => {
  const { name, email, course, age } = req.body;
  if (!name || !email || !course) {
    return res.status(400).json({ error: "name, email and course are required" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO students (name, email, course, age) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, course, age || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A student with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not add student" });
  }
});

// Update student
app.put("/api/students/:id", async (req, res) => {
  const { name, email, course, age } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE students SET name=$1, email=$2, course=$3, age=$4 WHERE id=$5 RETURNING *",
      [name, email, course, age || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A student with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not update student" });
  }
});

// Delete student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM students WHERE id=$1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete student" });
  }
});

init()
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch((err) => {
    console.error("Database connection failed:", err.code, err.message, err.errors || err);
    process.exit(1);
  });
