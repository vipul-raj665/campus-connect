import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles.css";

/* ---------- AUTH ---------- */
const AuthScreen = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await axios.post("http://localhost:5000/api/auth/login", form);
      } else {
        await axios.post("http://localhost:5000/api/auth/signup", form);
      }

      localStorage.setItem("user", form.email);
      setUser(form.email);
    } catch {
      alert("Error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Campus Connect 🚀</h1>
        <h2>{isLogin ? "Login" : "Signup"}</h2>

        {!isLogin && (
          <input placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input type="password" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn" onClick={handleSubmit}>
          {isLogin ? "Login" : "Signup"}
        </button>

        <p className="auth-switch" onClick={() => setIsLogin(!isLogin)}>
          Switch to {isLogin ? "Signup" : "Login"}
        </p>
      </div>
    </div>
  );
};

/* ---------- LAYOUT ---------- */
const Layout = ({ children, setUser }) => {
  return (
    <div className="layout">
      <div className="sidebar">
        <h2>Campus</h2>

        <Link to="/">Feed</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/events">Events</Link>
        <Link to="/profile">Profile</Link>

        <button className="btn" onClick={() => {
          localStorage.removeItem("user");
          setUser(null);
        }}>
          Logout
        </button>
      </div>

      <div className="main">
        <div className="header">
          <h3>Campus Connect 🚀</h3>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ---------- FEED ---------- */
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");

  const user = localStorage.getItem("user");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const res = await axios.get("http://localhost:5000/api/posts");
    setPosts(res.data);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 2 * 1024 * 1024) {
      alert("Max 2MB image allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);

    if (file) reader.readAsDataURL(file);
  };

  const post = async () => {
    await axios.post("http://localhost:5000/api/posts", {
      user,
      content: text,
      image
    });

    setText("");
    setImage("");
    loadPosts();
  };

  return (
    <div>
      <h2>Feed</h2>

      <div className="card">
        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input type="file" onChange={handleImage} />

        {image && <img src={image} style={{ width: "100%" }} />}

        <button className="btn" onClick={post}>Post</button>
      </div>

      {posts.map((p) => (
        <div key={p._id} className="card">
          <h4>{p.user}</h4>
          <p>{p.content}</p>
          {p.image && <img src={p.image} style={{ width: "100%" }} />}
        </div>
      ))}
    </div>
  );
};

/* ---------- MESSAGES (FIXED) ---------- */
const Messages = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const currentUser = localStorage.getItem("user");

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/users")
      .then(res => setUsers(res.data.filter(u => u.email !== currentUser)));
  }, []);

  const loadMessages = async (email) => {
    setSelectedUser(email);

    const res = await axios.get(
      `http://localhost:5000/api/messages/${currentUser}/${email}`
    );

    setMessages(res.data);
  };

  const send = async () => {
    if (!text.trim()) return;

    await axios.post("http://localhost:5000/api/messages", {
      sender: currentUser,
      receiver: selectedUser,
      text
    });

    setText("");
    loadMessages(selectedUser);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>

      {/* USERS */}
      <div style={{ width: "250px" }}>
        <h3>Users</h3>

        {users.map(u => (
          <div
            key={u.email}
            className="card"
            onClick={() => loadMessages(u.email)}
          >
            <strong>{u.name}</strong>
            <br />
            <small>{u.email}</small>
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <h3>{selectedUser ? selectedUser : "Select a user"}</h3>

        <div className="card chat-box">
          {messages.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={m.sender === currentUser ? "chat-msg sent" : "chat-msg received"}
              >
                {m.text}
              </div>
            ))
          )}
        </div>

        {/* ✅ FIXED INPUT */}
        {selectedUser && (
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
            />
            <button className="btn" onClick={send}>
              Send
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

/* ---------- EVENTS ---------- */
const Events = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "" });

  useEffect(() => {
    axios.get("http://localhost:5000/api/events").then(res => setEvents(res.data));
  }, []);

  const create = async () => {
    await axios.post("http://localhost:5000/api/events", form);
    setForm({ title: "", description: "", date: "" });

    const res = await axios.get("http://localhost:5000/api/events");
    setEvents(res.data);
  };

  return (
    <div>
      <h2>Events</h2>

      <div className="card">
        <input placeholder="Title" onChange={(e)=>setForm({...form,title:e.target.value})}/>
        <input placeholder="Description" onChange={(e)=>setForm({...form,description:e.target.value})}/>
        <input type="date" onChange={(e)=>setForm({...form,date:e.target.value})}/>
        <button className="btn" onClick={create}>Create Event</button>
      </div>

      {events.map(e => (
        <div key={e._id} className="card">
          <h4>{e.title}</h4>
          <p>{e.description}</p>
          <p>{e.date}</p>
        </div>
      ))}
    </div>
  );
};

/* ---------- PROFILE ---------- */
const Profile = () => {
  const user = localStorage.getItem("user");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 2 * 1024 * 1024) {
      alert("Max 2MB image allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);

    if (file) reader.readAsDataURL(file);
  };

  const save = async () => {
    await axios.post("http://localhost:5000/api/auth/update-profile", {
      email: user,
      bio,
      avatar
    });

    alert("Saved");
  };

  return (
    <div>
      <h2>Profile</h2>

      <div className="card">
        {avatar && <img src={avatar} style={{ width: "100px", borderRadius: "50%" }} />}
        <input type="file" onChange={handleImage} />
        <textarea
          placeholder="Write about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button className="btn" onClick={save}>Save</button>
      </div>
    </div>
  );
};

/* ---------- MAIN ---------- */
function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));

  if (!user) return <AuthScreen setUser={setUser} />;

  return (
    <Router>
      <Layout setUser={setUser}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;