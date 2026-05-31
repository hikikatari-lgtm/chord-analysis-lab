// Tone.js でコード進行を再生する。
// SSR 対策: top-level の `import * as Tone` は避け、ブラウザでのみ動的 import する
//（reference: theory-lab の lib/audio.ts と同じ方針）。
//
// iOS Safari 対策（重要）:
//  - AudioContext はユーザー操作（タッチ）の「中」で start/resume しないと起動しない。
//  - 動的 import はネットワークを伴う本物の async 処理で、タップ後に走らせると
//    ジェスチャー文脈が切れて AudioContext が suspended のままになる。
//    → モジュールとシンセは preloadAudio() でタップ前に用意しておき、
//      タップ時のハンドラでは Tone.start()/resume() だけを最初に実行する。

import { chordToNotes } from "./theory";

type ToneModule = typeof import("tone");

let tonePromise: Promise<ToneModule> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let synth: any = null;

function loadTone(): Promise<ToneModule> | null {
  if (typeof window === "undefined") return null;
  if (!tonePromise) tonePromise = import("tone");
  return tonePromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSynth(Tone: ToneModule): any {
  if (synth) return synth;
  // PolySynth を toDestination() でチェーンしたリバーブに接続（サンプラーは使わない＝外部URL不要）
  const reverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.02,
    wet: 0.22,
  }).toDestination();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.012, decay: 0.3, sustain: 0.4, release: 1.6 },
  }).connect(reverb);
  synth.volume.value = -4; // iPhone でも十分聞こえる音量
  return synth;
}

/**
 * マウント時に呼ぶ。Tone モジュールを先読みし、シンセも組み立てておく。
 * （タップ前に import を済ませることで iOS のジェスチャー文脈を壊さない）
 * AudioContext はこの時点では suspended のままで問題ない。
 */
export async function preloadAudio(): Promise<void> {
  const p = loadTone();
  if (!p) return;
  try {
    const Tone = await p;
    buildSynth(Tone);
  } catch {
    /* 先読み失敗は無視。実再生時に再試行される */
  }
}

/**
 * AudioContext を開始/再開する。**必ずユーザー操作（タップ/クリック）のハンドラ内で呼ぶこと。**
 * iOS では start() に加えて resume() が必要な場合がある。
 * @returns context が running になったか
 */
export async function ensureAudio(): Promise<boolean> {
  const p = loadTone();
  if (!p) return false;
  const Tone = await p; // preload 済みなら即解決（ネットワーク待ちが無い）

  // 1) ユーザー操作内で AudioContext を起動
  await Tone.start();

  // 2) iOS Safari: まだ running でなければ明示的に resume
  const ctx = Tone.getContext();
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {
      /* noop */
    }
  }

  // 3) 状態を確認（iPhone のリモートデバッグ用）— "running" であること
  // eslint-disable-next-line no-console
  console.log("[audio] AudioContext state:", ctx.state);

  // 4) シンセを用意
  buildSynth(Tone);

  return ctx.state === "running" && !!synth;
}

/** 進行中の音を止める */
export async function stopAudio(): Promise<void> {
  const p = loadTone();
  if (!p) return;
  const Tone = await p;
  if (synth) {
    synth.releaseAll(Tone.now());
  }
}

/**
 * コード進行を順番に再生する。各コードを2拍ずつ鳴らす。
 * 呼び出し側は、これより前に（同じタップ内で）ensureAudio() を済ませておくこと。
 * @returns 全体の再生時間(ms)。UI の「再生中」状態の制御に使う。
 */
export async function playProgression(
  chords: string[],
  bpm = 100,
  onStep?: (index: number) => void,
): Promise<number> {
  const ok = await ensureAudio();
  const p = loadTone();
  if (!ok || !p || !synth) return 0;
  const Tone = await p;

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
