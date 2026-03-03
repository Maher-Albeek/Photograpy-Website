"use client";

import { useState } from "react";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);

    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(
        "If an account exists for that email, a reset link has been sent."
      );
      setEmail("");
      return;
    }

    const payload = await res.json().catch(() => null);
    setError(payload?.error || "Reset failed");
  }

  return (
    <div className="card w-full max-w-sm bg-base-100/80 backdrop-blur shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">Reset Password</h2>
        <p className="text-base-content/70">
          Enter your email to receive a reset link
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
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="input input-bordered"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Send Reset Link"
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
