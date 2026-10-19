import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

const QUICK_EMOJIS = ['👋', '👍', '❤️', '😊', '🔥', '🎉', '🚀', '🙌'];

export const MessageInput = ({ onSendMessage, isSending }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSending) return;
    onSendMessage(text);
    setText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="message-input-area">
      {showEmojiPicker && (
        <div className="emoji-quick-bar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="quick-emoji-btn"
              onClick={() => addEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="message-form" onSubmit={handleSubmit}>
        <button
          type="button"
          className="input-tool-btn"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          title="Add Emoji"
        >
          <Smile size={20} />
        </button>

        <button
          type="button"
          className="input-tool-btn"
          title="Attachments coming in V2"
          disabled
        >
          <Paperclip size={19} />
        </button>

        <div className="message-text-wrapper">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={5000}
          />
        </div>

        <button
          type="submit"
          className={`btn-send ${text.trim() ? 'active' : ''}`}
          disabled={!text.trim() || isSending}
          title="Send Message (Enter)"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
