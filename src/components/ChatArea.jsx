import React, { useState, useEffect, useRef } from 'react';

export default function ChatArea({ activeChannel, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!activeChannel) return;
    fetchMessages();
    const timer = setInterval(fetchMessages, 2000);
    return () => clearInterval(timer);
  }, [activeChannel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/channels/${activeChannel.id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    const body = new FormData();
    body.append('channel_id', activeChannel.id);
    body.append('user_id', user.id);
    body.append('sender_name', user.name);
    body.append('content', text);
    if (file) body.append('file', file);

     await fetch('/api/messages', {
      method: 'POST',
      body
    });

    setText('');
    setFile(null);
    fetchMessages();
  };

  if (!activeChannel) return <div className="empty-view">Select a channel to start messaging.</div>;

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h3># {activeChannel.name}</h3>
        <p>{activeChannel.description}</p>
      </div>

      <div className="chat-body">
        {messages.map((m) => (
          <div key={m.id} className="message-item">
            <div className="msg-avatar">{m.sender_name.charAt(0).toUpperCase()}</div>
            <div className="msg-info">
              <div className="msg-meta">
                <strong>{m.sender_name}</strong>
                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {m.content && <p>{m.content}</p>}
              {m.file_url && (
                <div className="file-attachment">
                  {m.file_name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img src={m.file_url} alt="attachment" className="chat-img-preview" />
                  ) : (
                    <a href={m.file_url} target="_blank" rel="noreferrer">
                      📎 Download {m.file_name}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          placeholder={`Message #${activeChannel.name}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <label className="file-label">
          📎
          <input type="file" onChange={(e) => setFile(e.target.files[0])} hidden />
        </label>
        {file && <span className="selected-file-tag">{file.name}</span>}
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </div>
  );
}