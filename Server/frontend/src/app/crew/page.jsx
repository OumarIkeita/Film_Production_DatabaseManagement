"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Plus, Link2, Users } from "lucide-react";
import api from "@/lib/axios";

const EMPTY_FORM = {
  full_name: "",
  job_title: "",
  project_id: "",
  department_id: "",
  phone: "",
  hire_date: "",
};
const labelStyle = {
  color: "#9c9c9d",
  fontSize: "0.65rem",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "6px",
};

export default function CrewPage() {
  const { user, isProducer } = useAuth();
  const [crew, setCrew] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [films, setFilms] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [crewModal, setCrewModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    film_id: "",
    crew_id: "",
    role_on_film: "",
  });

  const fetchAll = () => {
    setFetching(true);
    Promise.all([
      api.get("/crew/"),
      api.get("/departments/"),
      api.get("/films/"),
    ])
      .then(([c, d, f]) => {
        setCrew(c.data?.results || c.data || []);
        setDepartments(d.data?.results || d.data || []);
        setFilms(f.data?.results || f.data || []);
      })
      .catch(() => setError("Failed to load data."))
      .finally(() => setFetching(false));
  };
  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setCrewModal(true);
  };
  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      full_name: m.full_name || "",
      job_title: m.job_title || "",
      department_id: String(m.department_id || ""),
      project_id: String(m.project_id || ""),
      phone: m.phone || "",
      hire_date: m.hire_date || "",
    });
    setCrewModal(true);
  };
  const handleDelete = async (m) => {
    if (!confirm(`Remove ${m.full_name}?`)) return;
    await api
      .delete(`/crew/${m.crew_id}/`)
      .catch(() => setError("Delete failed."));
    fetchAll();
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      editTarget
        ? await api.put(`/crew/${editTarget.crew_id}/`, form)
        : await api.post("/crew/", form);
      setCrewModal(false);
      fetchAll();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(" ") : "Save failed.");
    } finally {
      setSaving(false);
    }
  };
  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/film-crew/", assignForm);
      setAssignModal(false);
      setAssignForm({ film_id: "", crew_id: "", role_on_film: "" });
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(" ") : "Assignment failed.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "job_title", label: "Job Title" },
    { key: "department_name", label: "Department" },
    { key: "phone", label: "Phone" },
    { key: "hire_date", label: "Hired" },
  ];

  const selectCls = "rc-input h-10 text-sm";
  const selectContentStyle = {
    background: "rgb(16,17,17)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5" style={{ color: "#FF6363" }} />
            <p
              className="text-xs font-medium"
              style={{
                color: "#FF6363",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Roster
            </p>
          </div>
          <h1
            className="font-display text-4xl tracking-widest"
            style={{ color: "#f9f9f9" }}
          >
            CREW
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6a6b6c", letterSpacing: "0.2px" }}
          >
            {crew.length} crew members
          </p>
        </div>
        {isProducer() && (
          <div className="flex gap-2">
            <button
              onClick={() => setAssignModal(true)}
              className="rc-btn-ghost flex items-center gap-2 px-4 h-9 text-xs font-medium rounded-lg"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#9c9c9d",
              }}
            >
              <Link2 className="h-3.5 w-3.5" /> Assign to Film
            </button>
            <button
              onClick={openCreate}
              className="rc-btn-secondary flex items-center gap-2 px-4 h-9 text-xs font-semibold"
              style={{ letterSpacing: "0.3px" }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Crew
            </button>
          </div>
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
        data={crew}
        loading={fetching}
        onEdit={isProducer() ? openEdit : null}
        onDelete={isProducer() ? handleDelete : null}
      />

      <Modal
        isOpen={crewModal}
        onClose={() => setCrewModal(false)}
        title={editTarget ? "Edit Crew Member" : "Add Crew Member"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              className="rc-input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Job Title *</label>
            <input
              className="rc-input"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Department *</label>
            <Select
              value={form.department_id}
              onValueChange={(v) => setForm({ ...form, department_id: v })}
            >
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent style={selectContentStyle}>
                {departments.map((d) => (
                  <SelectItem
                    key={d.department_id}
                    value={String(d.department_id)}
                  >
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={labelStyle}>Assign to Film (Project)</label>
            <Select
              value={form.project_id}
              onValueChange={(v) => setForm({ ...form, project_id: v })}
            >
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Select a film" />
              </SelectTrigger>
              <SelectContent style={selectContentStyle}>
                {/* Use the films state already fetched by your fetchAll() function */}
                {films.map((f) => (
                  <SelectItem key={f.film_id} value={String(f.film_id)}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                className="rc-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Hire Date</label>
              <input
                type="date"
                className="rc-input"
                value={form.hire_date}
                onChange={(e) =>
                  setForm({ ...form, hire_date: e.target.value })
                }
              />
            </div>
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
              {saving
                ? "Saving..."
                : editTarget
                  ? "Save Changes"
                  : "Add Member"}
            </button>
            <button
              type="button"
              onClick={() => setCrewModal(false)}
              className="rc-btn-secondary px-4"
              style={{ height: "40px", fontSize: "0.875rem" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign Crew to Film"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label style={labelStyle}>Film *</label>
            <Select
              value={assignForm.film_id}
              onValueChange={(v) =>
                setAssignForm({ ...assignForm, film_id: v })
              }
            >
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Select film" />
              </SelectTrigger>
              <SelectContent style={selectContentStyle}>
                {films.map((f) => (
                  <SelectItem key={f.film_id} value={String(f.film_id)}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={labelStyle}>Crew Member *</label>
            <Select
              value={assignForm.crew_id}
              onValueChange={(v) =>
                setAssignForm({ ...assignForm, crew_id: v })
              }
            >
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Select crew member" />
              </SelectTrigger>
              <SelectContent style={selectContentStyle}>
                {crew.map((c) => (
                  <SelectItem key={c.crew_id} value={String(c.crew_id)}>
                    {c.full_name} — {c.job_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={labelStyle}>Role on Film</label>
            <input
              className="rc-input"
              placeholder="e.g. Director of Photography"
              value={assignForm.role_on_film}
              onChange={(e) =>
                setAssignForm({ ...assignForm, role_on_film: e.target.value })
              }
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
              {saving ? "Assigning..." : "Assign"}
            </button>
            <button
              type="button"
              onClick={() => setAssignModal(false)}
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
