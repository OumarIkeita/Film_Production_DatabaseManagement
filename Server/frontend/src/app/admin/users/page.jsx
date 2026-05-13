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
import { AlertCircle, Plus, Shield } from "lucide-react";
import api from "@/lib/axios";

const ROLES = ["admin", "producer", "crew_member", "accountant"];
const EMPTY_FORM = {
  username: "",
  email: "",
  full_name: "",
  password: "",
  role: "crew_member",
};

const ROLE_STYLES = {
  admin: {
    color: "#FF6363",
    background: "rgba(255,99,99,0.08)",
    border: "1px solid rgba(255,99,99,0.2)",
  },
  producer: {
    color: "#ffbc33",
    background: "rgba(255,188,51,0.08)",
    border: "1px solid rgba(255,188,51,0.2)",
  },
  accountant: {
    color: "#55b3ff",
    background: "rgba(85,179,255,0.08)",
    border: "1px solid rgba(85,179,255,0.2)",
  },
  crew_member: {
    color: "#9c9c9d",
    background: "rgba(156,156,157,0.08)",
    border: "1px solid rgba(156,156,157,0.2)",
  },
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

export default function AdminUsersPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setFetching(true);
    api
      .get("/users/")
      .then((res) => setUsers(res.data?.results || res.data || []))
      .catch(() => setError("Failed to load users."))
      .finally(() => setFetching(false));
  };
  useEffect(() => {
    if (user && isAdmin()) fetchUsers();
  }, [user]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setEditTarget(u);
    setForm({
      username: u.username,
      email: u.email,
      full_name: u.full_name || "",
      password: "",
      role: u.role,
    });
    setModalOpen(true);
  };
  const handleToggle = async (u) => {
    await api
      .patch(`/users/${u.user_id}/`, { is_active: !u.is_active })
      .catch(() => setError("Update failed."));
    fetchUsers();
  };
  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    await api
      .delete(`/users/${u.user_id}/`)
      .catch(() => setError("Delete failed."));
    fetchUsers();
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      editTarget
        ? await api.put(`/users/${editTarget.user_id}/`, payload)
        : await api.post("/users/", payload);
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(" ") : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "username", label: "Username" },
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (v) => {
        const s = ROLE_STYLES[v] || ROLE_STYLES.crew_member;
        return (
          <span className="status-pill" style={s}>
            {v.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      render: (v, row) => (
        <button
          onClick={() => handleToggle(row)}
          className="status-pill transition-opacity hover:opacity-60"
          style={
            v
              ? {
                  color: "#5fc992",
                  background: "rgba(95,201,146,0.08)",
                  border: "1px solid rgba(95,201,146,0.2)",
                }
              : {
                  color: "#FF6363",
                  background: "rgba(255,99,99,0.08)",
                  border: "1px solid rgba(255,99,99,0.2)",
                }
          }
        >
          {v ? "Active" : "Inactive"}
        </button>
      ),
    },
  ];

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
            <Shield className="h-3.5 w-3.5" style={{ color: "#FF6363" }} />
            <p
              className="text-xs font-medium"
              style={{
                color: "#FF6363",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Admin
            </p>
          </div>
          <h1
            className="font-display text-4xl tracking-widest"
            style={{ color: "#f9f9f9" }}
          >
            USERS
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6a6b6c", letterSpacing: "0.2px" }}
          >
            {users.length} users registered
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rc-btn-secondary flex items-center gap-2 px-4 h-9 text-xs font-semibold"
          style={{ letterSpacing: "0.3px" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add User
        </button>
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
        data={users}
        loading={fetching}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit User" : "Add User"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              className="rc-input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Username *</label>
            <input
              className="rc-input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              className="rc-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>
              Password
              {editTarget && (
                <span
                  style={{
                    color: "#6a6b6c",
                    textTransform: "none",
                    letterSpacing: "normal",
                    fontWeight: 400,
                  }}
                >
                  {" "}
                  (blank = keep)
                </span>
              )}
            </label>
            <input
              type="password"
              className="rc-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editTarget}
            />
          </div>
          <div>
            <label style={labelStyle}>Role *</label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
            >
              <SelectTrigger className="rc-input h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={selectContentStyle}>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {saving ? "Saving..." : editTarget ? "Save Changes" : "Add User"}
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
