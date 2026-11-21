import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EMPTY = { name: "", email: "", course: "", age: "" };

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch(`${API}/api/students`);
      if (!res.ok) throw new Error();
      setStudents(await res.json());
      setError("");
    } catch {
      setError("Can't reach the server. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const url = editingId ? `${API}/api/students/${editingId}` : `${API}/api/students`;
    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setForm({ name: s.name, email: s.email, course: s.course, age: s.age ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function remove(id) {
    if (!window.confirm("Delete this student?")) return;
    await fetch(`${API}/api/students/${id}`, { method: "DELETE" });
    load();
  }

  const shown = students.filter((s) =>
    [s.name, s.email, s.course].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="page">
      <header className="head">
        <h1>Student register</h1>
        <p className="count">{students.length} enrolled</p>
      </header>

      {error && <div className="error" role="alert">{error}</div>}

      <form className="form" onSubmit={onSubmit}>
        <h2>{editingId ? "Edit student" : "Add a student"}</h2>
        <div className="fields">
          <label>
            Full name is this
            <input name="name" value={form.name} onChange={onChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
          <label>
            Course
            <input name="course" value={form.course} onChange={onChange} required />
          </label>
          <label>
            Age
            <input name="age" type="number" min="1" value={form.age} onChange={onChange} />
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            {editingId ? "Save changes" : "Add student"}
          </button>
          {editingId && (
            <button type="button" className="ghost" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="list">
        <div className="list-head">
          <h2>Students</h2>
          <input
            className="search"
            placeholder="Search name, email or course"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search students"
          />
        </div>

        {loading ? (
          <p className="empty">Loading students…</p>
        ) : shown.length === 0 ? (
          <p className="empty">
            {students.length === 0
              ? "No students yet. Add the first one using the form above."
              : "No students match your search."}
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Age</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.course}</td>
                    <td>{s.age ?? "–"}</td>
                    <td className="row-actions">
                      <button className="link" onClick={() => startEdit(s)}>Edit</button>
                      <button className="link danger" onClick={() => remove(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
