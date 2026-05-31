"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LEVELS,
  MODES,
  countByMode,
  getGenres,
  type Filter,
  type Level,
  type Mode,
} from "@/data/songs";
import { getProgress, type ModeProgress } from "./progress";

export default function HomePage() {
  const genres = useMemo(() => getGenres(), []);
  const [level, setLevel] = useState<Level | "all">("all");
  const [genre, setGenre] = useState<string>("all");
  const [progress, setProgress] = useState<Record<Mode, ModeProgress>>({
    visual: { score: 0, total: 0, played: false },
    ear: { score: 0, total: 0, played: false },
  });

  useEffect(() => {
    setProgress({ visual: getProgress("visual"), ear: getProgress("ear") });
  }, []);

  const filter: Filter = {
    level: level === "all" ? undefined : level,
    genre: genre === "all" ? undefined : genre,
  };

  const query = new URLSearchParams();
  if (filter.level) query.set("level", filter.level);
  if (filter.genre) query.set("genre", filter.genre);
  const qs = query.toString() ? `?${query.toString()}` : "";

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-20 pt-14 sm:pt-20">
      <header className="mb-10 text-center sm:mb-14">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold/70">
          Directline Studio
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gold-gradient sm:text-5xl">
          Chord Analysis Lab
        </h1>
        <p className="mt-4 text-sm text-neutral-400 sm:text-base">
          名曲のコード進行を分析して、理論力を鍛える
        </p>
      </header>

      {/* フィルター */}
      <section className="mb-8 rounded-2xl border border-ink-border bg-ink-card/60 p-5">
        <FilterRow
          label="難易度"
          options={[
            { id: "all", label: "すべて" },
            ...LEVELS.map((l) => ({ id: l.id, label: l.label })),
          ]}
          value={level}
          onChange={(v) => setLevel(v as Level | "all")}
        />
        <div className="mt-4">
          <FilterRow
            label="ジャンル"
            options={[
              { id: "all", label: "すべて" },
              ...genres.map((g) => ({ id: g, label: g })),
            ]}
            value={genre}
            onChange={setGenre}
          />
        </div>
      </section>

      {/* モードカード */}
      <section className="flex flex-col gap-4 sm:flex-row">
        {MODES.map((m) => {
          const count = countByMode(m.id, filter);
          const p = progress[m.id];
          return (
            <Link
              key={m.id}
              href={`/quiz/${m.id}${qs}`}
              className="group flex-1 rounded-2xl border border-ink-border bg-ink-card/80 p-6 transition-colors hover:border-gold/50 hover:bg-ink-card"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-3xl">{m.emoji}</span>
                {p.played && (
                  <span className="rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    最高 {p.score}/{p.total}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-neutral-100 group-hover:text-gold-light">
                {m.label}
              </h2>
              <p className="mt-1 text-xs text-neutral-400">{m.sub}</p>
              <p className="mt-4 flex items-center justify-between text-[11px] text-neutral-500">
                <span>全 {count} 問</span>
                <span className="text-xl text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-gold">
                  →
                </span>
              </p>
            </Link>
          );
        })}
      </section>

      <footer className="mt-12 text-center text-[11px] text-neutral-600">
        Tone.js でコード進行を再生。正解でも不正解でも解説とローマ数字分析が表示されます。
      </footer>
    </main>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "border-gold bg-gold/15 text-gold-light"
                  : "border-ink-border text-neutral-400 hover:border-gold/40 hover:text-neutral-200"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
