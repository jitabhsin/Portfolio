import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import { FaRobot, FaUser } from 'react-icons/fa'; // Added FaUser for avatar

export const Chatbot = ({ portfolioData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    content: `Hello! I'm an AI assistant with information about ${portfolioData.name}. How can I help you?`
                }
            ]);
        }
    }, [isOpen, portfolioData.name, messages.length]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = {
                role: 'system',
                content: `You are a helpful portfolio assistant for Abhishek Singh J. Use this JSON data to answer questions about him: ${JSON.stringify(portfolioData)}`
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-7b-instruct:free',
                    messages: [systemPrompt, ...newMessages],
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message;
            setMessages(prevMessages => [...prevMessages, assistantMessage]);

        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage = { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again.' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button className="chat-fab" onClick={() => setIsOpen(true)} aria-label="Open Chatbot">
                <FaRobot />
            </button>

            <div className={`chat-window ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <h3>AI Assistant</h3>
                    <button onClick={() => setIsOpen(false)} aria-label="Close Chatbot"><FiX /></button>
                </div>
                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="avatar">
                                {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                            </div>
                            <p>{msg.content}</p>
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
                        placeholder="Ask about my portfolio..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} aria-label="Send Message"><FiSend /></button>
                </form>
            </div>
        </>
    );
};