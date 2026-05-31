// Tone.js でコード進行を再生する。
// SSR 対策: top-level の `import * as Tone` は避け、ブラウザでのみ動的 import する
//（reference: theory-lab の lib/audio.ts と同じ方針）。

import { chordToNotes } from "./theory";

// 動的 import した Tone モジュールと PolySynth をキャッシュ
type ToneModule = typeof import("tone");

let tonePromise: Promise<ToneModule> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let synth: any = null;
let started = false;

async function loadTone(): Promise<ToneModule | null> {
  if (typeof window === "undefined") return null;
  if (!tonePromise) tonePromise = import("tone");
  return tonePromise;
}

/**
 * AudioContext を開始しシンセを用意する。
 * 必ずユーザー操作（ボタンクリック）のハンドラ内で呼ぶこと。
 */
export async function ensureAudio(): Promise<boolean> {
  const Tone = await loadTone();
  if (!Tone) return false;
  if (!started) {
    await Tone.start();
    started = true;
  }
  if (!synth) {
    const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.02, wet: 0.25 }).toDestination();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.012, decay: 0.3, sustain: 0.4, release: 1.6 },
    }).connect(reverb);
    synth.volume.value = -8;
  }
  return true;
}

/** 進行中の音を止める */
export async function stopAudio(): Promise<void> {
  const Tone = await loadTone();
  if (Tone && synth) {
    synth.releaseAll(Tone.now());
  }
}

/**
 * コード進行を順番に再生する。各コードを2拍ずつ鳴らす。
 * @returns 全体の再生時間(ms)。UI の「再生中」状態の制御に使う。
 */
export async function playProgression(
  chords: string[],
  bpm = 100,
  onStep?: (index: number) => void,
): Promise<number> {
  const Tone = await loadTone();
  const ok = await ensureAudio();
  if (!Tone || !ok || !synth) return 0;

  const beat = 60 / bpm;
  const dur = beat * 2; // 2拍ずつ
  const now = Tone.now() + 0.06;

  chords.forEach((c, i) => {
    const notes = chordToNotes(c);
    const t = now + i * dur;
    synth.triggerAttackRelease(notes, dur * 0.92, t);
    if (onStep) {
      // 各コードの発音タイミングで UI にステップ通知
      const delayMs = (t - Tone.now()) * 1000;
      window.setTimeout(() => onStep(i), Math.max(0, delayMs));
    }
  });

  return chords.length * dur * 1000;
}
