import './About.css';

export function About() {
  return (
    <div className="about-page">
      <h1 className="page-title">About</h1>

      <div className="about-card">
        <h2>About This App</h2>
        <p>
          Israel Weather is a single-page application that lets you check the
          current weather for any Israeli locality. Select a city from the
          dropdown to instantly see temperature, wind speed, and weather
          conditions. Every search is saved to your history for easy reference.
        </p>
      </div>

      <div className="about-card">
        <h2>Developer</h2>
        <p className="developer-name">Omri Abu Daula</p>
        <hr className="about-divider" />
        <p>Student at John Bryce</p>
      </div>

      <p className="about-footer">Built with React + TypeScript</p>
    </div>
  );
}
