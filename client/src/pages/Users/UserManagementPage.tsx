import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, UserX, Loader2 } from "lucide-react";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { deleteUser, listUsers, updateUser } from "../../services/users";
import { User } from "../../types";
import { useAuth, getErrorMessage } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export function UserManagementPage() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusId, setStatusId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load users"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function disableUser(user: User) {
    if (statusId) return;
    setStatusId(user.id);
    try {
      await updateUser(user.id, {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? undefined,
        username: user.username,
        role: user.role,
        status: user.status === "Active" ? "Inactive" : "Active",
      });
      toast.success(user.status === "Active" ? "User disabled" : "User activated");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update user"));
    } finally {
      setStatusId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteId || deleting) return;
    setDeleting(true);
    try {
      await deleteUser(deleteId);
      toast.success("Deleted successfully");
      setDeleteId(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete user"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loading label="Loading users..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Add, edit, disable, or remove accounts."
        actions={
          <Link to="/users/new" className="btn-primary">
            Add User
          </Link>
        }
      />

      <div className="hidden overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {["Name", "Email", "Username", "Role", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-3">{u.fullName}</td>
                <td className="px-3 py-3">{u.email}</td>
                <td className="px-3 py-3">{u.username}</td>
                <td className="px-3 py-3">{u.role}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Link className="icon-btn" to={`/users/${u.id}/edit`} title="Edit">
                      <Pencil size={20} />
                    </Link>
                    <button
                      type="button"
                      className="icon-btn"
                      disabled={statusId === u.id}
                      title={u.status === "Active" ? "Disable" : "Enable"}
                      onClick={() => disableUser(u)}
                    >
                      {statusId === u.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <UserX size={20} />
                      )}
                    </button>
                    {u.id !== me?.id ? (
                      <button
                        type="button"
                        className="icon-btn-danger"
                        title="Delete"
                        onClick={() => setDeleteId(u.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <Card key={u.id}>
            <p className="font-display text-base font-semibold">{u.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {u.email} · {u.role} · {u.status}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link className="btn-secondary w-full sm:w-auto" to={`/users/${u.id}/edit`}>
                Edit
              </Link>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                loading={statusId === u.id}
                onClick={() => disableUser(u)}
              >
                {u.status === "Active" ? "Disable" : "Enable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(deleteId)}
        title="Delete user?"
        message="This account will be permanently removed."
        confirmLabel="Delete"
        busyLabel="Deleting..."
        danger
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
