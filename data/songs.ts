// 収録曲データ。各曲は「コード進行」と「ローマ数字分析」を持ち、
// Visual Analysis（コード→ローマ数字）と Ear Analysis（音→コード）の両モードで出題できる。
//
// 設問の選択肢は seed の distractor から動的に組み立てる（buildChoices）。
// 正解の位置は id から決まる決定的シャッフルなので、SSR とクライアントで一致する。

export type Mode = "visual" | "ear";
export type Level = "beginner" | "intermediate" | "advanced";

export interface SongSeed {
  id: string;
  songTitle: string;
  artist: string;
  key: string;
  section?: string;
  chords: string[]; // 実際のコード進行
  romanNumerals: string[]; // 正しいローマ数字分析
  modes: Mode[];
  level: Level;
  genre: string;
  /** Visual: 誤りのローマ数字分析（2件） */
  romanDistractors: string[][];
  /** Ear: 誤りのコード進行（2件） */
  chordDistractors: string[][];
  explanation: string;
  bpm?: number;
}

export interface AnalysisQuestion {
  id: string;
  songTitle: string;
  artist: string;
  key: string;
  section?: string;
  chords: string[];
  romanNumerals: string[];
  level: Level;
  genre: string;
  /** このモードでの3択（文字列配列の配列） */
  choices: string[][];
  correctIndex: number;
  explanation: string;
  bpm: number;
}

export const LEVELS: { id: Level; label: string }[] = [
  { id: "beginner", label: "初級" },
  { id: "intermediate", label: "中級" },
  { id: "advanced", label: "上級" },
];

export const MODES: { id: Mode; label: string; sub: string; emoji: string }[] = [
  {
    id: "visual",
    label: "Visual Analysis",
    sub: "コード進行 → ローマ数字分析",
    emoji: "🎼",
  },
  {
    id: "ear",
    label: "Ear Analysis",
    sub: "音を聴いて → コード進行を当てる",
    emoji: "🔊",
  },
];

const DEFAULT_BPM = 100;

export const SONGS: SongSeed[] = [
  // ───────────────────────── 初級（Pop/Rock基本進行）15問 ─────────────────────────
  {
    id: "b01",
    songTitle: "Let It Be",
    artist: "The Beatles",
    key: "C",
    section: "Verse",
    chords: ["C", "G", "Am", "F"],
    romanNumerals: ["I", "V", "VIm", "IV"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Pop",
    romanDistractors: [
      ["I", "IV", "VIm", "V"],
      ["I", "V", "IIm", "IV"],
    ],
    chordDistractors: [
      ["C", "F", "Am", "G"],
      ["C", "G", "Em", "F"],
    ],
    explanation:
      "I-V-VIm-IV は通称『4コード進行（カノン進行の親戚）』。ポップスで最も使われる進行の1つで、Let It Be のヴァース部分。",
  },
  {
    id: "b02",
    songTitle: "No Woman No Cry",
    artist: "Bob Marley",
    key: "C",
    chords: ["C", "G", "Am", "F"],
    romanNumerals: ["I", "V", "VIm", "IV"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Pop",
    romanDistractors: [
      ["I", "V", "IIIm", "IV"],
      ["I", "IV", "VIm", "V"],
    ],
    chordDistractors: [
      ["C", "G", "Em", "F"],
      ["C", "Am", "F", "G"],
    ],
    explanation:
      "Let It Be と同じ I-V-VIm-IV。キーもコードも全く同じで、名曲同士が同じ進行を共有する好例。",
  },
  {
    id: "b03",
    songTitle: "Stand By Me",
    artist: "Ben E. King",
    key: "A",
    chords: ["A", "F#m", "D", "E"],
    romanNumerals: ["I", "VIm", "IV", "V"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "R&B",
    romanDistractors: [
      ["I", "VIm", "V", "IV"],
      ["I", "IIIm", "IV", "V"],
    ],
    chordDistractors: [
      ["A", "F#m", "E", "D"],
      ["A", "Bm", "D", "E"],
    ],
    explanation:
      "I-VIm-IV-V は『50年代進行（doo-wop progression）』。1950〜60年代のバラードを象徴する循環コード。",
  },
  {
    id: "b04",
    songTitle: "Twist And Shout",
    artist: "The Beatles",
    key: "D",
    chords: ["D", "G", "A"],
    romanNumerals: ["I", "IV", "V"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "V", "IV"],
      ["I", "IIm", "V"],
    ],
    chordDistractors: [
      ["D", "A", "G"],
      ["D", "G", "Em"],
    ],
    explanation:
      "I-IV-V はロックンロールの根幹。スリーコードだけで成立する最もシンプルな進行。",
  },
  {
    id: "b05",
    songTitle: "Let It Be",
    artist: "The Beatles",
    key: "C",
    section: "Chorus",
    chords: ["Am", "G", "F", "C"],
    romanNumerals: ["VIm", "V", "IV", "I"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Pop",
    romanDistractors: [
      ["VIm", "IV", "V", "I"],
      ["IIIm", "V", "IV", "I"],
    ],
    chordDistractors: [
      ["Am", "F", "G", "C"],
      ["Em", "G", "F", "C"],
    ],
    explanation:
      "コーラスは VIm から始まる下行型。ヴァースの I-V-VIm-IV と表裏で、同じ素材を並べ替えている。",
  },
  {
    id: "b06",
    songTitle: "I've Got A Feeling",
    artist: "The Beatles",
    key: "A",
    chords: ["A", "D", "E", "D"],
    romanNumerals: ["I", "IV", "V", "IV"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "V", "IV", "V"],
      ["I", "IV", "IIm", "IV"],
    ],
    chordDistractors: [
      ["A", "E", "D", "E"],
      ["A", "D", "E", "A"],
    ],
    explanation:
      "I-IV-V-IV のシンプルなループ。V から I に解決せず IV に戻ることで、終止感を保留し続ける。",
  },
  {
    id: "b07",
    songTitle: "Love Me Do",
    artist: "The Beatles",
    key: "G",
    chords: ["G", "C", "G", "C"],
    romanNumerals: ["I", "IV", "I", "IV"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Pop",
    romanDistractors: [
      ["I", "V", "I", "V"],
      ["I", "IV", "V", "IV"],
    ],
    chordDistractors: [
      ["G", "D", "G", "D"],
      ["G", "C", "D", "C"],
    ],
    explanation:
      "I と IV を往復するだけの2コード。ブルース由来の素朴な反復で、ハーモニカが映える。",
  },
  {
    id: "b08",
    songTitle: "Hey Jude",
    artist: "The Beatles",
    key: "F",
    section: "Verse",
    chords: ["F", "C", "C7", "F"],
    romanNumerals: ["I", "V", "V7", "I"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Pop",
    romanDistractors: [
      ["I", "IV", "IV7", "I"],
      ["I", "V", "I7", "I"],
    ],
    chordDistractors: [
      ["F", "C", "C7", "Bb"],
      ["F", "Bb", "C7", "F"],
    ],
    explanation:
      "V を V7 にして I への解決を強める典型。C7 のセブンスが F へ戻る推進力を生む。",
  },
  {
    id: "b09",
    songTitle: "Wonderful Tonight",
    artist: "Eric Clapton",
    key: "G",
    chords: ["G", "D", "C", "D"],
    romanNumerals: ["I", "V", "IV", "V"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "IV", "V", "IV"],
      ["I", "V", "IIm", "V"],
    ],
    chordDistractors: [
      ["G", "D", "Em", "D"],
      ["G", "C", "D", "C"],
    ],
    explanation:
      "I-V-IV-V のゆったりした循環。IV と V を行き来して終止を引き延ばすバラード進行。",
  },
  {
    id: "b10",
    songTitle: "Brown Eyed Girl",
    artist: "Van Morrison",
    key: "G",
    chords: ["G", "C", "G", "D"],
    romanNumerals: ["I", "IV", "I", "V"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "IV", "I", "IV"],
      ["I", "V", "I", "IV"],
    ],
    chordDistractors: [
      ["G", "C", "G", "Em"],
      ["G", "D", "G", "C"],
    ],
    explanation:
      "I-IV-I-V。明るいスリーコードの代表例で、最後の V が次の I を呼び込みループする。",
  },
  {
    id: "b11",
    songTitle: "Take Me Home, Country Roads",
    artist: "John Denver",
    key: "A",
    chords: ["A", "F#m", "E", "D"],
    romanNumerals: ["I", "VIm", "V", "IV"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Folk",
    romanDistractors: [
      ["I", "VIm", "IV", "V"],
      ["I", "IIIm", "V", "IV"],
    ],
    chordDistractors: [
      ["A", "F#m", "D", "E"],
      ["A", "E", "F#m", "D"],
    ],
    explanation:
      "I-VIm-V-IV。VIm を挟むことで王道4コードに哀愁を添えた、カントリーの定番。",
  },
  {
    id: "b12",
    songTitle: "Knockin' On Heaven's Door",
    artist: "Bob Dylan",
    key: "G",
    chords: ["G", "D", "Am"],
    romanNumerals: ["I", "V", "IIm"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "V", "VIm"],
      ["I", "IV", "IIm"],
    ],
    chordDistractors: [
      ["G", "D", "Em"],
      ["G", "Am", "D"],
    ],
    explanation:
      "I-V-IIm の3コードを淡々と回す。IIm（Am）の柔らかい響きが祈りのような雰囲気を作る。",
  },
  {
    id: "b13",
    songTitle: "Sweet Home Alabama",
    artist: "Lynyrd Skynyrd",
    key: "D",
    chords: ["D", "C", "G"],
    romanNumerals: ["I", "bVII", "IV"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "VII", "IV"],
      ["I", "bVII", "V"],
    ],
    chordDistractors: [
      ["D", "G", "C"],
      ["D", "Bb", "G"],
    ],
    explanation:
      "bVII（C）はミクソリディアン由来の借用和音。サザンロックらしい『泥臭い』響きの正体。",
  },
  {
    id: "b14",
    songTitle: "Blowin' In The Wind",
    artist: "Bob Dylan",
    key: "D",
    chords: ["D", "G", "A", "D"],
    romanNumerals: ["I", "IV", "V", "I"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Folk",
    romanDistractors: [
      ["I", "V", "IV", "I"],
      ["I", "IV", "IIm", "I"],
    ],
    chordDistractors: [
      ["D", "G", "Em", "D"],
      ["D", "A", "G", "D"],
    ],
    explanation:
      "I-IV-V-I は最も基本的な『完全終止』。V から I へきっちり解決する教科書的進行。",
  },
  {
    id: "b15",
    songTitle: "A Hard Day's Night",
    artist: "The Beatles",
    key: "G",
    chords: ["G", "C", "G", "F", "G"],
    romanNumerals: ["I", "IV", "I", "bVII", "I"],
    modes: ["visual", "ear"],
    level: "beginner",
    genre: "Rock",
    romanDistractors: [
      ["I", "IV", "I", "VII", "I"],
      ["I", "V", "I", "bVII", "I"],
    ],
    chordDistractors: [
      ["G", "C", "G", "Bb", "G"],
      ["G", "F", "G", "C", "G"],
    ],
    explanation:
      "bVII（F）を経由して I に戻るロック特有の動き。長調に bVII を混ぜる典型例。",
  },

  // ───────────────────── 中級（セカンダリードミナント・借用和音）15問 ─────────────────────
  {
    id: "i01",
    songTitle: "Yesterday",
    artist: "The Beatles",
    key: "F",
    chords: ["F", "Em7b5", "A7", "Dm"],
    romanNumerals: ["I", "VIIm7(b5)", "V7/VI", "VIm"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Pop",
    romanDistractors: [
      ["I", "IIm7", "V7", "VIm"],
      ["I", "VIIm7", "V7/IV", "IVm"],
    ],
    chordDistractors: [
      ["F", "Dm", "Bb", "C"],
      ["F", "Am", "Dm", "Bb"],
    ],
    explanation:
      "I-VIIm7(b5)-V7/VI-VIm の進行。Dm（VIm）へのセカンダリードミナント A7 が、マイナーへの切ない解決を生む。Yesterday の冒頭。",
  },
  {
    id: "i02",
    songTitle: "Something",
    artist: "The Beatles",
    key: "C",
    chords: ["C", "Cmaj7", "C7", "F"],
    romanNumerals: ["I", "IM7", "V7/IV", "IV"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Pop",
    romanDistractors: [
      ["I", "IM7", "I7", "IVm"],
      ["I", "VIm7", "V7", "IV"],
    ],
    chordDistractors: [
      ["C", "Am", "F", "G"],
      ["C", "Cmaj7", "Am7", "F"],
    ],
    explanation:
      "C→Cmaj7→C7 はトップ音が C→B→Bb と半音下行するクリシェ。C7 は IV(F) へ向かう V7/IV として機能する。",
  },
  {
    id: "i03",
    songTitle: "Michelle",
    artist: "The Beatles",
    key: "Fm",
    section: "ライン・クリシェ",
    chords: ["Fm", "Fm(maj7)", "Fm7", "Bb7"],
    romanNumerals: ["Im", "ImM7", "Im7", "IV7"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Pop",
    romanDistractors: [
      ["Im", "Im7", "ImM7", "IV7"],
      ["Im", "ImM7", "Im7", "bVII7"],
    ],
    chordDistractors: [
      ["Fm", "Db", "Bb7", "Eb"],
      ["Fm", "Cm", "Bb7", "Eb7"],
    ],
    explanation:
      "Im→ImM7→Im7 は内声が F→E→Eb と半音下行するライン・クリシェ。最後の IV7(Bb7) がドリアン的な彩りを添える。",
  },
  {
    id: "i04",
    songTitle: "In My Life",
    artist: "The Beatles",
    key: "A",
    chords: ["A", "E", "F#m", "A7", "D"],
    romanNumerals: ["I", "V", "VIm", "V7/IV", "IV"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Pop",
    romanDistractors: [
      ["I", "V", "VIm", "I7", "IVm"],
      ["I", "IV", "VIm", "V7", "IV"],
    ],
    chordDistractors: [
      ["A", "E", "F#m", "D", "A"],
      ["A", "E", "D", "A7", "D"],
    ],
    explanation:
      "A7（V7/IV）が D(IV) を呼び込む。I のセブンスを挟んでサブドミナントへ滑らかに繋ぐ常套句。",
  },
  {
    id: "i05",
    songTitle: "Here, There And Everywhere",
    artist: "The Beatles",
    key: "G",
    chords: ["G", "Am", "Bm", "C"],
    romanNumerals: ["I", "IIm", "IIIm", "IV"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Pop",
    romanDistractors: [
      ["I", "IIIm", "IIm", "IV"],
      ["I", "IIm", "IV", "IIIm"],
    ],
    chordDistractors: [
      ["G", "Am", "Bm", "D"],
      ["G", "Em", "Bm", "C"],
    ],
    explanation:
      "I-IIm-IIIm-IV と全音階を駆け上がる上行型。ベースが順次進行（G-A-B-C）して高揚感を生む。",
  },
  {
    id: "i06",
    songTitle: "While My Guitar Gently Weeps",
    artist: "The Beatles",
    key: "Am",
    section: "下行ライン・クリシェ",
    chords: ["Am", "Am/G#", "Am/G", "Am/F#"],
    romanNumerals: ["Im", "ImM7", "Im7", "Im6"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Rock",
    romanDistractors: [
      ["Im", "Im7", "ImM7", "Im6"],
      ["Im", "bVII", "bVI", "V"],
    ],
    chordDistractors: [
      ["Am", "Am/G", "Am/F#", "Am/F"],
      ["Am", "G", "F", "E"],
    ],
    explanation:
      "ベースが A→G#→G→F# と半音下行する下行型ライン・クリシェ。和音は Am のままベース音だけが動く。",
  },
  {
    id: "i07",
    songTitle: "Georgia On My Mind",
    artist: "Ray Charles",
    key: "G",
    chords: ["GM7", "B7", "Em7", "A7", "Am7", "D7"],
    romanNumerals: ["IM7", "V7/VI", "VIm7", "V7/V", "IIm7", "V7"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "R&B",
    romanDistractors: [
      ["IM7", "V7/VI", "VIm7", "IIm7", "V7/V", "V7"],
      ["IM7", "VII7", "VIm7", "V7", "IIm7", "V7"],
    ],
    chordDistractors: [
      ["GM7", "E7", "Am7", "D7", "Bm7", "E7"],
      ["GM7", "B7", "Em7", "C", "Am7", "D7"],
    ],
    explanation:
      "B7(V7/VI) が Em7 へ、A7(V7/V) が IIm7-V7 へと、セカンダリードミナントを連ねて流れるように進む名アレンジ。",
  },
  {
    id: "i08",
    songTitle: "Fly Me To The Moon",
    artist: "Bart Howard",
    key: "Am",
    chords: ["Am", "Dm7", "G7", "CM7", "FM7", "Bm7b5", "E7", "Am"],
    romanNumerals: ["VIm", "IIm7", "V7", "IM7", "IVM7", "VIIm7(b5)", "V7/VI", "VIm"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Jazz",
    romanDistractors: [
      ["VIm", "IIm7", "V7", "IM7", "IVM7", "IIm7(b5)", "V7", "VIm"],
      ["Im", "IVm", "V7", "bIIIM7", "bVIM7", "IIm7(b5)", "V7", "Im"],
    ],
    chordDistractors: [
      ["Am", "F", "G", "C", "Dm", "Em", "E7", "Am"],
      ["Am", "Dm7", "G7", "C", "Am7", "Bm7b5", "E7", "Am"],
    ],
    explanation:
      "Cメジャー調の循環コード（IIm7-V7-IM7-IVM7…）が完全4度ずつ下行。最後は VIIm7(b5)-V7/VI で VIm(Am) へ着地する『枯葉』型の循環。",
  },
  {
    id: "i09",
    songTitle: "Autumn Leaves",
    artist: "Joseph Kosma",
    key: "Gm",
    chords: ["Cm7", "F7", "BbM7", "EbM7", "Am7b5", "D7", "Gm"],
    romanNumerals: ["IVm7", "bVII7", "bIIIM7", "bVIM7", "IIm7(b5)", "V7", "Im"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Jazz",
    romanDistractors: [
      ["IIm7", "V7", "IM7", "IVM7", "VIm7(b5)", "III7", "VIm"],
      ["IVm7", "bVII7", "bIIIM7", "bVIM7", "IIm7", "V7", "Im"],
    ],
    chordDistractors: [
      ["Cm7", "F7", "Bb", "Eb", "Dm7b5", "G7", "Cm"],
      ["Cm7", "Bb7", "Eb", "Ab", "Am7b5", "D7", "Gm"],
    ],
    explanation:
      "前半は相対長調 Bb の IIm7-V7-IM7-IVM7、後半は短調の IIm7(b5)-V7-Im。長調と短調のツーファイブが交互に現れるジャズの教材的名曲。",
  },
  {
    id: "i10",
    songTitle: "Just The Two Of Us",
    artist: "Grover Washington Jr.",
    key: "Fm",
    chords: ["DbM7", "C7", "Fm7", "EbM7"],
    romanNumerals: ["bVIM7", "V7", "Im7", "bVIIM7"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "R&B",
    romanDistractors: [
      ["bVIM7", "V7", "Im7", "IVM7"],
      ["IVM7", "V7", "Im7", "bVIIM7"],
    ],
    chordDistractors: [
      ["DbM7", "C7", "Fm7", "Db"],
      ["Db", "Bb7", "Fm7", "Eb"],
    ],
    explanation:
      "いわゆる『丸の内進行』の親戚。bVIM7-V7-Im7 と続き、C7(V7) が Fm へ短調的に解決する都会的なループ。",
  },
  {
    id: "i11",
    songTitle: "All Of Me",
    artist: "John Legend",
    key: "Ab",
    chords: ["Ab", "Fm"],
    romanNumerals: ["I", "VIm"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Pop",
    romanDistractors: [
      ["I", "IIIm"],
      ["I", "IV"],
    ],
    chordDistractors: [
      ["Ab", "Cm"],
      ["Ab", "Db"],
    ],
    explanation:
      "進行自体は I-VIm とシンプルだが、キーが Ab（♭4つ）。♭系キーで I と VIm を読み取る練習になる。",
  },
  {
    id: "i12",
    songTitle: "Hotel California",
    artist: "Eagles",
    key: "Bm",
    chords: ["Bm", "F#7", "A", "E", "G", "D", "Em", "F#7"],
    romanNumerals: ["Im", "V7", "bVII", "IV", "bVI", "bIII", "IVm", "V7"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Rock",
    romanDistractors: [
      ["Im", "V7", "III", "VII", "bVI", "bIII", "IVm", "V7"],
      ["Im", "bVII", "IV", "V7", "bVI", "bIII", "IVm", "V"],
    ],
    chordDistractors: [
      ["Bm", "F#7", "A", "E", "G", "D", "G", "F#7"],
      ["Bm", "A", "G", "F#7", "Em", "D", "Em", "F#7"],
    ],
    explanation:
      "短調の Im-V7 で始まり bVII-IV-bVI-bIII と借用和音が連続。Em(IVm) を経て V7 へ戻る、巧妙な短調進行。",
  },
  {
    id: "i13",
    songTitle: "Don't Stop Believin'",
    artist: "Journey",
    key: "E",
    chords: ["E", "B", "C#m", "A"],
    romanNumerals: ["I", "V", "VIm", "IV"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "Rock",
    romanDistractors: [
      ["I", "V", "IIIm", "IV"],
      ["I", "IV", "VIm", "V"],
    ],
    chordDistractors: [
      ["E", "B", "G#m", "A"],
      ["E", "A", "C#m", "B"],
    ],
    explanation:
      "王道の I-V-VIm-IV だがキーが E。Let It Be と同じ進行を別キーで読み取れるかがポイント。",
  },
  {
    id: "i14",
    songTitle: "I Will Always Love You",
    artist: "Whitney Houston",
    key: "A",
    chords: ["A", "F#m", "D", "E"],
    romanNumerals: ["I", "VIm", "IV", "V"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "R&B",
    romanDistractors: [
      ["I", "VIm", "V", "IV"],
      ["I", "IIIm", "IV", "V"],
    ],
    chordDistractors: [
      ["A", "F#m", "E", "D"],
      ["A", "D", "F#m", "E"],
    ],
    explanation:
      "I-VIm-IV-V の50年代進行。Stand By Me と同じ枠組みで、バラードの王道として今も使われる。",
  },
  {
    id: "i15",
    songTitle: "Superstition",
    artist: "Stevie Wonder",
    key: "Ebm",
    chords: ["Ebm", "Bb7"],
    romanNumerals: ["Im", "V7"],
    modes: ["visual", "ear"],
    level: "intermediate",
    genre: "R&B",
    romanDistractors: [
      ["Im", "bVII7"],
      ["Im", "IV7"],
    ],
    chordDistractors: [
      ["Ebm", "Ab7"],
      ["Ebm", "Db7"],
    ],
    explanation:
      "Im-V7 を反復するファンク。和声はほぼ Ebm 一発だが、Bb7(V7) のドミナント感がグルーヴに緊張を与える。",
  },

  // ───────────────────────── 上級（複雑な進行・転調）10問 ─────────────────────────
  {
    id: "a01",
    songTitle: "The Girl From Ipanema",
    artist: "Antônio Carlos Jobim",
    key: "F",
    section: "A section",
    chords: ["FM7", "G7", "Gm7", "Gb7"],
    romanNumerals: ["IM7", "V7/V", "IIm7", "bII7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["IM7", "II7", "IIm7", "bVII7"],
      ["IM7", "V7/V", "IIm7", "V7"],
    ],
    chordDistractors: [
      ["FM7", "G7", "Gm7", "C7"],
      ["FM7", "A7", "Dm7", "Gb7"],
    ],
    explanation:
      "G7(V7/V) のあと、Gb7 は C7(V7) の裏コード（bII7）。トライトーン代理でベースが半音で着地するボサノヴァの名解決。",
  },
  {
    id: "a02",
    songTitle: "Isn't She Lovely",
    artist: "Stevie Wonder",
    key: "E",
    chords: ["C#m7", "F#7", "B7", "E"],
    romanNumerals: ["VIm7", "V7/V", "V7", "I"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "R&B",
    romanDistractors: [
      ["VIm7", "IV7", "V7", "I"],
      ["IIIm7", "V7/V", "V7", "I"],
    ],
    chordDistractors: [
      ["C#m7", "F#7", "B7", "A"],
      ["C#m7", "A", "B7", "E"],
    ],
    explanation:
      "F#7 は B7 を導く V7/V（ドッペルドミナント）。VIm7-V7/V-V7-I と、ドミナントを2段重ねて I へ強く解決する。",
  },
  {
    id: "a03",
    songTitle: "All The Things You Are",
    artist: "Jerome Kern",
    key: "Ab",
    chords: ["Fm7", "Bbm7", "Eb7", "AbM7", "DbM7", "G7", "CM7"],
    romanNumerals: ["VIm7", "IIm7", "V7", "IM7", "IVM7", "V7/III", "IIIM7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["VIm7", "IIm7", "V7", "IM7", "IVM7", "VII7", "IIIM7"],
      ["IIm7", "V7", "IM7", "IVM7", "bVIIM7", "III7", "VIM7"],
    ],
    chordDistractors: [
      ["Fm7", "Bbm7", "Eb7", "Ab", "Db", "Bb7", "Eb"],
      ["Fm7", "Bb7", "Eb7", "Ab", "Db", "G7", "C"],
    ],
    explanation:
      "IIm7-V7-IM7 を繰り返しながら、G7-CM7 で C メジャーへ転調。ツーファイブの連鎖で調が滑らかに移る転調の教科書。",
  },
  {
    id: "a04",
    songTitle: "Giant Steps",
    artist: "John Coltrane",
    key: "B",
    chords: ["BM7", "D7", "GM7", "Bb7", "EbM7"],
    romanNumerals: ["IM7", "V7/bVI", "bVIM7", "V7/IV", "IVM7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["IM7", "VII7", "bVIM7", "bVII7", "IVM7"],
      ["IM7", "V7", "IVM7", "bVII7", "bIIIM7"],
    ],
    chordDistractors: [
      ["BM7", "D7", "GM7", "Bb7", "Eb"],
      ["BM7", "F#7", "GM7", "D7", "EbM7"],
    ],
    explanation:
      "長3度ずつ下る3つのトニック（B-G-Eb）を V7 で繋ぐ『コルトレーン・チェンジ』。調的重力を等分割した革命的進行。",
  },
  {
    id: "a05",
    songTitle: "Take The A Train",
    artist: "Duke Ellington",
    key: "C",
    chords: ["CM7", "D7", "Dm7", "G7"],
    romanNumerals: ["IM7", "V7/V", "IIm7", "V7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["IM7", "V7/V", "IIIm7", "V7"],
      ["IM7", "IIm7", "V7", "IM7"],
    ],
    chordDistractors: [
      ["CM7", "D7", "G7", "CM7"],
      ["CM7", "A7", "Dm7", "G7"],
    ],
    explanation:
      "D7 はリディアン的な #4(F#) を含む V7/V。IIm7(Dm7) に半音で繋がり、定番の IIm7-V7 へ流れ込む。",
  },
  {
    id: "a06",
    songTitle: "Stella By Starlight",
    artist: "Victor Young",
    key: "Bb",
    chords: ["Em7b5", "A7", "Cm7", "F7", "Fm7", "Bb7", "EbM7", "Ab7"],
    romanNumerals: ["#IVm7(b5)", "V7/III", "IIm7", "V7", "Vm7", "I7", "IVM7", "bVII7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["IIm7(b5)", "V7", "IIm7", "V7", "Vm7", "I7", "IVM7", "bVII7"],
      ["#IVm7(b5)", "V7/III", "IIm7", "V7", "IIm7", "V7", "IM7", "IV7"],
    ],
    chordDistractors: [
      ["Em7b5", "A7", "Cm7", "F7", "Bbm7", "Eb7", "Ab", "Db"],
      ["Em7b5", "A7", "Dm7", "G7", "Cm7", "F7", "Bb", "Eb"],
    ],
    explanation:
      "冒頭が IIm7(b5)-V7 ではなく #IVm7(b5)-V7/III で始まる変則スタート。Fm7-Bb7(Vm7-I7) で IVM7 へ向かう転調感が美しい。",
  },
  {
    id: "a07",
    songTitle: "Blue Bossa",
    artist: "Kenny Dorham",
    key: "Cm",
    chords: ["Cm7", "Fm7", "Dm7b5", "G7", "Cm7", "Ebm7", "Ab7", "DbM7"],
    romanNumerals: ["Im7", "IVm7", "IIm7(b5)", "V7", "Im7", "IIm7/bII", "V7/bII", "bIIM7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["Im7", "IVm7", "IIm7(b5)", "V7", "Im7", "bIIIm7", "bVI7", "bIIM7"],
      ["Im7", "IVm7", "IIm7", "V7", "Im7", "IIm7", "V7", "IM7"],
    ],
    chordDistractors: [
      ["Cm7", "Fm7", "Dm7b5", "G7", "Cm7", "Dm7", "G7", "C"],
      ["Cm7", "Fm7", "Bb7", "Eb", "Am7b5", "D7", "G7", "Cm7"],
    ],
    explanation:
      "Cm の IIm7(b5)-V7-Im のあと、Ebm7-Ab7-DbM7 で Db メジャーへ半音上に転調。短い中に転調を含む名教材。",
  },
  {
    id: "a08",
    songTitle: "Body And Soul",
    artist: "Johnny Green",
    key: "D",
    section: "Bridge",
    chords: ["DM7", "Em7", "A7", "DM7"],
    romanNumerals: ["IM7", "IIm7", "V7", "IM7"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["IM7", "IIIm7", "V7", "IM7"],
      ["IM7", "IIm7", "V7/V", "IM7"],
    ],
    chordDistractors: [
      ["DM7", "Em7", "A7", "Bm7"],
      ["DM7", "F#m7", "A7", "DM7"],
    ],
    explanation:
      "ブリッジは原調 Db から半音上の D メジャーへ転調し、IM7-IIm7-V7-IM7 の定番ツーファイブ・ワンを置く。",
  },
  {
    id: "a09",
    songTitle: "Confirmation",
    artist: "Charlie Parker",
    key: "F",
    chords: ["FM7", "Em7b5", "A7", "Dm7", "G7", "Cm7", "F7", "Bb"],
    romanNumerals: ["IM7", "VIIm7(b5)", "V7/VI", "VIm7", "V7/V", "IIm7", "V7/IV", "IV"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["IM7", "IIm7(b5)", "V7", "VIm7", "II7", "IIm7", "V7", "IV"],
      ["IM7", "VIIm7", "V7/VI", "VIm7", "V7/V", "Vm7", "V7/IV", "IVM7"],
    ],
    chordDistractors: [
      ["FM7", "Em7b5", "A7", "Dm7", "G7", "C7", "F7", "Bb"],
      ["FM7", "Am7", "D7", "Gm7", "C7", "Am7", "D7", "Bb"],
    ],
    explanation:
      "ビバップの定番進行。VIIm7(b5)-V7/VI で VIm7 へ、続く Cm7-F7 は IV(Bb) へ向かう V7/IV のツーファイブ。下行する連鎖が見事。",
  },
  {
    id: "a10",
    songTitle: "'Round Midnight",
    artist: "Thelonious Monk",
    key: "Ebm",
    chords: ["Ebm", "Ebm(maj7)", "Ebm7", "Ab7", "Dm7", "G7", "CM7"],
    romanNumerals: ["Im", "ImM7", "Im7", "IV7", "IIm7→", "V7→", "IM7(C)"],
    modes: ["visual", "ear"],
    level: "advanced",
    genre: "Jazz",
    romanDistractors: [
      ["Im", "Im7", "ImM7", "IV7", "IIm7", "V7", "IM7"],
      ["Im", "ImM7", "Im7", "bVII7", "IIm7", "V7", "bVIM7"],
    ],
    chordDistractors: [
      ["Ebm", "Ebm(maj7)", "Ebm7", "Db7", "Dm7", "G7", "C"],
      ["Ebm", "Cb", "Bb7", "Ab7", "Dm7", "G7", "CM7"],
    ],
    explanation:
      "Im-ImM7-Im7 の下行ライン・クリシェから IV7 を経て、Dm7-G7-CM7 で C メジャーへ転調。Monk らしい翳りと転調の妙。",
  },
];

// ───────────────────────── 選択肢の組み立て ─────────────────────────

// id から決定的に正解位置を決める（SSR とクライアントで一致させるため）
function seededIndex(id: string, n: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % n;
}

/**
 * 指定モードでの3択（choices）と correctIndex を組み立てて AnalysisQuestion を返す。
 * visual: ローマ数字分析を選ぶ / ear: コード進行を選ぶ
 */
export function buildQuestion(seed: SongSeed, mode: Mode): AnalysisQuestion {
  const correct = mode === "visual" ? seed.romanNumerals : seed.chords;
  const distractors =
    mode === "visual" ? seed.romanDistractors : seed.chordDistractors;

  const pool = [correct, ...distractors];
  const correctIndex = seededIndex(seed.id + mode, pool.length);

  // correct を correctIndex に置き、残りを順に埋める
  const choices: string[][] = new Array(pool.length);
  choices[correctIndex] = correct;
  let di = 0;
  for (let i = 0; i < choices.length; i++) {
    if (i === correctIndex) continue;
    choices[i] = distractors[di++];
  }

  return {
    id: seed.id,
    songTitle: seed.songTitle,
    artist: seed.artist,
    key: seed.key,
    section: seed.section,
    chords: seed.chords,
    romanNumerals: seed.romanNumerals,
    level: seed.level,
    genre: seed.genre,
    choices,
    correctIndex,
    explanation: seed.explanation,
    bpm: seed.bpm ?? DEFAULT_BPM,
  };
}

export interface Filter {
  level?: Level;
  genre?: string;
}

export function getQuestions(mode: Mode, filter: Filter = {}): AnalysisQuestion[] {
  return SONGS.filter((s) => s.modes.includes(mode))
    .filter((s) => (filter.level ? s.level === filter.level : true))
    .filter((s) => (filter.genre ? s.genre === filter.genre : true))
    .map((s) => buildQuestion(s, mode));
}

export function getGenres(): string[] {
  return Array.from(new Set(SONGS.map((s) => s.genre)));
}

export function countByMode(mode: Mode, filter: Filter = {}): number {
  return getQuestions(mode, filter).length;
}
