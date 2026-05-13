"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/Navbar";
import { ChevronRight, Users, DollarSign, Calendar, User } from "lucide-react";
import api from "@/lib/axios";

const cardStyle = {
  background: "rgb(16,17,17)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset",
};

export default function FilmDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [film, setFilm] = useState(null);
  const [crew, setCrew] = useState([]);
  const [budget, setBudget] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    // REMOVED "/api" from the strings below
    Promise.all([
      api.get(`/films/${id}/`),
      api.get(`/films/${id}/crew/`).catch(() => ({ data: [] })),
      api.get(`/films/${id}/budget/`).catch(() => ({ data: null })),
    ])
      .then(([f, c, b]) => {
        setFilm(f.data);
        setCrew(c.data); // Removed .results check if your view returns a simple list
        setBudget(b.data);
      })
      .catch((err) => {
        console.error("Detail Error:", err);
      })
      .finally(() => setFetching(false));
  }, [user, id]);

  if (fetching) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-xl"
            style={{
              background: "rgb(16,17,17)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
    );
  }

  if (!film)
    return (
      <div
        className="text-sm rounded-xl px-4 py-3"
        style={{
          color: "#FF6363",
          background: "rgba(255,99,99,0.08)",
          border: "1px solid rgba(255,99,99,0.2)",
        }}
      >
        Film not found.
      </div>
    );

  const spent = Number(budget?.total_spent || 0);
  const total = Number(budget?.total_amount || 0);
  const remaining = total - spent;
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-1.5 text-xs"
        style={{ color: "#6a6b6c" }}
      >
        <Link
          href="/films"
          className="transition-opacity hover:opacity-60"
          style={{ color: "#9c9c9d" }}
        >
          Films
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: "#f9f9f9" }}>{film.title}</span>
      </div>

      {/* Film hero */}
      <div style={cardStyle}>
        <div
          style={{
            height: "2px",
            background:
              "linear-gradient(90deg, rgba(255,99,99,0.6), rgba(255,99,99,0.1), transparent)",
          }}
        />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{
                  color: "#FF6363",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                {film.genre}
              </p>
              <h1
                className="font-display text-4xl tracking-widest"
                style={{ color: "#f9f9f9" }}
              >
                {film.title.toUpperCase()}
              </h1>
              {film.description && (
                <p
                  className="text-sm mt-3 max-w-xl leading-relaxed"
                  style={{ color: "#9c9c9d", letterSpacing: "0.2px" }}
                >
                  {film.description}
                </p>
              )}
            </div>
            <StatusBadge status={film.status} />
          </div>

          <div
            className="grid grid-cols-3 gap-6 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {[
              { icon: Calendar, label: "Start", value: film.start_date },
              { icon: Calendar, label: "End", value: film.end_date },
              { icon: User, label: "Created By", value: film.created_by_name },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <div
                  className="flex items-center gap-1.5 mb-1"
                  style={{ color: "#6a6b6c" }}
                >
                  <Icon className="h-3 w-3" />
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: "#f9f9f9" }}>
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget */}
      {budget && (
        <div style={{ ...cardStyle, overflow: "visible" }}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="h-4 w-4" style={{ color: "#5fc992" }} />
              <h2
                className="text-sm font-semibold"
                style={{
                  color: "#f9f9f9",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Budget
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-5">
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6a6b6c",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Allocated
                </p>
                <p
                  className="font-display text-2xl"
                  style={{ color: "#f9f9f9" }}
                >
                  ${total.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6a6b6c",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Spent
                </p>
                <p
                  className="font-display text-2xl"
                  style={{ color: "#ffbc33" }}
                >
                  ${spent.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#6a6b6c",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Remaining
                </p>
                <p
                  className="font-display text-2xl"
                  style={{ color: remaining < 0 ? "#FF6363" : "#5fc992" }}
                >
                  ${remaining.toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background:
                    pct >= 100 ? "#FF6363" : pct > 75 ? "#ffbc33" : "#5fc992",
                }}
              />
            </div>
            <p
              className="text-xs mt-1.5"
              style={{ color: "#6a6b6c", letterSpacing: "0.2px" }}
            >
              {pct.toFixed(1)}% of budget used
            </p>
          </div>
        </div>
      )}

      {/* Crew */}
      <div style={cardStyle}>
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Users className="h-4 w-4" style={{ color: "#55b3ff" }} />
          <h2
            className="text-sm font-semibold"
            style={{
              color: "#f9f9f9",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Crew
          </h2>
          <span className="ml-auto text-xs" style={{ color: "#6a6b6c" }}>
            {crew.length} members
          </span>
        </div>
        {crew.length === 0 ? (
          <div
            className="px-6 py-10 text-center text-sm"
            style={{ color: "#6a6b6c" }}
          >
            No crew assigned yet.
          </div>
        ) : (
          <div>
            {crew.map((m, i) => (
              <div
                key={m.assignment_id}
                className="rc-row flex items-center justify-between px-6 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="font-display text-xs w-5 tabular-nums"
                    style={{ color: "rgba(249,249,249,0.15)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#f9f9f9", letterSpacing: "0.1px" }}
                    >
                      {m.crew_member_name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#6a6b6c", letterSpacing: "0.2px" }}
                    >
                      {m.job_title} · {m.department_name}
                    </p>
                  </div>
                </div>
                {m.role_on_film && (
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-md"
                    style={{
                      border: "1px solid rgba(85,179,255,0.25)",
                      color: "#55b3ff",
                      background: "rgba(85,179,255,0.08)",
                    }}
                  >
                    {m.role_on_film}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
