import { useEffect, useState } from "react";

type Tab = "overview" | "roster" | "schedule" | "staff";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "roster", label: "Roster" },
  { id: "schedule", label: "Schedule" },
  { id: "staff", label: "Staff" },
];

const roster = [
  { number: "2", name: "Lucas Haddaway", position: "—" },
  { number: "3", name: "Matthew Melo", position: "M" },
  { number: "6", name: "Liam O’Hagan", position: "—" },
  { number: "9", name: "Jenson White", position: "—" },
  { number: "12", name: "Joshua Sweet", position: "—" },
  { number: "13", name: "Austin Fraser", position: "D" },
  { number: "14", name: "Terrance Barrina", position: "D" },
  { number: "15", name: "Jack Mullen", position: "—" },
  { number: "16", name: "Ryan Perry", position: "D" },
  { number: "17", name: "Kian McGuigan", position: "F" },
  { number: "19", name: "Elliot Holt", position: "—" },
  { number: "20", name: "Hayden Grant", position: "D" },
  { number: "21", name: "Griffin Armstrong", position: "—" },
  { number: "23", name: "Jack Richards", position: "—" },
  { number: "25", name: "Josh Brunton", position: "F" },
  { number: "27", name: "Noah Barker", position: "—" },
  { number: "27", name: "Ryan McDonald", position: "M" },
  { number: "28", name: "Jacob Nassar", position: "D" },
  { number: "29", name: "Evan Rheaume", position: "—" },
  { number: "31", name: "Alex D’Angelo", position: "D" },
  { number: "33", name: "Liam Clark", position: "G" },
  { number: "35", name: "Jonah Steenbakkers", position: "—" },
  { number: "44", name: "Logan Grant", position: "—" },
  { number: "55", name: "Carter Smith", position: "D" },
  { number: "66", name: "Cooper Delorey", position: "A" },
  { number: "86", name: "Chris Scissons", position: "D" },
  { number: "88", name: "Chris Edel", position: "D" },
];

const staff = [
  { role: "Head Coach", detail: "To be announced" },
  { role: "Assistant Coach", detail: "To be announced" },
  { role: "Team Manager", detail: "To be announced" },
  { role: "Athletic Therapist", detail: "To be announced" },
];

function Icon({ name, size = 20 }: { name: "arrow" | "calendar" | "mail" | "map" | "menu" | "users"; size?: number }) {
  const paths = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  };

  return <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width={size}>{paths[name]}</svg>;
}

function Wordmark() {
  return (
    <div className="wordmark" aria-label="Carleton Ravens">
      <span className="wordmark-bird">R</span>
      <span><small>CARLETON</small>RAVENS</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [activeTab]);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    window.requestAnimationFrame(() => document.getElementById("team-content")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="utility-bar">
          <span>HOME OF THE CARLETON UNIVERSITY RAVENS</span>
          <span className="utility-links">RECREATION &amp; ATHLETICS · CARLETON UNIVERSITY</span>
        </div>
        <nav className="main-nav" aria-label="Primary navigation">
          <Wordmark />
          <div className={`nav-links ${mobileOpen ? "is-open" : ""}`}>
            <span>Teams</span><span>Inside the Nest</span><span>Student-Athletes</span><span>Facilities</span><span>Tickets</span>
          </div>
          <button className="menu-button" type="button" aria-expanded={mobileOpen} aria-label="Toggle navigation" onClick={() => setMobileOpen((open) => !open)}>
            <Icon name="menu" size={24} />
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <img className="hero-image" src="https://images.unsplash.com/photo-1746826092606-ffbcac530b89?auto=format&fit=crop&w=2000&q=88" alt="Lacrosse players competing for the ball during a game" />
          <div className="hero-overlay" />
          <div className="hero-line" />
          <div className="hero-content reveal is-visible">
            <div className="eyebrow">CARLETON RAVENS · MEN’S CLUB SPORT</div>
            <h1>MEN’S<br />LACROSSE</h1>
            <p>Built in Ottawa. Competing across Canada.</p>
            <button className="primary-button" type="button" onClick={() => selectTab("roster")}>Meet the Ravens <Icon name="arrow" /></button>
          </div>
          <div className="season-mark"><small>2025–26</small><strong>CUFLA</strong><span>EAST DIVISION</span></div>
        </section>

        <section className="team-nav-wrap" id="team-content">
          <div className="team-title"><span>Club Sport</span><strong>Ravens Men’s Lacrosse</strong></div>
          <div className="team-tabs" role="tablist" aria-label="Team information">
            {tabs.map((tab) => (
              <button key={tab.id} className={activeTab === tab.id ? "active" : ""} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <div className="tab-panel" role="tabpanel" key={activeTab}>
          {activeTab === "overview" && <Overview onSelect={selectTab} />}
          {activeTab === "roster" && <Roster />}
          {activeTab === "schedule" && <Schedule />}
          {activeTab === "staff" && <Staff />}
        </div>
      </main>

      <footer>
        <div><Wordmark /><p>1125 Colonel By Drive, Ottawa, ON, K1S 5B6</p></div>
        <div className="footer-mark">GO RAVENS.</div>
      </footer>
    </div>
  );
}

function Overview({ onSelect }: { onSelect: (tab: Tab) => void }) {
  return (
    <>
      <section className="intro-section reveal">
        <div><div className="eyebrow dark">THE PROGRAM</div><h2>A TRADITION<br />SINCE 1986.</h2></div>
        <div className="intro-copy">
          <p className="lead">Carleton Ravens Lacrosse competes in the Canadian University Field Lacrosse Association, bringing together high-level competition, academic ambition, and a proud club tradition.</p>
          <p>The program was formed in 1986 for the first Ontario University Field Lacrosse Association spring tournament. Today, the Ravens compete in CUFLA’s East Division and pursue a place at the Baggataway Cup championship.</p>
          <button className="text-button" type="button" onClick={() => onSelect("roster")}>View the 2025–26 roster <Icon name="arrow" /></button>
        </div>
      </section>

      <section className="stat-band reveal">
        <div><strong>1986</strong><span>PROGRAM FOUNDED</span></div>
        <div><strong>10</strong><span>CONFERENCE GAMES</span></div>
        <div><strong>3×</strong><span>WEEKLY PRACTICES</span></div>
        <div><strong>CUFLA</strong><span>EAST DIVISION</span></div>
      </section>

      <section className="info-grid reveal">
        <article className="feature-card">
          <span className="card-number">01</span><Icon name="users" size={28} /><h3>JOIN THE RAVENS</h3>
          <p>Interested in competing at Carleton? Request a recruitment package and learn about training camp, eligibility, and the club experience.</p>
          <a href="mailto:carleton@cufla.ca">carleton@cufla.ca <Icon name="arrow" /></a>
        </article>
        <article className="feature-card red-card">
          <span className="card-number">02</span><Icon name="calendar" size={28} /><h3>THE SEASON</h3>
          <p>Pre-season begins in late August, followed by conference play from September through the fall and off-season training into April.</p>
          <button type="button" onClick={() => onSelect("schedule")}>Season details <Icon name="arrow" /></button>
        </article>
        <article className="feature-card dark-card">
          <span className="card-number">03</span><Icon name="map" size={28} /><h3>HOME IN OTTAWA</h3>
          <p>Train, compete, and study in Canada’s capital as part of Carleton’s proud Ravens athletics community.</p>
          <span className="card-link">Carleton University</span>
        </article>
      </section>
    </>
  );
}

function Roster() {
  return (
    <section className="data-section reveal">
      <div className="section-heading">
        <div><div className="eyebrow dark">2025–26 TEAM</div><h2>ROSTER</h2></div>
        <p>Complete player listing from the CUFLA 2026 Gamesheet roster. Unpublished biographical fields remain intentionally blank.</p>
      </div>
      <div className="source-note"><span className="live-dot" />27 athletes · Verified against CUFLA Gamesheet · February 2026</div>
      <div className="roster-table" role="table" aria-label="Carleton Ravens men's lacrosse roster">
        <div className="table-row table-head" role="row"><span role="columnheader">#</span><span role="columnheader">Player</span><span role="columnheader">Position</span><span role="columnheader">Year</span><span role="columnheader">Hometown</span></div>
        {roster.map((player) => (
          <div className="table-row" role="row" key={`${player.number}-${player.name}`}>
            <span role="cell" className="jersey-number">{player.number}</span>
            <span role="cell" className="player-name"><span className="avatar">{player.name.split(" ").map((part) => part[0]).join("")}</span>{player.name}</span>
            <span role="cell">{player.position}</span><span role="cell">—</span><span role="cell">—</span>
          </div>
        ))}
      </div>
      <p className="data-disclaimer">Roster names, numbers, and listed positions match the supplied CUFLA Gamesheet source. Year and hometown will remain blank until published by the league or team.</p>
    </section>
  );
}

function Schedule() {
  return (
    <section className="data-section reveal">
      <div className="section-heading">
        <div><div className="eyebrow dark">UPCOMING SEASON</div><h2>SCHEDULE</h2></div>
        <p>The 2025–26 game schedule has not yet been confirmed. Updates will appear here without sending visitors away from the Ravens page.</p>
      </div>
      <div className="empty-state">
        <Icon name="calendar" size={40} /><span>SCHEDULE UPDATE</span><h3>THE NEXT CAMPAIGN<br />IS TAKING SHAPE.</h3>
        <p>Conference dates, opponents, and venues will be posted once confirmed by CUFLA.</p>
        <a href="mailto:carleton@cufla.ca">Ask about the upcoming season <Icon name="arrow" /></a>
      </div>
    </section>
  );
}

function Staff() {
  return (
    <section className="data-section reveal">
      <div className="section-heading">
        <div><div className="eyebrow dark">TEAM CONTACTS</div><h2>STAFF</h2></div>
        <p>Staff names from the previous page have been intentionally removed. Confirmed names, biographies, and direct contact details can be added here when available.</p>
      </div>
      <div className="staff-grid">
        {staff.map((person, index) => (
          <article className="staff-card" key={person.role}>
            <div className="staff-placeholder">{String(index + 1).padStart(2, "0")}</div>
            <div><span>{person.role}</span><h3>{person.detail}</h3><p>Contact information pending confirmation.</p></div>
          </article>
        ))}
      </div>
      <div className="contact-strip">
        <div><Icon name="mail" size={26} /><span>GENERAL RECRUITMENT CONTACT</span><strong>carleton@cufla.ca</strong></div>
        <a href="mailto:carleton@cufla.ca">Send an email <Icon name="arrow" /></a>
      </div>
    </section>
  );
}
