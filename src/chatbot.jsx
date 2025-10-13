/* Chatbot.jsx */
import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import { FaRobot, FaUser } from 'react-icons/fa';

export const Chatbot = ({ portfolioData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Ask me anything related to Abhishek Singh and his portfolio!`
        }
      ]);
    }
  }, [isOpen, portfolioData, messages.length]);

  const formatContent = (text) => {
    if (!text) return [];
    return text
      .split(/\n|(?<=\d\.)\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const lowerInput = input.toLowerCase();

      if (
        lowerInput.includes('who made you') ||
        lowerInput.includes('who developed you') ||
        lowerInput.includes('whose model') ||
        lowerInput.includes('your creator') ||
        lowerInput.includes('who built you') ||
        lowerInput.includes('what model are you')
      ) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Developed by Abhishek Singh for his portfolio.` }
        ]);
        setIsLoading(false);
        return;
      }

      const systemPrompt = {
        role: 'system',
        content: `You are a professional AI portfolio assistant for Abhishek Singh.
Answer questions using this JSON data: ${JSON.stringify(portfolioData)}.
Always respond clearly and neatly — use line breaks, bullet points for lists, no asterisks, no markdown, no emojis unless contextually relevant.`
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [systemPrompt, ...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();

      if (!data.choices || !data.choices[0]?.message) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Free API credits are temporarily exhausted. Please try again later.`
          }
        ]);
        setIsLoading(false);
        return;
      }

      const assistantReply = data.choices[0].message;
      const cleanContent = assistantReply.content.replace(/\*/g, '').trim();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: cleanContent }
      ]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, there was an issue connecting to the AI service. Please retry in a few seconds.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="chat-fab" 
        onClick={() => setIsOpen(!isOpen)} 
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        <FaRobot />
      </button>

      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>AI Assistant</h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close Chatbot">
            <FiX />
          </button>
        </div>

        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? <FaUser /> : <FaRobot />}
              </div>
              <div className="message-content">
                {msg.role === 'user' ? (
                  // For user messages, display content plainly without bullets.
                  <p>{msg.content}</p>
                ) : (
                  // For assistant messages, apply the list formatting.
                  formatContent(msg.content).map((line, idx) => (
                    <p key={idx} style={{ margin: '4px 0' }}>
                      {/* Add a bullet if the line isn't already a list item */}
                      {line.startsWith('-') || line.startsWith('•') ? line : `• ${line}`}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="avatar"><FaRobot /></div>
              <p className="loading-dots"><span>.</span><span>.</span><span>.</span></p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Abhishek Singh..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} aria-label="Send Message">
            <FiSend />
          </button>
        </form>
      </div>

      <style jsx>{`
        .message-content p {
          white-space: pre-wrap; /* preserves spaces and line breaks */
          margin: 0;
        }
        .message.user .message-content p {
            margin: 4px 0;
        }
      `}</style>
    </>
  );
};