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

async function download(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; CarletonLacrosseSite/1.0)", accept: "text/html" },
  });
  if (!response.ok) throw new Error(`Gamesheet returned ${response.status} for ${url}`);
  return response.text();
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
