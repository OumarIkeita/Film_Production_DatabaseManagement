"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/Navbar";
import {
  Film,
  Users,
  DollarSign,
  Clapperboard,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/axios";

function StatCard({ label, value, icon: Icon, loading, index }) {
  return (
    <div
      className={`relative stat-accent overflow-hidden animate-fade-up-${index + 1}`}
      style={{
        background: "rgb(16,17,17)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow:
          "rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset",
      }}
    >
      <div className="absolute right-3 bottom-2 opacity-[0.03]">
        <Icon className="h-16 w-16" />
      </div>
      <p
        className="text-xs font-medium mb-3"
        style={{
          color: "#6a6b6c",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      {loading ? (
        <div
          className="h-8 w-24 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      ) : (
        <p
          className="font-display text-3xl"
          style={{ color: "#f9f9f9", letterSpacing: "0.04em" }}
        >
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [films, setFilms] = useState([]);
  const [stats, setStats] = useState({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get("/films/").catch(() => ({ data: [] })),
      api.get("/stats/summary/").catch(() => ({ data: {} })),
    ])
      .then(([filmsRes, statsRes]) => {
        setFilms(filmsRes.data?.results || filmsRes.data || []);
        setStats(statsRes.data || {});
      })
      .finally(() => setFetching(false));
  }, [user]);

  const statCards = [
    { label: "Total Films", value: stats.total_films, icon: Film },
    { label: "In Production", value: stats.active_films, icon: Clapperboard },
    { label: "Crew Members", value: stats.total_crew, icon: Users },
    {
      label: "Total Expenses",
      value: stats.total_expenses
        ? `$${Number(stats.total_expenses).toLocaleString()}`
        : undefined,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-up flex items-end justify-between">
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{
              color: "#FF6363",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            Welcome back
          </p>
          <h1
            className="font-display text-5xl"
            style={{ color: "#f9f9f9", letterSpacing: "0.05em" }}
          >
            {user?.full_name?.split(" ")[0]?.toUpperCase() ||
              user?.username?.toUpperCase()}
          </h1>
          <p
            className="text-sm mt-1.5 capitalize"
            style={{ color: "#9c9c9d", letterSpacing: "0.2px" }}
          >
            {user?.role?.replace("_", " ")} · CineProd Management System
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 text-xs"
          style={{ color: "#6a6b6c" }}
        >
          <TrendingUp className="h-3.5 w-3.5" style={{ color: "#9c9c9d" }} />
          <span style={{ letterSpacing: "0.2px" }}>Live data</span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} loading={fetching} index={i} />
        ))}
      </div>

      {/* Recent Films */}
      <div className="animate-fade-up-5">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-semibold"
            style={{
              color: "#f9f9f9",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Recent Films
          </h2>
          <Link
            href="/films"
            className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-60"
            style={{ color: "#9c9c9d", letterSpacing: "0.2px" }}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div
          style={{
            background: "rgb(16,17,17)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow:
              "rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset",
          }}
        >
          {fetching ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-4 flex items-center gap-4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div
                    className="h-3.5 w-40 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <div
                    className="h-3.5 w-20 rounded animate-pulse ml-auto"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                </div>
              ))}
            </div>
          ) : films.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Film
                className="h-7 w-7 mx-auto mb-3"
                style={{ color: "rgba(255,255,255,0.1)" }}
              />
              <p className="text-sm" style={{ color: "#6a6b6c" }}>
                No films yet.
              </p>
            </div>
          ) : (
            <div>
              {films.slice(0, 5).map((film, i) => (
                <Link
                  key={film.film_id}
                  href={`/films/${film.film_id}`}
                  className="rc-row flex items-center justify-between px-5 py-4 group"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="font-display text-xs w-4 tabular-nums"
                      style={{ color: "rgba(255,99,99,0.6)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p
                        className="text-sm font-medium transition-colors"
                        style={{ color: "#f9f9f9", letterSpacing: "0.1px" }}
                      >
                        {film.title}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#6a6b6c", letterSpacing: "0.2px" }}
                      >
                        {film.genre} · {film.start_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={film.status} />
                    <ArrowRight
                      className="h-3.5 w-3.5"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
