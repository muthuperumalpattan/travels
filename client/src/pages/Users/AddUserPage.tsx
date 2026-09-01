import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Select } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import { PageHeader } from "../../components/PageHeader";
import { createUser, getUser, updateUser } from "../../services/users";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../context/AuthContext";

export function AddUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Staff");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (!id) return;
    getUser(id)
      .then((res) => {
        setFullName(res.data.fullName);
        setEmail(res.data.email);
        setPhone(res.data.phone ?? "");
        setUsername(res.data.username);
        setRole(res.data.role);
        setStatus(res.data.status);
      })
      .catch((error) => toast.error(getErrorMessage(error, "Unable to load user")))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      const body = { fullName, email, phone, username, password: password || undefined, role, status };
      if (id) {
        await updateUser(id, body);
        toast.success("Updated successfully");
      } else {
        await createUser(body);
        toast.success("User added successfully");
      }
      navigate("/users");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save user"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading label="Loading user..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? "Edit User" : "Add User"}
        subtitle="Passwords are hashed on the server and never stored in plain text."
      />
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input
            label={id ? "Password (leave blank to keep)" : "Password"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!id}
            minLength={id ? undefined : 8}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "Admin", label: "Admin" },
              { value: "Manager", label: "Manager" },
              { value: "Staff", label: "Staff" },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={submitting} className="w-full sm:w-auto">
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
