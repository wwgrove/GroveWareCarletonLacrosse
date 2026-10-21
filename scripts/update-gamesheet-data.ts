import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import {
  CARLETON_TEAM_ID,
  GAMESHEET_SCHEDULE_SOURCE,
  GAMESHEET_STATS_SOURCE,
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

// Gamesheet sits behind Cloudflare, so plain fetch() gets 403 from CI. A real Chromium solves the JS challenge.
async function downloadAll(urls: string[]) {
  const browser = await chromium.launch({ headless: true, args: ["--disable-blink-features=AutomationControlled"] });
  try {
    const context = await browser.newContext({
      userAgent: BROWSER_HEADERS["user-agent"],
      locale: "en-CA",
      timezoneId: "America/Toronto",
    });
    const pages: string[] = [];
    for (const url of urls) {
      const page = await context.newPage();
      let html = "";
      for (let attempt = 1; attempt <= 3; attempt++) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        // Wait out Cloudflare's "Just a moment..." interstitial.
        await page.waitForFunction(() => !/just a moment/i.test(document.title), undefined, { timeout: 45_000 }).catch(() => {});
        await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
        html = await page.content();
        if (!/just a moment/i.test(await page.title())) break;
        html = "";
        await page.waitForTimeout(attempt * 3000);
      }
      await page.close();
      if (!html) throw new Error(`Cloudflare challenge was not solved for ${url}`);
      pages.push(html);
    }
    return pages;
  } finally {
    await browser.close();
  }
}

const [rosterHtml, statsHtml, scheduleHtml] = await downloadAll([
  GAMESHEET_TEAM_SOURCE,
  GAMESHEET_STATS_SOURCE,
  GAMESHEET_SCHEDULE_SOURCE,
]);

// Stats live on the team-stats page and the roster on the roster page; either may carry the full payload.
const team = [statsHtml, rosterHtml, statsHtml + rosterHtml].reduce<ReturnType<typeof parseGamesheetTeamData> | null>(
  (found, html) => {
    if (found) return found;
    try {
      return parseGamesheetTeamData(html);
    } catch (error) {
      console.warn(`Team payload parse attempt failed: ${(error as Error).message}`);
      return null;
    }
  },
  null,
);
if (!team) throw new Error("Could not parse Gamesheet team data from stats or roster pages");
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
