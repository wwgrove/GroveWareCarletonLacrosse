import { mkdir, writeFile } from "node:fs/promises";
import {
  CARLETON_TEAM_ID,
  GAMESHEET_SCHEDULE_SOURCE,
  GAMESHEET_TEAM_SOURCE,
  extractGamesheetGames,
  normalizeSchedule,
  parseGamesheetTeamData,
} from "../src/gamesheet.ts";

const OUTPUT_DIR = new URL("../public/data/", import.meta.url);
const MIN_ROSTER_SIZE = 20;
const EXPECTED_GAMES = 10;

const BROWSER_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-CA,en;q=0.9",
  referer: "https://gamesheetstats.com/",
};

async function download(url: string, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { headers: BROWSER_HEADERS });
      if (!response.ok) throw new Error(`Gamesheet returned ${response.status} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw lastError;
}

const [teamHtml, scheduleHtml] = await Promise.all([download(GAMESHEET_TEAM_SOURCE), download(GAMESHEET_SCHEDULE_SOURCE)]);

const team = parseGamesheetTeamData(teamHtml);
const rawGames = extractGamesheetGames(scheduleHtml);
const schedule = normalizeSchedule(rawGames);

if (team.roster.length < MIN_ROSTER_SIZE) throw new Error(`Roster too small: ${team.roster.length}`);
const { standings } = team;
if (!standings.record || !Number.isFinite(standings.points) || !Number.isFinite(standings.rank) || standings.rank < 1 ||
    !Number.isInteger(standings.gamesPlayed) || standings.gamesPlayed < 0) {
  throw new Error("Standings were invalid");
}
if (!rawGames.some((game) => game.home.id === CARLETON_TEAM_ID || game.visitor.id === CARLETON_TEAM_ID)) {
  throw new Error("Expected team ID was not found in the schedule");
}
if (rawGames.some((game) => game.home.id !== CARLETON_TEAM_ID && game.visitor.id !== CARLETON_TEAM_ID)) {
  throw new Error("Schedule contains games for another team");
}
if (schedule.length < EXPECTED_GAMES) throw new Error(`Schedule too short: ${schedule.length}`);

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(new URL("team.json", OUTPUT_DIR), `${JSON.stringify(team, null, 2)}\n`);
await writeFile(new URL("schedule.json", OUTPUT_DIR), `${JSON.stringify(schedule, null, 2)}\n`);
console.log(`Wrote ${team.roster.length} players and ${schedule.length} games`);
