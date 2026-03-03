"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess("Password updated. You can sign in now.");
      setPassword("");
      setConfirm("");
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.error || "Reset failed");
  }

  return (
    <div className="card w-full max-w-sm bg-base-100/80 backdrop-blur shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">Set New Password</h2>
        <p className="text-base-content/70">
          Enter a new password for your admin account
        </p>

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mt-4">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">New password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !token}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/admin/login" className="link link-hover text-sm">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
