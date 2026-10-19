import { type FormEvent, useEffect, useState } from "react";

type Tab = "overview" | "roster" | "stats" | "schedule" | "staff" | "recruiting";
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

type PlayerStat = {
  number: string;
  name: string;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  pim: number;
};

type GoalieStat = {
  number: string;
  name: string;
  gp: number;
  wins: number;
  losses: number;
  shotsAgainst: number;
  goalsAgainst: number;
  goalsAgainstAverage: number;
  savePercentage: number;
};

type TeamStandings = {
  record: string;
  points: number;
  rank: number;
  division: string;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  penaltyMinutes: number;
  powerPlayGoals: number;
};

type GamesheetTeamData = {
  roster: { number: string; name: string }[];
  playerStats: PlayerStat[];
  goalie: GoalieStat;
  standings: TeamStandings;
};

type PlayerStatSortKey = "number" | "name" | "gp" | "goals" | "assists" | "points" | "pim";

const CARLETON_TEAM_ID = 550883;
const GAMESHEET_TEAM_SOURCE = "https://gamesheetstats.com/seasons/15751/teams/550883/roster?configuration=625";
const GAMESHEET_SCHEDULE_SOURCE = GAMESHEET_TEAM_SOURCE.replace("/roster?", "/schedule?");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQZA9KBTMpQemyMZAavGbYbHaCg1oS0qaw8xMadHpcEvcpFkLDPEED-LWXnvmn40gvOw/exec";
const HERO_IMAGES_API_URL = "https://api.github.com/repos/wwgrove/CarletonLacrosseWebpage/contents/hero-carosel-photos";
const HERO_FALLBACK_IMAGE = "/ravens-lacrosse-hero.jpg";
const HERO_CACHE_KEY = "carleton-lacrosse-hero-images";
const HERO_PERIOD_KEY = "carleton-lacrosse-hero-period";
const RECRUITING_SUBMITTED_KEY = "carleton-lacrosse-recruiting-submitted";
const STAFF_PHOTO_BASE_URL = "https://raw.githubusercontent.com/wwgrove/CarletonLacrosseWebpage/f0b31f57f91bb798ed63871575e02e7504447f2e/Coaches-Head-Shots";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "roster", label: "Roster" },
  { id: "stats", label: "Stats" },
  { id: "schedule", label: "Schedule" },
  { id: "staff", label: "Staff" },
  { id: "recruiting", label: "Recruiting" },
];

const playerStats: PlayerStat[] = [
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
  { role: "Head Coach", detail: "Colin Gallagher", email: "colingallagher96@gmail.com", photo: "Colin-Gallagher.jpg" },
  { role: "Head Coach", detail: "Jacob Gasperetti", email: "jacobgasperetti10@gmail.com", photo: "Jacob-Gasperetti.jpg" },
  { role: "Assistant Coach", detail: "Nic Ayoub", email: "buoya24@hotmail.com", photo: "Nic-Ayoub.jpg" },
  { role: "Assistant Coach", detail: "Alex Beauvais", email: "beauvaisalex@hotmail.ca", photo: "Alex-Beauvais.jpg" },
  { role: "Assistant Coach", detail: "Mark Lange", email: "marklangejr@hotmail.com", photo: "Mark-Lange.jpg" },
  { role: "Athletic Trainer", detail: "Ashley Baldwin", email: "ashleybaldwin10@hotmail.com", photo: "Ashley-Baldwin.jpg" },
  { role: "Equipment Manager", detail: "Will Wingrove", email: "will@thewingroves.com", photo: "Will-Wingrove.jpg" },
  { role: "President and GM", detail: "Brock Conley", email: "brockpconley@gmail.com", photo: "Brock-Conely.jpg" },
  { role: "Remote Coaching Consultant", detail: "Matt Caines", email: "mcaines99@hotmail.com", photo: "Matt-Caines.jpg" },
  { role: "Director of Stats, Analytics, and Video", detail: "Tyler Rohleder", email: "tylerjrohleder17@gmail.com", photo: "Tyler-Rohleder.jpg" },
];

function parseGamesheetTeamData(html: string): GamesheetTeamData {
  const normalized = html.replaceAll("\\\"", "\"");
  const playerPattern = /"firstName":"([^"]+)".*?"jersey":"([^"]+)".*?"lastName":"([^"]+)".*?"stats":\{([^{}]+)\}/gs;
  const knownNames = new Map(roster.map((player) => [
    `${player.number}-${player.name.toLocaleUpperCase()}`,
    player.name,
  ]));
  const seenPlayers = new Set<string>();
  const parsedRoster: { number: string; name: string }[] = [];
  const parsedPlayerStats: PlayerStat[] = [];
  let parsedGoalie: GoalieStat | null = null;
  let match: RegExpExecArray | null;

  function formatName(firstName: string, lastName: string, number: string) {
    const sourceName = `${firstName} ${lastName}`;
    const knownName = knownNames.get(`${number}-${sourceName.toLocaleUpperCase()}`);
    if (knownName) return knownName;
    return sourceName
      .toLocaleLowerCase()
      .replace(/(^|[\s’'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());
  }

  while ((match = playerPattern.exec(normalized)) !== null) {
    const [, firstName, number, lastName, rawStats] = match;
    const playerKey = `${number}-${firstName}-${lastName}`;
    if (seenPlayers.has(playerKey)) continue;
    seenPlayers.add(playerKey);

    const stats = JSON.parse(`{${rawStats}}`) as Record<string, number | boolean>;
    const name = formatName(firstName, lastName, number);
    parsedRoster.push({ number, name });

    if (Number.isFinite(stats.gaa)) {
      parsedGoalie = {
        number,
        name,
        gp: Number(stats.gp),
        wins: Number(stats.wins),
        losses: Number(stats.losses),
        shotsAgainst: Number(stats.sa),
        goalsAgainst: Number(stats.ga),
        goalsAgainstAverage: Number(stats.gaa),
        savePercentage: Number(stats.svpct),
      };
    } else {
      parsedPlayerStats.push({
        number,
        name,
        gp: Number(stats.gp),
        goals: Number(stats.g),
        assists: Number(stats.a),
        points: Number(stats.pts),
        pim: Number(stats.pim),
      });
    }
  }

  const standingsMatch = normalized.match(
    /"teamStandings":\{"record":"([^"]+)","pts":([0-9.]+),"rank":([0-9.]+),"division":"([^"]+)","stats":\{([^{}]+)\}/s,
  );
  if (parsedRoster.length < 20 || parsedPlayerStats.length < 20 || !parsedGoalie || !standingsMatch) {
    throw new Error("Gamesheet team payload was incomplete");
  }

  const standingsStats = JSON.parse(`{${standingsMatch[5]}}`) as Record<string, number | string>;
  parsedRoster.sort((first, second) =>
    Number(first.number) - Number(second.number) || first.name.localeCompare(second.name),
  );

  return {
    roster: parsedRoster,
    playerStats: parsedPlayerStats,
    goalie: parsedGoalie,
    standings: {
      record: standingsMatch[1],
      points: Number(standingsMatch[2]),
      rank: Number(standingsMatch[3]),
      division: standingsMatch[4],
      gamesPlayed: Number(standingsStats.GP),
      goalsFor: Number(standingsStats.GF),
      goalsAgainst: Number(standingsStats.GA),
      penaltyMinutes: Number(standingsStats.PIM),
      powerPlayGoals: Number(standingsStats.PPG),
    },
  };
}

function useLiveGamesheetTeamData() {
  const [data, setData] = useState<GamesheetTeamData | null>(null);
  const [feedStatus, setFeedStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    let active = true;

    async function refreshTeamData() {
      try {
        const response = await fetch(GAMESHEET_TEAM_SOURCE, { cache: "no-store" });
        if (!response.ok) throw new Error(`Gamesheet returned ${response.status}`);
        const nextData = parseGamesheetTeamData(await response.text());
        if (active) {
          setData(nextData);
          setFeedStatus("live");
        }
      } catch {
        if (active) setFeedStatus("fallback");
      }
    }

    refreshTeamData();
    const refreshTimer = window.setInterval(refreshTeamData, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return { data, feedStatus };
}

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

function HeroCarousel() {
  const [images, setImages] = useState<string[]>([HERO_FALLBACK_IMAGE]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;
    const now = new Date();
    const periodStamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      now.getHours() < 12 ? "AM" : "PM",
    ].join("-");

    function readCachedImages() {
      try {
        const parsed = JSON.parse(localStorage.getItem(HERO_CACHE_KEY) ?? "[]");
        return Array.isArray(parsed)
          ? parsed.filter((value): value is string => typeof value === "string" && value.length > 0)
          : [];
      } catch {
        return [];
      }
    }

    function saveHeroCache(nextImages: string[]) {
      try {
        localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(nextImages));
        localStorage.setItem(HERO_PERIOD_KEY, periodStamp);
      } catch {
        // The carousel still works when storage is blocked or full.
      }
    }

    function shuffleImages(sourceImages: string[]) {
      const shuffled = [...sourceImages];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      return shuffled;
    }

    async function loadHeroImages() {
      const cachedImages = readCachedImages();
      let cachedPeriod = "";
      try {
        cachedPeriod = localStorage.getItem(HERO_PERIOD_KEY) ?? "";
      } catch {
        // Continue with the network request when local storage is unavailable.
      }

      if (cachedPeriod === periodStamp && cachedImages.length > 0) {
        if (active) setImages(cachedImages);
        return;
      }

      try {
        const response = await fetch(HERO_IMAGES_API_URL, {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        const contents = await response.json() as Array<{
          name?: string;
          type?: string;
          download_url?: string | null;
        }>;
        const imageUrls = contents
          .filter((item) =>
            item.type === "file"
            && typeof item.download_url === "string"
            && /\.(jpe?g|png|webp|gif|avif)$/i.test(item.name ?? ""),
          )
          .map((item) => item.download_url as string);
        if (imageUrls.length === 0) throw new Error("The GitHub hero folder contained no supported images");

        const shuffledImages = shuffleImages(imageUrls);
        saveHeroCache(shuffledImages);
        if (active) setImages(shuffledImages);
      } catch (error) {
        console.error("Unable to refresh hero carousel images", error);
        const fallbackImages = cachedImages.length > 0 ? cachedImages : [HERO_FALLBACK_IMAGE];
        saveHeroCache(fallbackImages);
        if (active) setImages(fallbackImages);
      }
    }

    loadHeroImages();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setActiveImage(0);
    if (images.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const slideTimer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 6000);
    return () => window.clearInterval(slideTimer);
  }, [images]);

  useEffect(() => {
    if (images.length < 2) return;
    const nextImage = new Image();
    nextImage.src = images[(activeImage + 1) % images.length];
  }, [activeImage, images]);

  return (
    <div className="hero-carousel" role="img" aria-label="Carleton Ravens lacrosse action photography">
      {images.map((source, index) => (
        <img
          className={`hero-image ${index === activeImage ? "is-active" : ""}`}
          src={source}
          alt=""
          aria-hidden="true"
          key={source}
        />
      ))}
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
          <HeroCarousel />
          <div className="hero-overlay" />
          <div className="hero-line" />
          <a
            className="hero-social-link"
            href="https://www.instagram.com/carletonlax/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit Carleton Lacrosse on Instagram"
          >
            <img src="/instagram.svg" alt="" />
          </a>
          <div className="hero-content reveal is-visible">
            <div className="eyebrow">
              <span className="hero-eyebrow-copy">
                <span>CARLETON RAVENS<span className="hero-eyebrow-desktop"> · CLUB SPORT</span></span>
                <span className="hero-eyebrow-mobile">CLUB SPORT</span>
              </span>
            </div>
            <h1>MENS LACROSSE</h1>
          </div>
          <div className="season-mark"><strong>CUFLA</strong><span>EAST DIVISION</span></div>
        </section>

        <section className="team-nav-wrap" id="team-content">
          <div className="team-title"></div>
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
          {activeTab === "stats" && <Stats />}
          {activeTab === "schedule" && <Schedule />}
          {activeTab === "staff" && <Staff />}
          {activeTab === "recruiting" && <Recruiting />}
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
          <button className="text-button" type="button" onClick={() => onSelect("roster")}>View the 2026–27 roster <Icon name="arrow" /></button>
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
          <a href="mailto:carletonlacrosse@gmail.com">carletonlacrosse@gmail.com <Icon name="arrow" /></a>
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
  const { data, feedStatus } = useLiveGamesheetTeamData();
  const rosterPlayers = data?.roster ?? roster;

  return (
    <section className="data-section reveal">
      <div className="section-heading">
        <div><div className="eyebrow dark">2026–27 TEAM</div><h2>ROSTER</h2></div>
        <p>Complete player listing from the CUFLA 2026 Gamesheet roster.</p>
      </div>
      <div className="source-note">
        <span className={`live-dot ${feedStatus === "fallback" ? "is-fallback" : ""}`} />
        {feedStatus === "live"
          ? `${rosterPlayers.length} athletes · Live Gamesheet feed · Refreshes every five minutes`
          : feedStatus === "loading"
            ? `${rosterPlayers.length} athletes · Refreshing Gamesheet`
            : `${rosterPlayers.length} athletes · Verified fallback · September 2026`}
      </div>
      <div className="roster-table" role="table" aria-label="Carleton Ravens men's lacrosse roster">
        <div className="table-row table-head" role="row"><span role="columnheader">#</span><span role="columnheader">Player</span></div>
        {rosterPlayers.map((player) => (
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
  const { data, feedStatus } = useLiveGamesheetTeamData();
  const [playerSort, setPlayerSort] = useState<{ key: PlayerStatSortKey; direction: "asc" | "desc" }>({
    key: "points",
    direction: "desc",
  });
  const currentPlayerStats = data?.playerStats ?? playerStats;
  const standings = data?.standings ?? {
    record: "0-7-0-0",
    points: 0,
    rank: 6,
    division: "East",
    gamesPlayed: 7,
    goalsFor: 38,
    goalsAgainst: 113,
    penaltyMinutes: 41.5,
    powerPlayGoals: 1,
  };
  const goalie = data?.goalie ?? {
    number: "33",
    name: "Liam Clark",
    gp: 7,
    wins: 0,
    losses: 7,
    shotsAgainst: 120,
    goalsAgainst: 113,
    goalsAgainstAverage: 12.107142857142858,
    savePercentage: 0.058333333333333334,
  };
  const recordParts = standings.record.split("-");
  const displayRecord = `${recordParts[0] ?? "0"}–${recordParts[1] ?? "0"}`;
  const ordinalSuffix = standings.rank % 100 >= 11 && standings.rank % 100 <= 13
    ? "TH"
    : standings.rank % 10 === 1 ? "ST" : standings.rank % 10 === 2 ? "ND" : standings.rank % 10 === 3 ? "RD" : "TH";
  const gamesPlayed = Math.max(standings.gamesPlayed, 1);
  const currentTeamStats = [
    { label: "Games played", value: String(standings.gamesPlayed), abbreviation: "GP" },
    { label: "Goals for", value: String(standings.goalsFor), abbreviation: "GF" },
    { label: "Goals against", value: String(standings.goalsAgainst), abbreviation: "GA" },
    { label: "Goal differential", value: String(standings.goalsFor - standings.goalsAgainst).replace("-", "−"), abbreviation: "DIFF" },
    { label: "League points", value: String(standings.points), abbreviation: "PTS" },
    { label: "Penalty minutes", value: String(standings.penaltyMinutes), abbreviation: "PIM" },
  ];
  const statColumns: { key: PlayerStatSortKey; label: string }[] = [
    { key: "number", label: "#" },
    { key: "name", label: "Player" },
    { key: "gp", label: "GP" },
    { key: "goals", label: "G" },
    { key: "assists", label: "A" },
    { key: "points", label: "PTS" },
    { key: "pim", label: "PIM" },
  ];
  const sortedPlayerStats = [...currentPlayerStats].sort((first, second) => {
    const firstValue = playerSort.key === "number" ? Number(first.number) : first[playerSort.key];
    const secondValue = playerSort.key === "number" ? Number(second.number) : second[playerSort.key];
    const comparison = typeof firstValue === "string"
      ? firstValue.localeCompare(String(secondValue))
      : Number(firstValue) - Number(secondValue);
    return playerSort.direction === "asc" ? comparison : -comparison;
  });

  function sortPlayers(key: PlayerStatSortKey) {
    setPlayerSort((current) => ({
      key,
      direction: current.key === key
        ? current.direction === "asc" ? "desc" : "asc"
        : key === "name" || key === "number" ? "asc" : "desc",
    }));
  }

  return (
    <section className="data-section reveal">
      <div className="section-heading stats-heading">
        <div><div className="eyebrow dark">CUFLA 2026</div><h2>TEAM STATS</h2></div>
        <p>Current Carleton team statistics taken from the supplied Gamesheet team source. Figures reflect the {standings.gamesPlayed} games currently recorded.</p>
      </div>

      <div className="stats-scoreboard">
        <div className="record-block">
          <span>Current record</span>
          <strong>{displayRecord}</strong>
          <small>{standings.rank}{ordinalSuffix} · {standings.division.toLocaleUpperCase()} DIVISION</small>
        </div>
        <div className="headline-stats">
          <div><span>Goals / game</span><strong>{(standings.goalsFor / gamesPlayed).toFixed(2)}</strong><small>GPG</small></div>
          <div><span>Against / game</span><strong>{(standings.goalsAgainst / gamesPlayed).toFixed(2)}</strong><small>GAPG</small></div>
          <div><span>Power play goals / game</span><strong>{(standings.powerPlayGoals / gamesPlayed).toFixed(2)}</strong><small>PP GPG</small></div>
          <div><span>Penalty minutes / game</span><strong>{(standings.penaltyMinutes / gamesPlayed).toFixed(1)}</strong><small>PIM PG</small></div>
        </div>
      </div>

      <div className="stats-grid">
        {currentTeamStats.map((stat) => (
          <article className="stat-card" key={stat.abbreviation}>
            <span>{stat.abbreviation}</span>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>

      <div className="subsection-heading">
        <div><span>INDIVIDUAL LEADERS</span><h3>PLAYER STATISTICS</h3></div>
        <p>Tap a column to sort</p>
      </div>
      <div className="player-stats-table" role="table" aria-label="Carleton Ravens individual player statistics">
        <div className="player-stat-row player-stat-head" role="row">
          {statColumns.map((column) => (
            <span
              key={column.key}
              role="columnheader"
              aria-sort={playerSort.key === column.key ? playerSort.direction === "asc" ? "ascending" : "descending" : "none"}
            >
              <button
                className="stat-sort-button"
                type="button"
                onClick={() => sortPlayers(column.key)}
                aria-label={`Sort player statistics by ${column.label}`}
              >
                {column.label}
                {playerSort.key === column.key && <span aria-hidden="true">{playerSort.direction === "asc" ? "↑" : "↓"}</span>}
              </button>
            </span>
          ))}
        </div>
        {sortedPlayerStats.map((player) => (
          <div className="player-stat-row" role="row" key={`${player.number}-${player.name}`}>
            <span role="cell" className="jersey-number">{player.number}</span>
            <span role="cell" className="player-name">{player.name}</span>
            <span role="cell">{player.gp}</span><span role="cell">{player.goals}</span><span role="cell">{player.assists}</span>
            <strong role="cell">{player.points}</strong><span role="cell">{player.pim}</span>
          </div>
        ))}
      </div>

      <div className="goalie-table-heading">GOALTENDING</div>
      <div className="player-stats-table goalie-stats-table" role="table" aria-label="Carleton Ravens goaltending statistics">
        <div className="player-stat-row player-stat-head goalie-stat-row" role="row">
          <span role="columnheader">#</span><span role="columnheader">Player</span><span role="columnheader">GP</span><span role="columnheader">W–L</span><span role="columnheader">SA</span><span role="columnheader">SV</span><span role="columnheader">GAA</span><span role="columnheader">SV%</span>
        </div>
        <div className="player-stat-row goalie-stat-row goalie-player-row" role="row">
          <span role="cell" className="jersey-number">{goalie.number}</span>
          <span role="cell" className="player-name">{goalie.name}</span>
          <span role="cell">{goalie.gp}</span><span role="cell">{goalie.wins}–{goalie.losses}</span><span role="cell">{goalie.shotsAgainst}</span><span role="cell">{goalie.shotsAgainst - goalie.goalsAgainst}</span><span role="cell">{goalie.goalsAgainstAverage.toFixed(2)}</span><span role="cell">{goalie.savePercentage.toFixed(3).replace(/^0/, "")}</span>
        </div>
      </div>

      <div className="stats-source">
        <div><span className={`live-dot ${feedStatus === "fallback" ? "is-fallback" : ""}`} /><strong>{feedStatus === "live" ? "LIVE GAMESHEET DATA" : feedStatus === "loading" ? "REFRESHING GAMESHEET" : "VERIFIED FALLBACK"}</strong></div>
        <p>{feedStatus === "live" ? "Roster and statistics refresh every five minutes" : "Verified from the supplied CUFLA 2026 Carleton team page · September 2026"}</p>
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
      <div className="source-note"><span className="live-dot" />10 team staff · Updated September 2026</div>
      <div className="staff-grid">
        {staff.map((person) => (
          <article className="staff-card" key={person.detail}>
            <div className="staff-placeholder">
              <img src={`${STAFF_PHOTO_BASE_URL}/${person.photo}`} alt={`${person.detail}, ${person.role}`} loading="lazy" />
            </div>
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
        <div><Icon name="mail" size={26} /><span>GENERAL RECRUITMENT CONTACT</span><strong>carletonlacrosse@gmail.com</strong></div>
        <a href="mailto:carletonlacrosse@gmail.com">Send an email <Icon name="arrow" /></a>
      </div>
    </section>
  );
}

function Recruiting() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    try {
      return localStorage.getItem(RECRUITING_SUBMITTED_KEY) === "true";
    } catch {
      return false;
    }
  });

  async function submitRecruitingForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasSubmitted) return;
    const form = event.currentTarget;
    const formBody = new URLSearchParams();
    new FormData(form).forEach((value, key) => formBody.append(key, String(value)));
    setFormStatus("submitting");

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formBody,
      });
      form.reset();
      try {
        localStorage.setItem(RECRUITING_SUBMITTED_KEY, "true");
      } catch {
        // The completed state still remains locked for the current page session.
      }
      setHasSubmitted(true);
      setFormStatus("success");
    } catch (error) {
      console.error(error);
      setFormStatus("error");
    }
  }

  return (
    <section className="data-section recruiting-section reveal">
        <div className="section-heading recruiting-heading">
          <div><div className="eyebrow dark">BECOME A RAVEN</div><h2>RECRUITING</h2></div>
          <div className="recruiting-heading-copy">
            <p>Tell our coaching staff about your academic goals and lacrosse experience. Required fields are marked with an asterisk.</p>
          </div>
        </div>

        {hasSubmitted ? (
          <div className="recruiting-form recruiting-complete">
            <div className="recruiting-form-banner">
              <strong>PROSPECT INFORMATION</strong>
              <span>CUFLA · EAST DIVISION</span>
            </div>
            <div className="recruiting-complete-content">
              <span aria-hidden="true">✓</span>
              <h3>PROFILE ALREADY SUBMITTED</h3>
              <p>Your recruiting information has been received from this browser. Contact the team if you need to correct or update your submission.</p>
              <a href="mailto:carletonlacrosse@gmail.com">carletonlacrosse@gmail.com</a>
            </div>
          </div>
        ) : (
        <form className="recruiting-form" id="recruitingForm" onSubmit={submitRecruitingForm}>
        <div className="recruiting-form-banner">
          <strong>PROSPECT INFORMATION</strong>
          <span>CUFLA · EAST DIVISION</span>
        </div>
        <div className="recruiting-form-content">
          <div className="form-grid">
            <label className="form-field">
              <span>First Name <b>*</b></span>
              <input type="text" name="firstName" autoComplete="given-name" placeholder="e.g. John" required />
            </label>
            <label className="form-field">
              <span>Last Name <b>*</b></span>
              <input type="text" name="lastName" autoComplete="family-name" placeholder="e.g. Doe" required />
            </label>
            <label className="form-field">
              <span>Email Address <b>*</b></span>
              <input type="email" name="email" autoComplete="email" placeholder="athlete@email.com" required />
            </label>
            <label className="form-field">
              <span>Phone Number <b>*</b></span>
              <input type="tel" name="phone" autoComplete="tel" placeholder="(613) 555-0199" required />
            </label>
            <label className="form-field">
              <span>Home Town <b>*</b></span>
              <input type="text" name="hometown" autoComplete="address-level2" placeholder="e.g. Ottawa, ON" required />
            </label>
            <label className="form-field">
              <span>Intended Area of Study <b>*</b></span>
              <input type="text" name="areaOfStudy" placeholder="e.g. Commerce, Engineering" required />
            </label>
            <label className="form-field">
              <span>Position(s) <b>*</b></span>
              <input type="text" name="positions" placeholder="e.g. Attack, Midfield, LSM" required />
            </label>
            <label className="form-field">
              <span>Dominant Hand <b>*</b></span>
              <select name="dominantHand" defaultValue="" required>
                <option value="" disabled>Select Hand...</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>
            </label>
            <label className="form-field">
              <span>Height <b>*</b></span>
              <input type="text" name="height" placeholder={'e.g. 6′2"'} required />
            </label>
            <label className="form-field">
              <span>Weight (lbs) <b>*</b></span>
              <input type="number" name="weight" min="1" placeholder="e.g. 195" required />
            </label>
            <label className="form-field">
              <span>Link to Highlights <em>(Optional)</em></span>
              <input type="url" name="highlights" placeholder="https://youtube.com/... or Hudl link" />
            </label>
            <label className="form-field">
              <span>Instagram <em>(Optional)</em></span>
              <input type="text" name="instagram" placeholder="@username" />
            </label>
            <label className="form-field form-field-full">
              <span>Message to Coaching Staff <em>(Optional)</em></span>
              <textarea name="coachMessage" rows={5} placeholder="Share your club/high school team history, academic goals, or any questions for the coaching staff..." />
            </label>
          </div>

          <div className="form-submit-row">
            <button type="submit" id="submitBtn" disabled={formStatus === "submitting"}>
              {formStatus === "submitting" ? "Submitting..." : "Submit Player Profile"}
              <Icon name="arrow" />
            </button>
            <div
              className={`form-message ${formStatus === "success" ? "is-success" : formStatus === "error" ? "is-error" : ""}`}
              id="formMessage"
              role="status"
              aria-live="polite"
            >
              {formStatus === "success" && "✓ Profile logged. Check your email for confirmation."}
              {formStatus === "error" && "Error submitting form. Please try again."}
            </div>
          </div>
        </div>
        </form>
        )}
    </section>
  );
}
