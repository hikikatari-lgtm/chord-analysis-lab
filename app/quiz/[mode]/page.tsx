"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  getQuestions,
  type AnalysisQuestion,
  type Filter,
  type Level,
  type Mode,
} from "@/data/songs";
import { ensureAudio, playProgression, preloadAudio, stopAudio } from "@/lib/audio";
import { setProgress } from "../../progress";

const MODE_LABEL: Record<Mode, { title: string; emoji: string }> = {
  visual: { title: "Visual Analysis", emoji: "🎼" },
  ear: { title: "Ear Analysis", emoji: "🔊" },
};

interface WrongItem {
  q: AnalysisQuestion;
  chosen: number;
}

export default function QuizPage() {
  const params = useParams<{ mode: string }>();
  const search = useSearchParams();
  const mode: Mode = params.mode === "ear" ? "ear" : "visual";

  const filter: Filter = useMemo(() => {
    const level = search.get("level");
    const genre = search.get("genre");
    return {
      level: (level as Level) || undefined,
      genre: genre || undefined,
    };
  }, [search]);

  const questions = useMemo(() => getQuestions(mode, filter), [mode, filter]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<WrongItem[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  // 問題が変わったら音を止める
  useEffect(() => {
    return () => {
      void stopAudio();
    };
  }, [index]);

  if (!q) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-20 text-center">
        <p className="text-neutral-400">
          条件に合う問題がありません。フィルターを変えてください。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-ink-border px-5 py-2 text-sm text-neutral-300 hover:border-gold/40 hover:text-gold-light"
        >
          ← トップへ
        </Link>
      </main>
    );
  }

  const answered = selected !== null;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === q.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setWrong((w) => [...w, { q, chosen: i }]);
    }
  }

  function next() {
    void stopAudio();
    if (index + 1 >= questions.length) {
      setFinished(true);
      setProgress(mode, {
        score: score,
        total: questions.length,
        played: true,
      });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  if (finished) {
    return (
      <ResultScreen
        mode={mode}
        score={score}
        total={questions.length}
        wrong={wrong}
        qs={search.toString()}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8">
      {/* 進捗ヘッダー */}
      <div className="mb-6 flex items-center justify-between text-xs text-neutral-500">
        <Link href="/" className="hover:text-gold-light">
          ← トップ
        </Link>
        <span>
          {MODE_LABEL[mode].emoji} {MODE_LABEL[mode].title}
        </span>
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-ink-border">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {mode === "visual" ? (
        <VisualQuestion q={q} selected={selected} onChoose={choose} />
      ) : (
        <EarQuestion q={q} selected={selected} onChoose={choose} />
      )}

      {answered && (
        <div className="mt-6 animate-fade-in-up">
          <Explanation q={q} mode={mode} selected={selected} />
          <button
            type="button"
            onClick={next}
            className="mt-6 w-full rounded-2xl bg-gold py-3.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
          >
            {index + 1 >= questions.length ? "結果を見る" : "次の問題へ →"}
          </button>
        </div>
      )}
    </main>
  );
}

/* ───────────────────────── 再生ボタン + テンポ ───────────────────────── */

function PlayControls({
  chords,
  bpm,
  hidden = false,
}: {
  chords: string[];
  bpm: number;
  hidden?: boolean;
}) {
  const [tempo, setTempo] = useState(bpm);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState<number | null>(null);

  // タップ前に Tone モジュール＋シンセを先読みしておく（iOS のジェスチャー対策）
  useEffect(() => {
    void preloadAudio();
  }, []);

  async function play() {
    if (playing) {
      await stopAudio();
      setPlaying(false);
      setStep(null);
      return;
    }
    // iOS: タップのハンドラ内で「最初に」AudioContext を起動/再開する。
    // 動的 import は preloadAudio で済ませてあるのでここでは即時に走る。
    const ready = await ensureAudio();
    if (!ready) {
      setPlaying(false);
      setStep(null);
      return;
    }
    setPlaying(true);
    setStep(0);
    const totalMs = await playProgression(chords, tempo, (i) => setStep(i));
    window.setTimeout(() => {
      setPlaying(false);
      setStep(null);
    }, totalMs + 200);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={play}
        className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
          playing
            ? "border border-gold bg-gold/15 text-gold-light"
            : "bg-gold text-ink hover:bg-gold-light"
        }`}
      >
        <span className="text-base">{playing ? "⏸" : "▶"}</span>
        {playing ? "再生中… (停止)" : "🔊 コード進行を再生"}
      </button>

      <div className="flex w-full max-w-xs items-center gap-3">
        <span className="w-14 shrink-0 text-[11px] text-neutral-500">
          {tempo} BPM
        </span>
        <input
          type="range"
          min={60}
          max={160}
          step={5}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-ink-border accent-gold"
        />
      </div>

      {/* 再生位置インジケータ（ear モードでは hidden） */}
      {!hidden && step !== null && (
        <div className="flex gap-1.5">
          {chords.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === step ? "bg-gold" : "bg-ink-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Visual Analysis ───────────────────────── */

function VisualQuestion({
  q,
  selected,
  onChoose,
}: {
  q: AnalysisQuestion;
  selected: number | null;
  onChoose: (i: number) => void;
}) {
  const answered = selected !== null;
  return (
    <>
      <SongHeader q={q} />

      {/* コード進行カード */}
      <div className="mb-6 flex flex-wrap justify-center gap-2.5">
        {q.chords.map((c, i) => (
          <div
            key={i}
            className="flex min-w-[64px] flex-col items-center rounded-xl border border-ink-border bg-ink-card px-3 py-3"
          >
            <span className="text-lg font-semibold text-neutral-100">{c}</span>
            {answered && (
              <span className="mt-1 text-[11px] font-medium text-gold">
                {q.romanNumerals[i]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mb-7">
        <PlayControls chords={q.chords} bpm={q.bpm} />
      </div>

      <p className="mb-4 text-center text-sm text-neutral-300">
        このコード進行のローマ数字分析は？
      </p>

      <Choices q={q} selected={selected} onChoose={onChoose} />
    </>
  );
}

/* ───────────────────────── Ear Analysis ───────────────────────── */

function EarQuestion({
  q,
  selected,
  onChoose,
}: {
  q: AnalysisQuestion;
  selected: number | null;
  onChoose: (i: number) => void;
}) {
  return (
    <>
      <SongHeader q={q} hideChords />

      <div className="mb-7 mt-2">
        <PlayControls chords={q.chords} bpm={q.bpm} hidden />
      </div>

      <p className="mb-4 text-center text-sm text-neutral-300">
        このコード進行は？（何度でも再生できます）
      </p>

      <Choices q={q} selected={selected} onChoose={onChoose} />
    </>
  );
}

/* ───────────────────────── 共通パーツ ───────────────────────── */

function SongHeader({
  q,
  hideChords = false,
}: {
  q: AnalysisQuestion;
  hideChords?: boolean;
}) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-xl font-bold text-neutral-100">
        🎵 {q.songTitle}
      </h2>
      <p className="mt-1 text-sm text-neutral-400">{q.artist}</p>
      <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
        <span className="rounded-full border border-gold/40 px-2.5 py-0.5 text-gold-light">
          Key: {q.key}
        </span>
        {q.section && (
          <span className="rounded-full border border-ink-border px-2.5 py-0.5 text-neutral-400">
            {q.section}
          </span>
        )}
        <span className="rounded-full border border-ink-border px-2.5 py-0.5 text-neutral-500">
          {q.genre}
        </span>
      </div>
      {hideChords && (
        <p className="mt-3 text-[11px] text-neutral-600">
          コード進行は伏せられています — 音を聴いて当てましょう
        </p>
      )}
    </div>
  );
}

function Choices({
  q,
  selected,
  onChoose,
}: {
  q: AnalysisQuestion;
  selected: number | null;
  onChoose: (i: number) => void;
}) {
  const answered = selected !== null;
  const labels = ["①", "②", "③", "④"];
  return (
    <div className="flex flex-col gap-3">
      {q.choices.map((choice, i) => {
        const isCorrect = i === q.correctIndex;
        const isChosen = i === selected;
        let cls =
          "border-ink-border bg-ink-card/80 text-neutral-200 hover:border-gold/40";
        if (answered) {
          if (isCorrect) {
            cls = "border-emerald-500/70 bg-emerald-500/10 text-emerald-300";
          } else if (isChosen) {
            cls = "border-red-500/60 bg-red-500/10 text-red-300";
          } else {
            cls = "border-ink-border bg-ink-card/40 text-neutral-500";
          }
        }
        return (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => onChoose(i)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${cls}`}
          >
            <span className="text-base">{labels[i]}</span>
            <span className="font-mono text-sm tracking-wide">
              {choice.join("  -  ")}
            </span>
            {answered && isCorrect && (
              <span className="ml-auto text-xs font-semibold text-emerald-400">
                正解
              </span>
            )}
            {answered && isChosen && !isCorrect && (
              <span className="ml-auto text-xs font-semibold text-red-400">
                あなたの回答
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Explanation({
  q,
  mode,
  selected,
}: {
  q: AnalysisQuestion;
  mode: Mode;
  selected: number | null;
}) {
  const correct = selected === q.correctIndex;
  return (
    <div className="rounded-2xl border border-ink-border bg-ink-card/70 p-5">
      <p
        className={`mb-3 text-sm font-bold ${
          correct ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {correct ? "✓ 正解！" : "✗ 不正解"}
      </p>

      {/* ear モードでは正解後にコード進行とローマ数字を両方表示 */}
      {mode === "ear" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {q.chords.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-lg border border-ink-border bg-ink px-2.5 py-1.5"
            >
              <span className="text-sm font-semibold text-neutral-100">
                {c}
              </span>
              <span className="text-[10px] text-gold">
                {q.romanNumerals[i]}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm leading-relaxed text-neutral-300">
        {q.explanation}
      </p>
    </div>
  );
}

/* ───────────────────────── 結果画面 ───────────────────────── */

function ResultScreen({
  mode,
  score,
  total,
  wrong,
  qs,
}: {
  mode: Mode;
  score: number;
  total: number;
  wrong: WrongItem[];
  qs: string;
}) {
  const pct = Math.round((score / total) * 100);
  const message =
    pct === 100
      ? "完璧です！🏆"
      : pct >= 80
        ? "素晴らしい分析力です 🎉"
        : pct >= 50
          ? "いい調子。復習でさらに伸びます"
          : "解説を読んで、もう一度挑戦しましょう";

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-12">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">
          Result — {MODE_LABEL[mode].title}
        </p>
        <p className="mt-4 text-5xl font-bold text-gold-gradient">
          {score}
          <span className="text-2xl text-neutral-500"> / {total}</span>
        </p>
        <p className="mt-3 text-sm text-neutral-300">{message}</p>
      </div>

      {wrong.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-neutral-200">
            間違えた問題の復習（{wrong.length}問）
          </h3>
          <ul className="flex flex-col gap-3">
            {wrong.map(({ q }, idx) => (
              <li
                key={idx}
                className="rounded-2xl border border-ink-border bg-ink-card/70 p-4"
              >
                <p className="text-sm font-semibold text-neutral-100">
                  🎵 {q.songTitle}{" "}
                  <span className="text-xs font-normal text-neutral-500">
                    / {q.artist} ・ Key {q.key}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.chords.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-ink-border bg-ink px-2 py-1 text-[11px] text-neutral-200"
                    >
                      {c}{" "}
                      <span className="text-gold">{q.romanNumerals[i]}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                  {q.explanation}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/quiz/${mode}${qs ? `?${qs}` : ""}`}
          className="flex-1 rounded-2xl bg-gold py-3.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
          onClick={() => window.location.reload()}
        >
          もう一度挑戦
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-2xl border border-ink-border py-3.5 text-center text-sm font-semibold text-neutral-300 transition-colors hover:border-gold/40 hover:text-gold-light"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
