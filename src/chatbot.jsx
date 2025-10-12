import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';

const CHATBOT_MODEL = "mistralai/mistral-7b-instruct:free";

const createSystemPrompt = (portfolioData) => {
  const skillsList = portfolioData.skills.map(skill => skill.name).join(', ');
  return `
You are an AI assistant embedded in Abhishek Singh J.'s portfolio website.
Your purpose is to answer questions about his professional background truthfully and professionally.

Use only the details provided below. Do not fabricate information.
If the user asks something unrelated to his career, respond politely and redirect them to his professional expertise.

-------------------------------
📄 ABHISHEK’S PORTFOLIO DATA
-------------------------------
Name: ${portfolioData.name}
Title: ${portfolioData.title}
Summary: ${portfolioData.summary}

Contact:
- Email: ${portfolioData.contact.email}
- GitHub: ${portfolioData.contact.socials.find(s => s.name === 'GitHub').url}
- LinkedIn: ${portfolioData.contact.socials.find(s => s.name === 'LinkedIn').url}
- LeetCode: ${portfolioData.contact.socials.find(s => s.name === 'LeetCode').url}
- HackerRank: ${portfolioData.contact.socials.find(s => s.name === 'HackerRank').url}

Skills: ${skillsList}, including React and Spring Boot as major competencies.

Experience:
${portfolioData.experience.map(
    exp => `• ${exp.role} at ${exp.company} (${exp.period})
      - ${exp.points.join('\n      - ')}`
  ).join('\n')}

Projects:
${portfolioData.projects.map(
    proj => `• ${proj.title}: ${proj.description}`
  ).join('\n')}

Education:
${portfolioData.education.map(
    edu => `• ${edu.degree} — ${edu.institution} (${edu.period})
      - ${edu.details}`
  ).join('\n')}

-------------------------------
💡 RESPONSE STYLE
-------------------------------
- Be concise yet engaging.
- Maintain a professional, human-like tone.
- Use plain, confident language.
- Respond naturally in full sentences.
  `;
};

export const Chatbot = ({ portfolioData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hello! I'm Abhishek's AI assistant. Curious about his projects, certifications, or skills? Just ask!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const systemPrompt = createSystemPrompt(portfolioData);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      // Send request to our serverless proxy which holds the real API key
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: CHATBOT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.slice(-6)
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "⚠️ Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>AI Assistant</h3>
          <button onClick={() => setIsOpen(false)}><FaTimes /></button>
        </div>
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && <div className="avatar"><SiOpenai /></div>}
              <p>{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="avatar"><SiOpenai /></div>
              <p className="loading-dots"><span>.</span><span>.</span><span>.</span></p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about my projects..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
      <button className="chat-fab" onClick={() => setIsOpen(true)}>
        <FaCommentDots />
      </button>
    </>
  );
};
