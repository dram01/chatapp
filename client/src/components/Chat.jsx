import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("https://chatapp-production-baa8.up.railway.app");
const ROOMS = ["мафія", "ташуля", "гамно", "жопа", "ойой"];

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState("мафія");

  useEffect(() => {
    axios.get(`https://chatapp-production-baa8.up.railway.app/messages?room=${currentRoom}`)
      .then((res) => setMessages(res.data));
    socket.emit("join_room", currentRoom);
    socket.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );
    return () => socket.off("receive_message");
  }, [currentRoom]);

  const switchRoom = (room) => {
    socket.emit("leave_room", currentRoom);
    setMessages([]);
    setCurrentRoom(room);
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

  const  formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 200, background: "#2f3136", color: "white", padding: 16, flexShrink: 0 }}>
        <h3 style={{ marginBottom: 8 }}>👤 {user.username}</h3>
        <hr style={{ borderColor: "#555", marginBottom: 16 }} />
        <p style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>ROOMS</p>
        {ROOMS.map((room) => (
          <div
            key={room}
            onClick={() => switchRoom(room)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              marginBottom: 4,
              background: currentRoom === room ? "#5865f2" : "transparent",
              color: currentRoom === room ? "white" : "#aaa",
            }}
          >
            # {room}
          </div>
        ))}
      </div>

      {/* права частинка чатику */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ccc", fontWeight: "bold", fontSize: 18, flexShrink: 0 }}>
          # {currentRoom}
        </div>

        {/* повідомленнячка */}
        <div style={{ flex: 1, overflowY: "scroll", padding: 20 }}>
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

        {/* даточка */}
        {showDateSeparator && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "20px 0 12px",
          }}>
            <div style={{ flex: 1, height: 1, background: "#ddd" }} />
            <span style={{
              fontSize: 12,
              color: "#aaa",
              background: "white",
              padding: "2px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              whiteSpace: "nowrap",
            }}>
              {formatDateLabel(m.created_at)}
            </span>
            <div style={{ flex: 1, height: 1, background: "#ddd" }} />
          </div>
        )}

        {/* булька повідомленнь */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isMe ? "flex-end" : "flex-start",
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>
            {!isMe && <span style={{ marginRight: 6 }}>{m.username}</span>}
            {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ""}
          </div>
          <div style={{
            background: isMe ? "#5865f2" : "#e9e9e9",
            color: isMe ? "white" : "black",
            padding: "8px 14px",
            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            maxWidth: "70%",
            wordBreak: "break-word",
          }}>
            {m.content}
          </div>
        </div>

      </div>
    );
  })}
</div>

        {/* Input bar */}
        <div style={{ padding: 16, borderTop: "1px solid #ccc", display: "flex", gap: 8, flexShrink: 0 }}>
          <input
            style={{ flex: 1, padding: "10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Message #${currentRoom}`}
          />
          <button
            onClick={sendMessage}
            style={{ padding: "10px 20px", borderRadius: 6, background: "#5865f2", color: "white", border: "none", cursor: "pointer" }}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}