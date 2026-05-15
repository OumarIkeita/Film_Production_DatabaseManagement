"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/Navbar";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Plus, Film } from "lucide-react";
import api from "@/lib/axios";

const EMPTY_FORM = {
  title: "",
  genre: "",
  status: "development",
  project_type: "",
  start_date: "",
  end_date: "",
  description: "",
  total_budget: 0,
  production_compony: "",
};

const PROJECT_TYPE_OPTIONS = [
  { value: "Movie", label: "Feature Film" },
  { value: "SHORT", label: "Short Film" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "SERIES", label: "TV Series" },
];

const STATUS_OPTIONS = [
  "development",
  "pre_production",
  "production",
  "post_production",
  "completed",
  "cancelled",
];

const labelStyle = {
  color: "#9c9c9d",
  fontSize: "0.65rem",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "6px",
};

export default function FilmsPage() {
  const { user, isProducer } = useAuth();
  const [films, setFilms] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchFilms = () => {
    setFetching(true);
    api
      .get("/films/")
      .then((res) => setFilms(res.data?.results || res.data || []))
      .catch(() => setError("Failed to load films."))
      .finally(() => setFetching(false));
  };
  useEffect(() => {
    if (user) fetchFilms();
  }, [user]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };
  const openEdit = (film) => {
    setEditTarget(film);
    setForm({
      title: film.title,
      genre: film.genre || "",
      status: film.status,
      project_type: film.project_type || "",
      start_date: film.start_date || "",
      end_date: film.end_date || "",
      description: film.description || "",
      total_budget: film.total_budget || "",
      production_compony: film.production_compony || "",
    });
    setModalOpen(true);
  };
  const handleDelete = async (film) => {
    if (!confirm(`Delete "${film.title}"?`)) return;
    await api
      .delete(`/films/${film.film_id}/`)
      .catch(() => setError("Failed to delete."));
    fetchFilms();
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      editTarget
        ? await api.put(`/films/${editTarget.film_id}/`, form)
        : await api.post("/films/", form);
      setModalOpen(false);
      fetchFilms();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(" ") : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (v, row) => (
        <Link
          href={`/films/${row.film_id}`}
          className="font-medium transition-opacity hover:opacity-60"
          style={{ color: "#f9f9f9" }}
        >
          {v}
        </Link>
      ),
    },
    { key: "genre", label: "Genre" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-3.5 w-3.5" style={{ color: "#FF6363" }} />
            <p
              className="text-xs font-medium"
              style={{
                color: "#FF6363",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Library
            </p>
          </div>
          <h1
            className="font-display text-4xl tracking-widest"
            style={{ color: "#f9f9f9" }}
          >
            FILMS
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6a6b6c", letterSpacing: "0.2px" }}
          >
            {films.length} films in the system
          </p>
        </div>
        {isProducer() && (
          <button
            onClick={openCreate}
            className="rc-btn-secondary flex items-center gap-2 px-4 h-9 text-xs font-semibold"
            style={{ letterSpacing: "0.3px" }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Film
          </button>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-2.5 text-xs rounded-lg px-4 py-3"
          style={{
            color: "#FF6363",
            background: "rgba(255,99,99,0.08)",
            border: "1px solid rgba(255,99,99,0.2)",
          }}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={films}
        loading={fetching}
        onEdit={isProducer() ? openEdit : null}
        onDelete={isProducer() ? handleDelete : null}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Film" : "Add Film"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              className="rc-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Genre</label>
              <input
                className="rc-input"
                placeholder="e.g. Drama"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="rc-input h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "rgb(16,17,17)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Project Type *</label>
              <Select
                value={form.project_type}
                onValueChange={(v) => setForm({ ...form, project_type: v })}
              >
                <SelectTrigger className="rc-input h-10 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "rgb(16,17,17)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                >
                  {PROJECT_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={labelStyle}>Production Company</label>
              <input
                className="rc-input"
                placeholder="e.g. Warner Bros."
                value={form.production_compony}
                onChange={(e) => setForm({ ...form, production_compony: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                className="rc-input"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                className="rc-input"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              className="rc-input min-h-[80px] resize-none"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div>
            <label style={labelStyle}>Total Budget ($) *</label>
            <input
              type="number"
              className="rc-input"
              value={form.total_budget}
              onChange={(e) =>
                setForm({ ...form, total_budget: e.target.value })
              }
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rc-btn-primary disabled:opacity-40"
              style={{
                height: "40px",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.3px",
              }}
            >
              {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Film"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rc-btn-secondary px-4"
              style={{ height: "40px", fontSize: "0.875rem" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
