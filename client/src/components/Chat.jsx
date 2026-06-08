import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("https://chatapp-production-baa8.up.railway.app");


export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState("мафія");
  const [sidebarOpen, setSidebarOpen] = useState(false); // visibility
  

  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([
     "мафія",
     "ташуля",
     "гамно",
     "жопа",
     "ойой"
  ]); 

  useEffect(() => {
  axios
    .get("https://chatapp-production-baa8.up.railway.app/users")
    .then((res) => {
      console.log("USERS:", res.data);
      setUsers(res.data);
    })
    .catch((err) => console.error("USER ERROR:", err));
  }, []);;

  const switchRoom = (room) => {
    socket.emit("leave_room", currentRoom);
    setMessages([]);
    setCurrentRoom(room);
    setSidebarOpen(false); // ← closing of the sidebar after picking a room
  };

  const createPrivatChat  = (selectedUser) => {
    const roomName = [user.id, selectedUser.id] 
      .sort((a, b) => a - b)
      .join("_");
      if (!rooms.includes(roomName)) {
        setRooms((prev) => [...prev, roomName]);
      }

      switchRoom(roomName);
      setShowUsers(false);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      userId: user.id,
      username: user.username,
      content: input,
      room: currentRoom,
    });
    setInput("");
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", overflow: "hidden", position: "relative" }}>

      {/* Dark overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 10,
          }}
        />
      )}

      {/* Sidebar */}
<div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 220,
    background: "#2f3136",
    color: "white",
    padding: 16,
    flexShrink: 0,
    zIndex: 20,
    transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease",
  }}
>
  <h3 style={{ marginBottom: 8 }}>👤 {user.username}</h3>

  {/* New Chat Button */}
  <button
    onClick={() => setShowUsers(!showUsers)}
    style={{
      width: "100%",
      padding: "8px",
      marginBottom: "12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      background: "#5865f2",
      color: "white",
    }}
  >
    ➕ New Chat
  </button>

  {/* Logout Button */}
  <button
    onClick={onLogout}
    style={{
      background: "transparent",
      border: "1px solid #555",
      color: "#aaa",
      borderRadius: 6,
      padding: "4px 10px",
      cursor: "pointer",
      fontSize: 12,
      marginBottom: 12,
      width: "100%",
    }}
  >
    Log out
  </button>

  <hr style={{ borderColor: "#555", marginBottom: 16 }} />

  {/* Registered users */}
  {showUsers && (
    <div style={{ marginBottom: 16 }}>
      <p style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>
        Users
      </p>

      {users
        .filter((u) => u.id !== user.id)
        .map((u) => (
          <div
            key={u.id}
            onClick={() => createPrivateChat(u)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              marginBottom: 4,
              background: "#40444b",
            }}
          >
            👤 {u.username}
          </div>
        ))}
    </div>
  )}

  <p style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>
    кімнатки
  </p>

  {rooms.map((room) => (
    <div
      key={room}
      onClick={() => switchRoom(room)}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        cursor: "pointer",
        marginBottom: 4,
        background:
          currentRoom === room ? "#5865f2" : "transparent",
        color:
          currentRoom === room ? "white" : "#aaa",
      }}
    >
      # {room}
    </div>
  ))}
</div>

      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%" }}>

        {/* Header with button */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}>
          {/* Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ☰
          </button>
          <span style={{ fontWeight: "bold", fontSize: 18 }}># {currentRoom}</span>
        </div>

        {/* Messages zone */}
        <div style={{ flex: 1, overflowY: "scroll", padding: 16 }}>
          {messages.length === 0 && (
            <p style={{ color: "#aaa" }}>поки крінжі нема... ТРЕБА ВИПРАВЛЯТИ!!!</p>
          )}
          {messages.map((m, i) => {
            const isMe = m.username === user.username;
            const currentDate = m.created_at ? new Date(m.created_at).toDateString() : null;
            const prevDate = i > 0 && messages[i - 1].created_at
              ? new Date(messages[i - 1].created_at).toDateString()
              : null;
            const showDateSeparator = currentDate && currentDate !== prevDate;

            return (
              <div key={i}>

                {/* Date */}
                {showDateSeparator && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 12px" }}>
                    <div style={{ flex: 1, height: 1, background: "#09b097" }} />
                    <span style={{
                      fontSize: 12, color: "#aaa", background: "white",
                      padding: "2px 10px", borderRadius: 10, border: "1px solid #ddd", whiteSpace: "nowrap",
                    }}>
                      {formatDateLabel(m.created_at)}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#ddd" }} />
                  </div>
                )}

                {/* Message */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, color: "#bdff17", marginBottom: 3 }}>
                      {m.username}
                    </div>
                  )}
                  <div style={{
                    background: isMe ? "#d8f30c" : "#2715e5",
                    color: isMe ? "white" : "black",
                    padding: "8px 14px",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    maxWidth: "75%",
                    wordBreak: "break-word",
                  }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ""}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* My input field */}
        <div style={{ padding: 12, borderTop: "1px solid #ccc", display: "flex", gap: 8, flexShrink: 0 }}>
          <input
            style={{ flex: 1, padding: "10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Message #${currentRoom}`}
          />
          <button
            onClick={sendMessage}
            style={{ padding: "10px 16px", borderRadius: 6, background: "#5865f2", color: "white", border: "none", cursor: "pointer", fontSize: 14 }}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}