/* App.jsx */
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { FaJava, FaReact, FaHtml5, FaCss3Alt, FaGitAlt, FaAws, FaCodeBranch, FaCopy, FaCheck, FaHackerrank } from 'react-icons/fa';
import { SiSpringboot, SiMysql, SiLeetcode, SiCredly } from 'react-icons/si';
import { FiSun, FiMoon } from 'react-icons/fi';
import { FaLinkedin, FaGithub, FaLightbulb } from 'react-icons/fa6';
import { Chatbot } from './chatbot';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'torch');
    root.classList.add(theme);

    // Handlers update CSS vars for mask position. Support both mouse and touch.
    const handleMouseMove = (e) => {
      root.style.setProperty('--mouse-x', `${e.pageX}px`);
      root.style.setProperty('--mouse-y', `${e.pageY}px`);
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      root.style.setProperty('--mouse-x', `${t.pageX}px`);
      root.style.setProperty('--mouse-y', `${t.pageY}px`);
    };

    if (theme === 'torch') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchstart', handleTouchMove, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

const portfolioData = {
  name: "ABHISHEK SINGH J",
  title: "Aspiring Software Engineer",
  summary: "I build robust and scalable applications with a focus on backend development. Currently deepening my expertise in full-stack solutions and cloud technologies.",
  contact: {
    email: "jitabhsin@gmail.com",
    socials: [
      { name: 'GitHub', url: 'https://github.com/jitabhsin', icon: <FaGithub /> },
      { name: 'LinkedIn', url: 'https://linkedin.com/in/jitabhsin', icon: <FaLinkedin /> },
      { name: 'LeetCode', url: 'https://leetcode.com/u/jitabhsin', icon: <SiLeetcode /> },
      { name: 'HackerRank', url: 'https://www.hackerrank.com/profile/jitabhsin', icon: <FaHackerrank /> },
      {name: 'Credly',url:'https://www.credly.com/users/jitabhsin/badges', icon: <SiCredly /> }             
    ],
  },
  skills: [
    { name: 'Java', icon: <FaJava /> }, { name: 'Spring Boot', icon: <SiSpringboot /> }, { name: 'React', icon: <FaReact /> },
    { name: 'HTML5', icon: <FaHtml5 /> }, { name: 'CSS3', icon: <FaCss3Alt /> }, { name: 'MySQL', icon: <SiMysql /> },
    { name: 'Git', icon: <FaGitAlt /> }, { name: 'AWS', icon: <FaAws /> }, { name: 'DSA', icon: <FaCodeBranch /> },
  ],
  experience: [
    {
      role: "Full Stack Java Intern", company: "Infosys Spring Board", period: "OCT 2024 - JAN 2025",
      points: ["Developed a comprehensive Telecom Web Application, ensuring full functionality and seamless performance.", "Contributed to backend development using Java and Spring, focusing on integration and core features."]
    },
    {
      role: "Big Data Analyst Intern", company: "YBI Foundation", period: "JUN 2024 - JUL 2024",
      points: ["Contributed to the design and management of cloud-based solutions and big data systems.", "Analysed large datasets to identify patterns and improve data processing efficiency."]
    }
  ],
  projects: [
    {
      title: "Online Telecom Bill System",
      description: "A full-stack web application to manage telecom services, billing, and customer data using Java, Spring Boot, and Thymeleaf.",
      tech: ["Java 17", "Spring Boot", "MySQL"],
      url: "https://github.com/jitabhsin/Telecom-webapplication-backend",
    },
    {
      title: "Campus Lost & Found Portal",
      description: "A full-stack portal for posting, matching, and recovering lost items on campus, built with React and Spring Boot.",
      tech: ["React JS", "Spring Boot", "MySQL"],
      url: "https://github.com/jitabhsin/CampusManagement-backend",
    },
  ],
  education: [
    {
      degree: "Bachelor of Engineering, Computer Science",
      institution: "V.S.B. Engineering College, Karur",
      period: "2022 – 2026",
      details: "CGPA: 8.37 (up to 6th semester)",
    },
    {
      degree: "Higher Secondary (HSC)",
      institution: "K.V.S. English Medium School, Virudhunagar",
      period: "2021 – 2022",
      details: "Completed with a focus on science and mathematics.",
    },
    {
      degree: "Secondary School (SSLC)",
      institution: "AAA International School, Virudhunagar",
      period: "2019 – 2020",
      details: "Secured 88% in CBSE Board Examination.",
    },
  ],
};

const useScrollAnimation = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);
  return ref;
};

const AnimatedSection = ({ children, className, id }) => {
  const ref = useScrollAnimation();
  return <section ref={ref} id={id} className={`fade-in-section ${className || ''}`}>{children}</section>;
};

const PortfolioLayout = () => {
  const { theme, setTheme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const portfolioRef = useRef(null);
  const lastMousePosRef = useRef({ clientX: 0, clientY: 0 });
  const isTouchDevice = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    isTouchDevice.current = 'ontouchstart' in window;
    
    if (theme === 'torch') {
      let rafId = null;
      
      const updateTorchPosition = (x, y) => {
        const container = portfolioRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const posX = x - rect.left;
        const posY = y + scrollTop;
        
        // Cancel any pending animation frame
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        // Schedule the update
        rafId = requestAnimationFrame(() => {
          root.style.setProperty('--mouse-x', `${posX}px`);
          root.style.setProperty('--mouse-y', `${posY}px`);
          root.style.setProperty('--torch-transform', 'translate3d(0,0,0)');
          rafId = null;
        });
      };

      const throttledUpdate = (x, y) => {
        if (!rafId) {
          updateTorchPosition(x, y);
        }
      };

      const handleMouseMove = (e) => {
        if (isTouchDevice.current) return;
        throttledUpdate(e.clientX, e.clientY);
      };

      const handleTouchMove = (e) => {
        if (!e.touches[0]) return;
        e.preventDefault();
        const touch = e.touches[0];
        throttledUpdate(touch.clientX, touch.clientY);
      };

      if (isTouchDevice.current) {
        document.addEventListener('touchstart', handleTouchMove, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
      } else {
        document.addEventListener('mousemove', handleMouseMove);
      }

      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        if (isTouchDevice.current) {
          document.removeEventListener('touchstart', handleTouchMove);
          document.removeEventListener('touchmove', handleTouchMove);
        } else {
          document.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }
  }, [theme]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(portfolioData.contact.email);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <div className="theme-switcher">
          <button onClick={() => setTheme('light')} className={theme === 'light' ? 'active' : ''} aria-label="Light Mode"><FiSun /></button>
          <button onClick={() => setTheme('dark')} className={theme === 'dark' ? 'active' : ''} aria-label="Dark Mode"><FiMoon /></button>
          <button onClick={() => setTheme('torch')} className={theme === 'torch' ? 'active' : ''} aria-label="Torch Mode"><FaLightbulb /></button>
      </div>

      <div className="portfolio-container" ref={portfolioRef}>
        <header className="left-pane">
            <div>
                <h1 className="name-title">{portfolioData.name}</h1>
                <h2 className="job-title">{portfolioData.title}</h2>
                <p className="summary">{portfolioData.summary}</p>
                <nav className="page-nav">
                    <a href="#projects">Projects</a>
                    <a href="#experience">Experience</a>
                    <a href="#education">Education</a>
                    <a href="#skills">Skills</a>
                </nav>
                <div className="email-box">
                    <span>{portfolioData.contact.email}</span>
                    <button onClick={handleCopyEmail} aria-label="Copy email">
                        {isCopied ? <FaCheck className="copied-icon" /> : <FaCopy />}
                    </button>
                </div>
            </div>
            <div className="social-links">
                {portfolioData.contact.socials.map(social => (
                    <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                        {social.icon}
                    </a>
                ))}
            </div>
        </header>

        <main className="right-pane">
            <AnimatedSection id="projects">
                <h3 className="section-title">Projects</h3>
                 {portfolioData.projects.map(proj => (
                    <a key={proj.title} href={proj.url} target="_blank" rel="noopener noreferrer" className="project-link">
                      <div className="card project-card">
                          <div className="card-header">
                              <h4>{proj.title}</h4>
                          </div>
                          <p>{proj.description}</p>
                          <div className="tech-tags">
                              {proj.tech.map(t => <span key={t} className="tag">{t}</span>)}
                          </div>
                      </div>
                    </a>
                ))}
            </AnimatedSection>

            <AnimatedSection id="experience">
                <h3 className="section-title">Experience</h3>
                {portfolioData.experience.map(exp => (
                    <div key={exp.company} className="card experience-card">
                        <div className="card-header">
                            <h4>{exp.role} · {exp.company}</h4>
                            <p>{exp.period}</p>
                        </div>
                        <ul>{exp.points.map((point, i) => <li key={i}>{point}</li>)}</ul>
                    </div>
                ))}
            </AnimatedSection>

            <AnimatedSection id="education">
                <h3 className="section-title">Education</h3>
                {portfolioData.education.map(edu => (
                    <div key={edu.institution} className="card education-card">
                        <div className="card-header">
                            <h4>{edu.degree}</h4>
                            <p>{edu.period}</p>
                        </div>
                        <p className="education-institution">{edu.institution}</p>
                        <p className="education-details">{edu.details}</p>
                    </div>
                ))}
            </AnimatedSection>
            
            <AnimatedSection id="skills" className="skills-section">
                <h3 className="section-title">Skills</h3>
                <div className="skills-grid">
                  {portfolioData.skills.map(skill => (
                    <div key={skill.name} className="skill-item">
                       {skill.icon} <span>{skill.name}</span>
                    </div>
                  ))}
                </div>
            </AnimatedSection>
            <footer className="main-footer">
               <p>Built with React & Vite. Inspired by designs across the web.</p>
            </footer>
        </main>
      </div>
      <Chatbot portfolioData={portfolioData} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PortfolioLayout />
    </ThemeProvider>
  );
}