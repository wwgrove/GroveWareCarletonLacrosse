// Shared by the browser app and scripts/update-gamesheet-data.ts (must use only erasable TS syntax).

export type ScheduleGame = {
  date: string;
  opponent: string;
  venue: string;
  game: string;
  home: boolean;
  result: string;
};

export type GamesheetGame = {
  number: string;
  date: string;
  time: string;
  status: string;
  location: string;
  visitor: { id: number; title: string; goals: number; result: string };
  home: { id: number; title: string; goals: number; result: string };
};

export type PlayerStat = {
  number: string;
  name: string;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  pim: number;
};

export type GoalieStat = {
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

export type TeamStandings = {
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

export type GamesheetTeamData = {
  roster: { number: string; name: string }[];
  playerStats: PlayerStat[];
  goalie: GoalieStat;
  standings: TeamStandings;
};

export const CARLETON_TEAM_ID = 550883;
export const GAMESHEET_TEAM_SOURCE = "https://gamesheetstats.com/seasons/15751/teams/550883/roster?configuration=625";
export const GAMESHEET_SCHEDULE_SOURCE = GAMESHEET_TEAM_SOURCE.replace("/roster?", "/schedule?");

export function extractGamesheetGames(html: string): GamesheetGame[] {
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

export function normalizeSchedule(games: GamesheetGame[]): ScheduleGame[] {
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
export const roster = [
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

export function parseGamesheetTeamData(html: string): GamesheetTeamData {
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
