// Tone.js でコード進行を「バンドサウンド」として再生する。
// 4パート（コードパッド / ベース / ドラム / アルペジオ）を Tone.Transport + Tone.Part で
// 正確にスケジューリングして、曲として聞こえる再生にする。
//
// SSR 対策: top-level の `import * as Tone` は避け、ブラウザでのみ動的 import する。
//
// iOS Safari 対策（重要）:
//  - AudioContext はユーザー操作（タッチ）の「中」で start/resume しないと起動しない。
//  - 動的 import はネットワークを伴う本物の async 処理で、タップ後に走らせると
//    ジェスチャー文脈が切れて AudioContext が suspended のままになる。
//    → 楽器は preloadAudio() でタップ前に用意し、タップ時のハンドラでは
//      ensureAudio()（Tone.start/resume）を最初に実行する。

import { arpPattern, bassPattern, chordToPadNotes } from "./theory";

type ToneModule = typeof import("tone");

let tonePromise: Promise<ToneModule> | null = null;

// 各楽器（プリロード時に生成して使い回す）
interface Band {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pad: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bass: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kick: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snare: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snareBody: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hihat: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arp: any;
}
let band: Band | null = null;

// 現在鳴っている Tone.Part 群（停止時に dispose する）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeParts: any[] = [];

// UI コールバック用のタイマー（停止時に clear する）
let uiTimers: number[] = [];

function clearUiTimers(): void {
  for (const id of uiTimers) window.clearTimeout(id);
  uiTimers = [];
}

function loadTone(): Promise<ToneModule> | null {
  if (typeof window === "undefined") return null;
  if (!tonePromise) tonePromise = import("tone");
  return tonePromise;
}

function buildBand(Tone: ToneModule): Band {
  if (band) return band;

  // 1) コードパッド: PolySynth を持続音（パッド風）。リバーブでふわっと、控えめ音量。
  const padReverb = new Tone.Reverb({ decay: 3, preDelay: 0.02, wet: 0.35 }).toDestination();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.06, decay: 0.4, sustain: 0.7, release: 1.5 },
  }).connect(padReverb);
  pad.volume.value = -12;

  // 2) ベース: サイン波ベースの丸い音
  const bass = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 },
  }).toDestination();
  bass.volume.value = -7;

  // 3) ドラム
  // キック: MembraneSynth（低音、pitchDecay 大きめ）
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
  }).toDestination();
  kick.volume.value = -4;

  // スネア: NoiseSynth + MembraneSynth のレイヤー
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  }).toDestination();
  snare.volume.value = -12;
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
  }).toDestination();
  snareBody.volume.value = -16;

  // ハイハット: NoiseSynth（短いエンベロープ）+ ハイパスフィルター
  const hihatFilter = new Tone.Filter(7000, "highpass").toDestination();
  const hihat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0 },
  }).connect(hihatFilter);
  hihat.volume.value = -20;

  // 4) アルペジオ/コンピング: 三角波 + ローパスで明るめ。控えめ音量。
  const arpFilter = new Tone.Filter(3200, "lowpass").toDestination();
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.2 },
  }).connect(arpFilter);
  arp.volume.value = -15;

  band = { pad, bass, kick, snare, snareBody, hihat, arp };
  return band;
}

/**
 * マウント時に呼ぶ。Tone モジュールと全楽器を先読みしておく。
 * （タップ前に import を済ませることで iOS のジェスチャー文脈を壊さない）
 */
export async function preloadAudio(): Promise<void> {
  const p = loadTone();
  if (!p) return;
  try {
    const Tone = await p;
    buildBand(Tone);
  } catch {
    /* 先読み失敗は無視。実再生時に再試行される */
  }
}

/**
 * AudioContext を開始/再開する。**必ずユーザー操作（タップ/クリック）のハンドラ内で呼ぶこと。**
 * @returns context が running になったか
 */
export async function ensureAudio(): Promise<boolean> {
  const p = loadTone();
  if (!p) return false;
  const Tone = await p; // preload 済みなら即解決

  await Tone.start();
  const ctx = Tone.getContext();
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {
      /* noop */
    }
  }
  // eslint-disable-next-line no-console
  console.log("[audio] AudioContext state:", ctx.state);

  buildBand(Tone);
  return ctx.state === "running" && !!band;
}

/** 再生中の全パートを止めて Transport をリセットする */
export async function stopAudio(): Promise<void> {
  const p = loadTone();
  if (!p) return;
  const Tone = await p;
  clearUiTimers();
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel(0);
  for (const part of activeParts) {
    try {
      part.dispose();
    } catch {
      /* noop */
    }
  }
  activeParts = [];
  // 残響/鳴り残しを止める
  if (band) {
    try {
      band.pad.releaseAll?.(Tone.now());
    } catch {
      /* noop */
    }
  }
}

interface PlayCallbacks {
  /** 各コード（小節）の頭で、再生中のコード index を通知 */
  onStep?: (index: number) => void;
  /** 進行の再生が終わったときに通知 */
  onEnd?: () => void;
}

/**
 * コード進行をバンドサウンドで再生する。各コード = 1小節（4/4）。
 * 呼び出し側は、これより前に（同じタップ内で）ensureAudio() を済ませておくこと。
 * @returns 全体の再生時間(ms)
 */
export async function playProgression(
  chords: string[],
  bpm = 100,
  cb: PlayCallbacks = {},
): Promise<number> {
  const ok = await ensureAudio();
  const p = loadTone();
  if (!ok || !p || !band) return 0;
  const Tone = await p;

  // 既存の再生を停止してクリーン状態に
  await stopAudio();

  const transport = Tone.getTransport();
  transport.bpm.value = bpm;
  transport.timeSignature = 4;

  // ── イベントを組み立てる（時刻は "小節:拍:16分" 表記） ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chordEvents: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bassEvents: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arpEvents: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drumEvents: any[] = [];

  const eighthTime = (bar: number, e: number) =>
    `${bar}:${Math.floor(e / 2)}:${(e % 2) * 2}`; // 8分音符の位置

  chords.forEach((chord, bar) => {
    // コードパッド（小節頭、全音符で持続）
    chordEvents.push({ time: `${bar}:0:0`, notes: chordToPadNotes(chord), index: bar });

    // ベース（8分音符×8）
    bassPattern(chord).forEach((note, e) => {
      bassEvents.push({ time: eighthTime(bar, e), note });
    });

    // アルペジオ（8分音符×8）
    arpPattern(chord).forEach((note, e) => {
      arpEvents.push({ time: eighthTime(bar, e), note });
    });

    // ドラム: キック=1・3拍 / スネア=2・4拍 / ハイハット=8分
    drumEvents.push({ time: `${bar}:0:0`, type: "kick" });
    drumEvents.push({ time: `${bar}:2:0`, type: "kick" });
    drumEvents.push({ time: `${bar}:1:0`, type: "snare" });
    drumEvents.push({ time: `${bar}:3:0`, type: "snare" });
    for (let e = 0; e < 8; e++) {
      drumEvents.push({ time: eighthTime(bar, e), type: "hihat" });
    }
  });

  const b = band;

  // 音はサンプル精度の Transport/Part で鳴らす（パッドのみ。onStep は別途 setTimeout で UI 同期）
  const chordPart = new Tone.Part((time: number, ev: { notes: string[] }) => {
    b.pad.triggerAttackRelease(ev.notes, "1n", time);
  }, chordEvents);

  const bassPart = new Tone.Part((time: number, ev: { note: string }) => {
    b.bass.triggerAttackRelease(ev.note, "8n", time);
  }, bassEvents);

  const arpPart = new Tone.Part((time: number, ev: { note: string }) => {
    b.arp.triggerAttackRelease(ev.note, "8n", time);
  }, arpEvents);

  const drumPart = new Tone.Part((time: number, ev: { type: string }) => {
    if (ev.type === "kick") {
      b.kick.triggerAttackRelease("C1", "8n", time);
    } else if (ev.type === "snare") {
      b.snare.triggerAttackRelease("16n", time);
      b.snareBody.triggerAttackRelease("G2", "16n", time);
    } else if (ev.type === "hihat") {
      b.hihat.triggerAttackRelease("32n", time);
    }
  }, drumEvents);

  activeParts = [chordPart, bassPart, arpPart, drumPart];
  for (const part of activeParts) part.start(0);

  transport.position = 0;
  transport.start();

  // UI 同期（コードカードのハイライト・終了通知）は setTimeout で駆動する。
  // Tone.Draw は requestAnimationFrame 依存でタブ非表示時に止まるため、こちらの方が堅牢。
  const totalBars = chords.length;
  const msPerBar = (4 * 60) / bpm * 1000;
  clearUiTimers();
  for (let bar = 0; bar < totalBars; bar++) {
    uiTimers.push(
      window.setTimeout(() => cb.onStep?.(bar), Math.round(bar * msPerBar)),
    );
  }
  uiTimers.push(
    window.setTimeout(() => cb.onEnd?.(), Math.round(totalBars * msPerBar)),
  );

  return totalBars * msPerBar;
}
