// server/src/leaderboard.ts

import * as fs from "fs";
import * as path from "path";
import { HighScore } from "./types"; // ייבוא ה-Interface מהמודול types

// הגדרת נתיב הקובץ
const LEADERBOARD_FILE = path.join(__dirname, "leaderboard.json");
let leaderboard: HighScore[] = [];

/**
 * טוען את נתוני ה-Leaderboard מקובץ JSON.
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
 * שומר את נתוני ה-Leaderboard (10 השיאים הטובים ביותר) לקובץ JSON.
 */
export const saveLeaderboard = (): void => {
  try {
    // שמור רק את 10 התוצאות הטובות ביותר
    const topScores = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(topScores, null, 2));
  } catch (e) {
    console.error("Error saving leaderboard:", e);
  }
};

/**
 * מוסיף תוצאה חדשה ל-Leaderboard ושומר את הרשימה המעודכנת.
 * @param name שם השחקן
 * @param score הציון שהושג
 */
export const addScoreToLeaderboard = (name: string, score: number): void => {
  if (score > 0) {
    const newScore: HighScore = {
      name,
      score,
      date: new Date().toISOString(),
    };
    leaderboard.push(newScore);
    saveLeaderboard();
    console.log(`Score submitted: ${name} with ${score}`);
  }
};

/**
 * מחזיר את 10 השיאים הטובים ביותר, ממוינים מהגבוה לנמוך.
 */
export const getTopScores = (): HighScore[] => {
  return leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
};
