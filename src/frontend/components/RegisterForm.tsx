"use client";
import React, { useState } from "react";
import { Facebook, Github, Eye, EyeOff } from "lucide-react";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useRouter } from "next/navigation";
import { postSignup } from "@/lib/fast-api/auth";
export default function RegisterForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.refresh();
    if (!agree) {
      setError("You must agree to the Terms & Privacy");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!inviteCode || inviteCode.trim().length === 0) {
      setError("Invite code is required");
      return;
    }

    setError("");

    try {
      await postSignup({
        username,
        password,
        invite_code: inviteCode.trim(),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-semibold mb-2">Register</h2>
      <p className="text-sm text-gray-500 mb-6">Create New VietLedgr Account</p>

      <form onSubmit={onSubmit} className="space-y-4">
        {!!error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Invite Code <span className="text-red-500">*</span>
          </label>
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="8-char code"
          />
          <p className="text-xs text-gray-500 mt-1">
            You need an invite code from an Admin or Manager.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">
              I agree to the{" "}
              <a className="text-orange-500 hover:underline" href="#">
                Terms & Privacy
              </a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-400 text-white py-2 rounded-md disabled:opacity-60"
          disabled={!agree}
        >
          Sign Up
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-orange-500 hover:underline"
        >
          Sign In Instead
        </button>
      </p>    </div>
  );
}
