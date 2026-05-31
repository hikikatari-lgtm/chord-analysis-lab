# Chord Analysis Lab

名曲のコード進行をローマ数字で分析する力を鍛える、3択クイズ形式の Web アプリ。
Directline Studio エコシステムの一員（Theory Lab / Song Master / Theory Test と同じダークテーマ＋ゴールドのアクセント）。

- タイトル: **Chord Analysis Lab**
- サブタイトル: 名曲のコード進行を分析して、理論力を鍛える
- 本番URL: https://chord-analysis-lab.vercel.app
- GitHub: https://github.com/hikikatari-lgtm/chord-analysis-lab

## 技術スタック

- Next.js 16（App Router）+ TypeScript
- Tailwind CSS v3（`tailwind.config.ts` の `gold` / `ink` カラートークン）
- Tone.js（コード進行のピアノ風再生）
- 開発サーバーは **port 3212**（3000=song-master / 3210=theory-test / 3211=theory-test-2 と衝突回避）

```bash
npm install
npm run dev   # http://localhost:3212
npm run build
```

## 2つの出題モード

1. **Visual Analysis**（`/quiz/visual`）— 曲名・Key・コード進行を表示し、正しいローマ数字分析を3択で選ぶ。Tone.js で再生も可能。回答後、各コードの下にローマ数字を表示。
2. **Ear Analysis**（`/quiz/ear`）— 曲名と Key だけ表示。再生ボタンで音を聴き、コード進行を3択で当てる。回答後にコード進行とローマ数字の両方を表示。

トップ（`app/page.tsx`）で難易度・ジャンルでフィルターでき、選択はクエリ文字列でクイズ画面へ渡る。直近スコアは localStorage（`chord-analysis-lab:progress`）にモード別で保存。

## ディレクトリ構成

```
app/
  page.tsx            トップ（モードカード + フィルター + 進捗バッジ）
  quiz/[mode]/page.tsx Visual/Ear 共通のクイズ本体 + 結果画面
  progress.ts         localStorage 進捗ヘルパー
  layout.tsx / globals.css  ダークテーマ
data/
  songs.ts            全収録曲（SongSeed[]）+ 設問ビルダー
lib/
  theory.ts           コード名 → 音名配列（chordToNotes）
  audio.ts            Tone.js でコード進行を再生（動的 import で SSR 回避）
```

## コンテンツの追加・編集

すべての曲は `data/songs.ts` の `SONGS` 配列にある。曲を足すには `SongSeed` を1件追加するだけ:

- `chords` … 実際のコード進行（例 `["C","G","Am","F"]`）
- `romanNumerals` … 正しいローマ数字分析（`chords` と同じ長さ）
- `romanDistractors` … Visual モード用の誤答ローマ数字（2件）
- `chordDistractors` … Ear モード用の誤答コード進行（2件）
- `modes` … `["visual","ear"]` のどちらで出題するか
- `level` … `"beginner" | "intermediate" | "advanced"`
- `genre` … フィルター用（Pop / Rock / Jazz / R&B / Folk）
- `explanation` … 解説テキスト
- `bpm?` … 再生テンポ（省略時 100）

選択肢の並び（correctIndex）は id から決まる決定的シャッフルで、SSR とクライアントで一致する。

収録: 初級15 / 中級15 / 上級10 = 計40曲。各曲が Visual / Ear 両モードで出題されるため、設問総数は 80。

## Tone.js のポイント

- `import * as Tone` を top-level でやると SSR でビルドが落ちるため、`lib/audio.ts` 内で **動的 import**（`typeof window` ガード）している。
- AudioContext はユーザー操作後にしか開始できないので、再生ボタンの onClick から `ensureAudio()`（内部で `Tone.start()`）を呼ぶ。
- `PolySynth(Tone.Synth)` + Reverb のピアノ風サウンド。ボイシングは `lib/theory.ts` の `chordToNotes`（ベース1音 + 中音域の基本ポジション）。
