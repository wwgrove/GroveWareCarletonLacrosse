import { useEffect, useState } from "react";

type Tab = "overview" | "roster" | "stats" | "schedule" | "staff";
type ScheduleGame = {
  date: string;
  opponent: string;
  venue: string;
  game: string;
  home: boolean;
  result: string;
};

type GamesheetGame = {
  number: string;
  date: string;
  time: string;
  status: string;
  location: string;
  visitor: { id: number; title: string; goals: number; result: string };
  home: { id: number; title: string; goals: number; result: string };
};

const CARLETON_TEAM_ID = 550883;
const GAMESHEET_TEAM_SOURCE = "https://gamesheetstats.com/seasons/15751/teams/550883/roster?configuration=625";
const GAMESHEET_SCHEDULE_SOURCE = GAMESHEET_TEAM_SOURCE.replace("/roster?", "/schedule?");

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "roster", label: "Roster" },
  { id: "stats", label: "Stats" },
  { id: "schedule", label: "Schedule" },
  { id: "staff", label: "Staff" },
];

const teamStats = [
  { label: "Games played", value: "7", abbreviation: "GP" },
  { label: "Goals for", value: "38", abbreviation: "GF" },
  { label: "Goals against", value: "113", abbreviation: "GA" },
  { label: "Goal differential", value: "−75", abbreviation: "DIFF" },
  { label: "League points", value: "0", abbreviation: "PTS" },
  { label: "Penalty minutes", value: "41.5", abbreviation: "PIM" },
];

const playerStats = [
  { number: "9", name: "Jenson White", gp: 6, goals: 14, assists: 1, points: 15, pim: 0 },
  { number: "66", name: "Cooper Delorey", gp: 7, goals: 6, assists: 6, points: 12, pim: 0.5 },
  { number: "21", name: "Griffin Armstrong", gp: 7, goals: 5, assists: 5, points: 10, pim: 2 },
  { number: "44", name: "Logan Grant", gp: 7, goals: 4, assists: 5, points: 9, pim: 2.5 },
  { number: "2", name: "Lucas Haddaway", gp: 7, goals: 2, assists: 2, points: 4, pim: 1 },
  { number: "12", name: "Joshua Sweet", gp: 7, goals: 2, assists: 2, points: 4, pim: 5 },
  { number: "15", name: "Jack Mullen", gp: 7, goals: 2, assists: 1, points: 3, pim: 0 },
  { number: "14", name: "Terrance Barrina", gp: 6, goals: 1, assists: 0, points: 1, pim: 2.5 },
  { number: "25", name: "Josh Brunton", gp: 7, goals: 0, assists: 1, points: 1, pim: 2.5 },
  { number: "13", name: "Austin Fraser", gp: 7, goals: 1, assists: 0, points: 1, pim: 1 },
  { number: "17", name: "Kian McGuigan", gp: 7, goals: 0, assists: 1, points: 1, pim: 1.5 },
  { number: "6", name: "Liam O’Hagan", gp: 7, goals: 0, assists: 1, points: 1, pim: 0 },
  { number: "35", name: "Jonah Steenbakkers", gp: 7, goals: 1, assists: 0, points: 1, pim: 0 },
  { number: "27", name: "Noah Barker", gp: 0, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "31", name: "Alex D’Angelo", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "88", name: "Chris Edel", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "20", name: "Hayden Grant", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "19", name: "Elliot Holt", gp: 4, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "27", name: "Ryan McDonald", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "3", name: "Matthew Melo", gp: 2, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "28", name: "Jacob Nassar", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "16", name: "Ryan Perry", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "29", name: "Evan Rheaume", gp: 7, goals: 0, assists: 0, points: 0, pim: 0 },
  { number: "23", name: "Jack Richards", gp: 7, goals: 0, assists: 0, points: 0, pim: 2 },
  { number: "86", name: "Chris Scissons", gp: 7, goals: 0, assists: 0, points: 0, pim: 10.5 },
  { number: "55", name: "Carter Smith", gp: 7, goals: 0, assists: 0, points: 0, pim: 10.5 },
];

const scheduleFallback: ScheduleGame[] = [
  { date: "Sep 9, 2026", opponent: "Trent", venue: "Justin Chiu Stadium", game: "1", home: false, result: "L 8–17" },
  { date: "Sep 13, 2026", opponent: "McGill", venue: "Raven’s Road Field", game: "7", home: true, result: "L 6–17" },
  { date: "Sep 18, 2026", opponent: "Ottawa", venue: "Gee-Gees Field", game: "12", home: false, result: "L 1–17" },
  { date: "Sep 26, 2026", opponent: "Trent", venue: "Raven’s Road Field", game: "22", home: true, result: "L 5–14" },
  { date: "Sep 27, 2026", opponent: "Ottawa", venue: "Raven’s Road Field", game: "27", home: true, result: "L 9–21" },
  { date: "Oct 3, 2026", opponent: "Bishop’s", venue: "Coulter Field", game: "35", home: false, result: "L 2–14" },
  { date: "Oct 9, 2026", opponent: "Queen’s", venue: "Raven’s Road Field", game: "37", home: true, result: "L 7–13" },
  { date: "Oct 16, 2026", opponent: "McGill", venue: "Molson Stadium", game: "45", home: false, result: "8:00 PM" },
  { date: "Oct 23, 2026", opponent: "Queen’s", venue: "MikMac Field", game: "54", home: false, result: "7:00 PM" },
  { date: "Oct 24, 2026", opponent: "Bishop’s", venue: "Raven’s Road Field", game: "57", home: true, result: "2:00 PM" },
];

function extractGamesheetGames(html: string): GamesheetGame[] {
  const marker = "[{\\\"gameId\\\"";
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("Gamesheet schedule payload was not found");

  const source = html.slice(start).replaceAll("\\\"", "\"");
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") inString = false;
      continue;
    }
    if (character === "\"") inString = true;
    else if (character === "[") depth += 1;
    else if (character === "]") {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(0, index + 1)) as GamesheetGame[];
    }
  }

  throw new Error("Gamesheet schedule payload was incomplete");
}

function normalizeSchedule(games: GamesheetGame[]): ScheduleGame[] {
  return games.map((game) => {
    const home = game.home.id === CARLETON_TEAM_ID;
    const ravens = home ? game.home : game.visitor;
    const opponent = home ? game.visitor : game.home;
    const result = game.status === "final"
      ? `${ravens.result} ${ravens.goals}–${opponent.goals}`
      : game.time;

    return {
      date: game.date,
      opponent: opponent.title,
      venue: game.location,
      game: game.number,
      home,
      result,
    };
  });
}

const roster = [
  { number: "2", name: "Lucas Haddaway" },
  { number: "3", name: "Matthew Melo" },
  { number: "6", name: "Liam O’Hagan" },
  { number: "9", name: "Jenson White" },
  { number: "12", name: "Joshua Sweet" },
  { number: "13", name: "Austin Fraser" },
  { number: "14", name: "Terrance Barrina" },
  { number: "15", name: "Jack Mullen" },
  { number: "16", name: "Ryan Perry" },
  { number: "17", name: "Kian McGuigan" },
  { number: "19", name: "Elliot Holt" },
  { number: "20", name: "Hayden Grant" },
  { number: "21", name: "Griffin Armstrong" },
  { number: "23", name: "Jack Richards" },
  { number: "25", name: "Josh Brunton" },
  { number: "27", name: "Noah Barker" },
  { number: "27", name: "Ryan McDonald" },
  { number: "28", name: "Jacob Nassar" },
  { number: "29", name: "Evan Rheaume" },
  { number: "31", name: "Alex D’Angelo" },
  { number: "33", name: "Liam Clark" },
  { number: "35", name: "Jonah Steenbakkers" },
  { number: "44", name: "Logan Grant" },
  { number: "55", name: "Carter Smith" },
  { number: "66", name: "Cooper Delorey" },
  { number: "86", name: "Chris Scissons" },
  { number: "88", name: "Chris Edel" },
];

const staff = [
  { role: "Head Coach", detail: "Colin Gallagher", email: "colingallagher96@gmail.com" },
  { role: "Head Coach", detail: "Jacob Gasperetti", email: "jacobgasperetti10@gmail.com" },
  { role: "Assistant Coach", detail: "Nic Ayoub", email: "buoya24@hotmail.com" },
  { role: "Assistant Coach", detail: "Alex Beauvais", email: "beauvaisalex@hotmail.ca" },
  { role: "Assistant Coach", detail: "Mark Lange", email: "marklangejr@hotmail.com" },
  { role: "Athletic Trainer", detail: "Asheley Baldwin", email: "" },
  { role: "Equipment Manager", detail: "Will Wingrove", email: "will@thewingroves.com" },
  { role: "President and GM", detail: "Brock Conley", email: "brockpconley@gmail.com" },
  { role: "Remote Coaching Consultant", detail: "Matthew Caines", email: "matthewcaines@cmail.carleton.ca" },
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
      </header>

      <main>
        <section className="hero">
          <img className="hero-image" src="/ravens-lacrosse-hero.jpg" alt="A Carleton Ravens lacrosse player carrying the ball past an Ottawa defender" />
          <div className="hero-overlay" />
          <div className="hero-line" />
          <div className="hero-content reveal is-visible">
            <div className="eyebrow">CARLETON RAVENS · MEN’S CLUB SPORT</div>
            <h1>MENS LACROSSE</h1>
          </div>
          <div className="season-mark"><strong>CUFLA</strong><span>EAST DIVISION</span></div>
        </section>

        <section className="team-nav-wrap" id="team-content">
          <div className="team-title"><span>Club Sport</span><strong>Ravens Men’s Lacrosse</strong></div>
          <div
            className="team-tabs"
            role="tablist"
            aria-label="Team information"
            style={{ touchAction: "pan-y" }}
            onTouchStart={(event) => {
              event.currentTarget.dataset.touchStartX = String(event.touches[0].clientX);
            }}
            onTouchEnd={(event) => {
              const startX = Number(event.currentTarget.dataset.touchStartX);
              const distance = event.changedTouches[0].clientX - startX;
              if (!Number.isFinite(startX) || Math.abs(distance) < 50) return;
              const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
              const nextIndex = Math.min(
                tabs.length - 1,
                Math.max(0, currentIndex + (distance < 0 ? 1 : -1)),
              );
              const tabList = event.currentTarget;
              setActiveTab(tabs[nextIndex].id);
              window.requestAnimationFrame(() => {
                tabList
                  .querySelector('[aria-selected="true"]')
                  ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              });
            }}
          >
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
          {activeTab === "stats" && <Stats />}
          {activeTab === "schedule" && <Schedule />}
          {activeTab === "staff" && <Staff />}
        </div>
      </main>

    </div>
  );
}

function Overview({ onSelect }: { onSelect: (tab: Tab) => void }) {
  return (
    <>
      <section className="intro-section reveal">
        <div><div className="eyebrow dark">THE PROGRAM</div><h2><span>A TRADITION</span><span>SINCE 1986.</span></h2></div>
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
        <div className="table-row table-head" role="row"><span role="columnheader">#</span><span role="columnheader">Player</span></div>
        {roster.map((player) => (
          <div className="table-row" role="row" key={`${player.number}-${player.name}`}>
            <span role="cell" className="jersey-number">{player.number}</span>
            <span role="cell" className="player-name"><span className="avatar">{player.name.split(" ").map((part) => part[0]).join("")}</span>{player.name}</span>
          </div>
        ))}
      </div>
      <p className="data-disclaimer">Roster names and jersey numbers match the supplied CUFLA Gamesheet source.</p>
    </section>
  );
}

function Stats() {
  return (
    <section className="data-section reveal">
      <div className="section-heading stats-heading">
        <div><div className="eyebrow dark">CUFLA 2026</div><h2>TEAM STATS</h2></div>
        <p>Current Carleton team statistics taken from the supplied Gamesheet team source. Figures reflect the seven games currently recorded.</p>
      </div>

      <div className="stats-scoreboard">
        <div className="record-block">
          <span>Current record</span>
          <strong>0 –7</strong>
          <small>6TH · EAST DIVISION</small>
        </div>
        <div className="headline-stats">
          <div><span>Goals / game</span><strong>5.43</strong><small>GPG</small></div>
          <div><span>Against / game</span><strong>16.14</strong><small>GAPG</small></div>
          <div><span>Power play goals / game</span><strong>0.14</strong><small>PP GPG</small></div>
          <div><span>Penalty minutes / game</span><strong>5.9</strong><small>PIM PG</small></div>
        </div>
      </div>

      <div className="stats-grid">
        {teamStats.map((stat) => (
          <article className="stat-card" key={stat.abbreviation}>
            <span>{stat.abbreviation}</span>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>

      <div className="subsection-heading">
        <div><span>INDIVIDUAL LEADERS</span><h3>PLAYER STATISTICS</h3></div>
        <p>Sorted by total points</p>
      </div>
      <div className="player-stats-table" role="table" aria-label="Carleton Ravens individual player statistics">
        <div className="player-stat-row player-stat-head" role="row">
          <span role="columnheader">#</span><span role="columnheader">Player</span><span role="columnheader">GP</span><span role="columnheader">G</span><span role="columnheader">A</span><span role="columnheader">PTS</span><span role="columnheader">PIM</span>
        </div>
        {playerStats.map((player) => (
          <div className="player-stat-row" role="row" key={`${player.number}-${player.name}`}>
            <span role="cell" className="jersey-number">{player.number}</span>
            <span role="cell" className="player-name">{player.name}</span>
            <span role="cell">{player.gp}</span><span role="cell">{player.goals}</span><span role="cell">{player.assists}</span>
            <strong role="cell">{player.points}</strong><span role="cell">{player.pim}</span>
          </div>
        ))}
      </div>

      <div className="subsection-heading goalie-heading">
        <div><span>GOALTENDING</span><h3>LIAM CLARK <small>#33</small></h3></div>
      </div>
      <div className="goalie-stats">
        <div><span>GP</span><strong>7</strong><small>Games played</small></div>
        <div><span>W–L</span><strong>0–7</strong><small>Record</small></div>
        <div><span>SA</span><strong>120</strong><small>Shots against</small></div>
        <div><span>SV</span><strong>7</strong><small>Saves</small></div>
        <div><span>GAA</span><strong>12.11</strong><small>Goals against avg.</small></div>
        <div><span>SV%</span><strong>.058</strong><small>Save percentage</small></div>
      </div>

      <div className="stats-source">
        <div><span className="live-dot" /><strong>GAMESHEET DATA</strong></div>
        <p>Verified from the supplied CUFLA 2026 Carleton team page · February 2026</p>
      </div>
    </section>
  );
}

function Schedule() {
  const [games, setGames] = useState<ScheduleGame[]>(scheduleFallback);
  const [feedStatus, setFeedStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    let active = true;

    async function refreshSchedule() {
      try {
        const response = await fetch(GAMESHEET_SCHEDULE_SOURCE, { cache: "no-store" });
        if (!response.ok) throw new Error(`Gamesheet returned ${response.status}`);
        const nextGames = normalizeSchedule(extractGamesheetGames(await response.text()));
        if (active && nextGames.length > 0) {
          setGames(nextGames);
          setFeedStatus("live");
        }
      } catch {
        if (active) setFeedStatus("fallback");
      }
    }

    refreshSchedule();
    const refreshTimer = window.setInterval(refreshSchedule, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <section className="data-section reveal">
      <div className="section-heading">
        <div><div className="eyebrow dark">CUFLA 2026</div><h2>SCHEDULE</h2></div>
        <p>Ten-game regular-season schedule from the supplied Gamesheet team page. All times are shown in Eastern Time.</p>
      </div>
      <div className="schedule-list" role="table" aria-label="Carleton Ravens 2026 schedule">
        <div className="schedule-row schedule-head" role="row">
          <span role="columnheader">Date</span><span role="columnheader">Matchup</span><span role="columnheader">Result / Time</span><span role="columnheader">Location</span>
        </div>
        {games.map((game) => (
          <div className={`schedule-row ${game.result.startsWith("L") ? "is-final" : "is-upcoming"}`} role="row" key={`${game.date}-${game.opponent}`}>
            <span role="cell" className="schedule-date">{game.date}</span>
            <span role="cell" className="matchup">
              <small>{game.home ? "HOME" : "AWAY"}</small>
              <strong>{game.home ? "vs." : "at"} {game.opponent}</strong>
            </span>
            <strong role="cell" className="game-result">{game.result}</strong>
            <span role="cell">{game.venue}</span>
          </div>
        ))}
      </div>
      <div className="stats-source">
        <div><span className={`live-dot ${feedStatus === "fallback" ? "is-fallback" : ""}`} /><strong>{feedStatus === "live" ? "LIVE GAMESHEET FEED" : feedStatus === "loading" ? "REFRESHING GAMESHEET" : "VERIFIED FALLBACK"}</strong></div>
        <p>{feedStatus === "live" ? "Automatically refreshes every five minutes" : "The last verified schedule is shown while the live feed is unavailable"}</p>
      </div>
    </section>
  );
}

function Staff() {
  return (
    <section className="data-section reveal">
      <div className="section-heading">
        <div><div className="eyebrow dark">TEAM CONTACTS</div><h2>STAFF</h2></div>
        <p>Meet the Carleton Ravens men’s lacrosse coaching, performance, and operations staff for the 2026 season.</p>
      </div>
      <div className="source-note"><span className="live-dot" />9 team staff · Updated February 2026</div>
      <div className="staff-grid">
        {staff.map((person) => (
          <article className="staff-card" key={person.detail}>
            <div className="staff-placeholder"><img src="/coach-placeholder.svg" alt="" /></div>
            <div>
              <span>{person.role}</span>
              <h3>{person.detail}</h3>
              {person.email
                ? <a href={`mailto:${person.email}`}>{person.email}</a>
                : <p>Direct contact information coming soon.</p>}
            </div>
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
