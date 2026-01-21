import VideoLectureGenerator from "@/components/VideoLectureGenerator";

export default function Home() {
  return (
    <div className="app-container">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="grid-lines" />
      </div>

      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="2" />
              <path
                d="M14 12L28 20L14 28V12Z"
                fill="url(#logoGradient)"
              />
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#58c4dd" />
                  <stop offset="1" stopColor="#5cd0b3" />
                </linearGradient>
              </defs>
            </svg>
            <span>InterAI</span>
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>
              Generate <span className="gradient-text">AI-Powered</span>
              <br />Video Lectures
            </h1>
            <p className="hero-subtitle">
              Create beautiful, animated educational videos in the style of 3Blue1Brown.
              <br />
              Powered by Gemini AI with browser-based rendering.
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section className="generator-section">
          <VideoLectureGenerator />
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <h2>Why InterAI?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>AI-Generated Scripts</h3>
              <p>Gemini AI creates engaging, educational content tailored to your topic.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3>3Blue1Brown Style</h3>
              <p>Elegant animations with mathematical precision and visual storytelling.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3>Voice Narration</h3>
              <p>Browser text-to-speech synced perfectly with animations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3>Export to Video</h3>
              <p>Download your lectures as high-quality video files.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Enter Your Topic</h3>
                <p>Type any educational topic you want to explain.</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Generates Script</h3>
                <p>Gemini creates scenes, animations, and narration.</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Preview & Record</h3>
                <p>Watch the animated lecture and record it as video.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>
            Built with Next.js, Gemini AI, and Canvas animations.
            <br />
            Inspired by the beautiful work of 3Blue1Brown.
          </p>
        </footer>
      </main>
    </div>
  );
}
