"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUserRecord, UserRole } from "@igh-connect/shared";
import { api, ApiError } from "@/lib/api";

type FormState = {
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: "active" | "suspended";
  allowDispatchPortal: boolean;
  allowAdministratorPortal: boolean;
};

const emptyForm = (): FormState => ({
  email: "",
  password: "",
  phone: "",
  role: "admin",
  status: "active",
  allowDispatchPortal: true,
  allowAdministratorPortal: true,
});

function formFromUser(u: AdminUserRecord): FormState {
  return {
    email: u.email,
    password: "",
    phone: u.phone ?? "",
    role: u.role,
    status: u.status,
    allowDispatchPortal: u.allowDispatchPortal,
    allowAdministratorPortal: u.allowAdministratorPortal,
  };
}

export function UsersManagement({ onAuthError }: { onAuthError: () => void }) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await api<{ users: AdminUserRecord[] }>("/admin/users");
    setUsers(res.users);
  }, []);

  useEffect(() => {
    load()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          onAuthError();
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => setLoading(false));
  }, [load, onAuthError]);

  function openAdd() {
    setForm(emptyForm());
    setEditingId(null);
    setModal("add");
  }

  function openEdit(u: AdminUserRecord) {
    setForm(formFromUser(u));
    setEditingId(u.id);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (modal === "add") {
        await api("/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            role: form.role,
            status: form.status,
            allowDispatchPortal:
              form.role === "admin" ? form.allowDispatchPortal : false,
            allowAdministratorPortal:
              form.role === "admin" ? form.allowAdministratorPortal : false,
          }),
        });
      } else if (editingId) {
        const body: Record<string, unknown> = {
          email: form.email,
          phone: form.phone || null,
          role: form.role,
          status: form.status,
        };
        if (form.password) body.password = form.password;
        if (form.role === "admin") {
          body.allowDispatchPortal = form.allowDispatchPortal;
          body.allowAdministratorPortal = form.allowAdministratorPortal;
        }
        await api(`/admin/users/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      closeModal();
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: AdminUserRecord) {
    if (
      !confirm(
        `Delete ${u.email}? This cannot be undone. Active rides may block deletion.`
      )
    ) {
      return;
    }
    setError(null);
    try {
      await api(`/admin/users/${u.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function togglePortal(
    u: AdminUserRecord,
    field: "allowDispatchPortal" | "allowAdministratorPortal"
  ) {
    if (u.role !== "admin") return;
    setError(null);
    try {
      await api(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          [field]: !u[field],
        }),
      });
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-sm text-slate-400">
            Manage riders, drivers, and staff. Portal access applies to admin accounts only.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          Add user
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Loading users…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Dispatch</th>
                <th className="px-3 py-2 font-medium">Administrator</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-800">
                  <td className="px-3 py-3">
                    <p className="font-medium">{u.email}</p>
                    {u.phone && (
                      <p className="text-xs text-slate-500">{u.phone}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 capitalize">{u.role}</td>
                  <td className="px-3 py-3 capitalize">{u.status}</td>
                  <td className="px-3 py-3">
                    {u.role === "admin" ? (
                      <button
                        type="button"
                        className={
                          u.allowDispatchPortal
                            ? "rounded-full bg-brand-600/30 px-2 py-0.5 text-xs text-brand-300"
                            : "rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400"
                        }
                        onClick={() => togglePortal(u, "allowDispatchPortal")}
                      >
                        {u.allowDispatchPortal ? "Allowed" : "Off"}
                      </button>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {u.role === "admin" ? (
                      <button
                        type="button"
                        className={
                          u.allowAdministratorPortal
                            ? "rounded-full bg-brand-600/30 px-2 py-0.5 text-xs text-brand-300"
                            : "rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400"
                        }
                        onClick={() =>
                          togglePortal(u, "allowAdministratorPortal")
                        }
                      >
                        {u.allowAdministratorPortal ? "Allowed" : "Off"}
                      </button>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      className="btn-secondary mr-2"
                      onClick={() => openEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-red-300"
                      onClick={() => handleDelete(u)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="px-3 py-6 text-center text-slate-500">No users yet</p>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSave}
            className="card max-h-[90vh] w-full max-w-md overflow-y-auto space-y-4"
          >
            <h3 className="text-lg font-semibold">
              {modal === "add" ? "Add user" : "Edit user"}
            </h3>

            <div>
              <label className="mb-1 block text-sm text-slate-400">Email</label>
              <input
                className="input w-full"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Password {modal === "edit" && "(leave blank to keep)"}
              </label>
              <input
                className="input w-full"
                type="password"
                required={modal === "add"}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">Phone</label>
              <input
                className="input w-full"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">Role</label>
              <select
                className="input w-full"
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setForm({
                    ...form,
                    role,
                    allowDispatchPortal: role === "admin",
                    allowAdministratorPortal: role === "admin",
                  });
                }}
              >
                <option value="admin">Admin (staff)</option>
                <option value="driver">Driver</option>
                <option value="rider">Rider</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">Status</label>
              <select
                className="input w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "active" | "suspended",
                  })
                }
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {form.role === "admin" && (
              <div className="space-y-2 rounded-lg border border-slate-700 p-3">
                <p className="text-sm font-medium text-slate-300">Portal access</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowDispatchPortal}
                    onChange={(e) =>
                      setForm({ ...form, allowDispatchPortal: e.target.checked })
                    }
                  />
                  Allow Dispatch login
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowAdministratorPortal}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        allowAdministratorPortal: e.target.checked,
                      })
                    }
                  />
                  Allow Administrator login
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
