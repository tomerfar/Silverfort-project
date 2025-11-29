import * as fs from "fs";
import * as path from "path";
import { HighScore } from "./types";

const LEADERBOARD_FILE = path.join(__dirname, "..", "leaderboard.json");
let leaderboard: HighScore[] = [];

/**
 * Saves the current leaderboard data (top 10 scores) to the JSON file.
 * This function also sorts and slices the global array before writing.
 */
const saveLeaderboard = (): void => {
  try {
    // Sort the entire array and keep only the top 10 scores.
    // This step ensures that the leaderboard array remains optimized in memory
    // and ready for quick retrieval via getTopScores.
    const topScores = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Update the global array with the top 10 sorted scores
    leaderboard = topScores;

    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
  } catch (e) {
    console.error("Error saving leaderboard:", e);
  }
};

/**
 * Loads the leaderboard data from the JSON file into memory.
 */
export const loadLeaderboard = (): void => {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, "utf-8");
      leaderboard = JSON.parse(data);
      console.log(`Leaderboard loaded with ${leaderboard.length} entries.`);
    }
  } catch (e) {
    console.error("Error loading leaderboard:", e);
  }
};

/**
 * Adds a new score to the leaderboard array and saves the updated list.
 * Only scores greater than 0 are added.
 * @param name Player's name.
 * @param score The score achieved.
 */
export const addScoreToLeaderboard = (name: string, score: number): void => {
  if (score > 0) {
    const newScore: HighScore = {
      name,
      score,
      date: new Date().toISOString(),
    };

    // Check if the new score is high enough to be in the current top 10
    // If the list is already 10 elements long and the new score is lower than the lowest score, we skip saving.
    if (
      leaderboard.length < 10 ||
      score > leaderboard[leaderboard.length - 1].score
    ) {
      leaderboard.push(newScore);
      saveLeaderboard();
    }
  }
};

/**
 * Returns the top 10 scores, sorted high to low.
 * Since saveLeaderboard keeps the global 'leaderboard' array sorted and sliced to 10,
 * we only need to return a copy.
 */
export const getTopScores = (): HighScore[] => {
  return leaderboard.slice();
};
