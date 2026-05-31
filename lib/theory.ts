// コードシンボルを音名配列（オクターブ付き）に変換するユーティリティ。
// 例: "C" → ["C2", "C3", "E3", "G3"]、"G7" → ["G1", "G2", "B2", "D3", "F3"]
//
// ボイシング方針（仕様より）:
//   - ルートを低音域に1音（ベース）
//   - コードトーンを中音域に基本ポジションで重ねる

const PC: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const PC_NAME = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// コードタイプ → ルートからの半音インターバル
// 長い表記から先にマッチさせるため、判定は parseQuality 側で順序管理する。
const QUALITY: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  mMaj7: [0, 3, 7, 11],
  maj6: [0, 4, 7, 9],
  min6: [0, 3, 7, 9],
};

interface ParsedChord {
  rootPc: number;
  bassPc: number;
  intervals: number[];
}

function parseRoot(s: string): { pc: number; rest: string } {
  // 2文字（C#, Bb...）を優先して判定
  const two = s.slice(0, 2);
  if (PC[two] !== undefined && (two[1] === "#" || two[1] === "b")) {
    return { pc: PC[two], rest: s.slice(2) };
  }
  const one = s.slice(0, 1);
  if (PC[one] !== undefined) return { pc: PC[one], rest: s.slice(1) };
  return { pc: 0, rest: s.slice(1) };
}

function parseQuality(rest: string): number[] {
  // 表記ゆれを正規化
  const q = rest
    .replace(/\s+/g, "")
    .replace(/△/g, "maj")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

  // half-diminished
  if (/^m7b5$|^min7b5$|^ø7?$/.test(q)) return QUALITY.m7b5;
  // minor major7
  if (/^m\(?maj7\)?$|^mM7$|^minmaj7$/.test(q)) return QUALITY.mMaj7;
  // diminished 7 / dim
  if (/^dim7$|^o7$/.test(q)) return QUALITY.dim7;
  if (/^dim$|^o$/.test(q)) return QUALITY.dim;
  // augmented
  if (/^aug$|^\+$/.test(q)) return QUALITY.aug;
  // sixth
  if (/^m6$|^min6$/.test(q)) return QUALITY.min6;
  if (/^6$/.test(q)) return QUALITY.maj6;
  // major 7
  if (/^maj7$|^M7$/.test(q)) return QUALITY.maj7;
  // minor 7
  if (/^m7$|^min7$/.test(q)) return QUALITY.min7;
  // dominant 7
  if (/^7$/.test(q)) return QUALITY.dom7;
  // minor triad
  if (/^m$|^min$|^-$/.test(q)) return QUALITY.min;
  // default: major triad（"" や "maj" など）
  return QUALITY.maj;
}

export function parseChord(chord: string): ParsedChord {
  let work = chord.trim();
  let bassStr: string | null = null;
  const slash = work.indexOf("/");
  if (slash !== -1) {
    bassStr = work.slice(slash + 1);
    work = work.slice(0, slash);
  }
  const { pc: rootPc, rest } = parseRoot(work);
  const intervals = parseQuality(rest);
  const bassPc = bassStr ? parseRoot(bassStr).pc : rootPc;
  return { rootPc, bassPc, intervals };
}

export function midiToName(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1; // MIDI 60 = C4
  return `${PC_NAME[pc]}${octave}`;
}

export function pcToMidi(pc: number, octave: number): number {
  return (octave + 1) * 12 + pc;
}

/**
 * コード名 → 音名配列。ベース（オクターブ2）＋ 中音域（オクターブ3〜）の基本ポジション。
 */
export function chordToNotes(chord: string, baseOctave = 3): string[] {
  const { rootPc, bassPc, intervals } = parseChord(chord);
  const notes: string[] = [];

  // ベース音（低音域）
  notes.push(midiToName(pcToMidi(bassPc, 2)));

  // コードトーン（中音域、基本ポジションで上行）
  const rootMidi = pcToMidi(rootPc, baseOctave);
  for (const iv of intervals) {
    notes.push(midiToName(rootMidi + iv));
  }
  return notes;
}

/**
 * コードパッド用の音名配列。低音ベースは省き、中音域（オクターブ3〜）のコードトーンのみ。
 * ベースラインと低域がぶつからないようにするため。
 */
export function chordToPadNotes(chord: string, baseOctave = 3): string[] {
  const { rootPc, intervals } = parseChord(chord);
  const rootMidi = pcToMidi(rootPc, baseOctave);
  return intervals.map((iv) => midiToName(rootMidi + iv));
}

/**
 * ベースライン1小節分（8分音符×8）の音名配列。
 * ルート→オクターブ上→ルート→5th… を行き来する丸いベースパターン。
 */
export function bassPattern(chord: string): string[] {
  const { bassPc, rootPc, intervals } = parseChord(chord);
  // スラッシュコードはベース音（分母）を、それ以外はルートを土台にする
  const lowPc = bassPc;
  const fifthIv = intervals[2] ?? 7; // [0, 3rd, 5th, ...] の5th。dim=6 / aug=8 にも対応
  const lowMidi = pcToMidi(lowPc, 2); // C2〜B2 あたり
  const octUp = lowMidi + 12;
  const fifth = pcToMidi(rootPc, 2) + fifthIv;
  const R = midiToName(lowMidi);
  const O = midiToName(octUp);
  const F = midiToName(fifth);
  // 8分音符8つ: R O R F R O F O
  return [R, O, R, F, R, O, F, O];
}

/**
 * アルペジオ/コンピング1小節分（8分音符×8）の音名配列。
 * コードトーンを中高音域（オクターブ4）で上昇→下降。
 */
export function arpPattern(chord: string): string[] {
  const { rootPc, intervals } = parseChord(chord);
  const rootMidi = pcToMidi(rootPc, 4);
  const tones = intervals.map((iv) => rootMidi + iv);
  // 上昇 → 端を除いた下降（例 3音: 0 1 2 1 / 4音: 0 1 2 3 2 1）
  const seq = [...tones];
  for (let i = tones.length - 2; i >= 1; i--) seq.push(tones[i]);
  // 8分音符8つになるようループ
  const out: string[] = [];
  for (let i = 0; i < 8; i++) out.push(midiToName(seq[i % seq.length]));
  return out;
}
