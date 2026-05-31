// モードごとの直近スコアを localStorage に保存するヘルパー。

import type { Mode } from "@/data/songs";

export interface ModeProgress {
  /** 直近スコア（正解数） */
  score: number;
  /** 問題総数 */
  total: number;
  /** 一度でも完了したか */
  played: boolean;
}

const KEY = "chord-analysis-lab:progress";

type ProgressMap = Record<string, ModeProgress>;

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function getProgress(mode: Mode): ModeProgress {
  return readAll()[mode] ?? { score: 0, total: 0, played: false };
}

export function setProgress(mode: Mode, value: ModeProgress): void {
  if (typeof window === "undefined") return;
  const all = readAll();
  // ベストスコアを保持
  const prev = all[mode];
  if (!prev || value.score >= prev.score) {
    all[mode] = value;
    window.localStorage.setItem(KEY, JSON.stringify(all));
  }
}
