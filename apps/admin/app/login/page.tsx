"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";

export default function LoginPage() {
  const [step, setStep] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(`${apiUrl}/auth/${step === "password" ? "login" : "verify-otp"}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(step === "password" ? { email, password } : { code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Authentication failed");
      if (step === "password") { setStep("otp"); setRemaining(data.expiresIn ?? 60); setMessage("A verification code was sent to the admin email."); } else { router.push("/"); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication failed"); } finally { setBusy(false); }
  }

  return <main className="login-shell"><div className="login-mark">AHR<span>.</span><small>private workspace</small></div><section className="login-panel"><p className="admin-kicker">Owner authentication</p><h1>{step === "password" ? <>Enter the<br /><em>control room.</em></> : <>Check your<br /><em>inbox.</em></>}</h1><p className="login-copy">{step === "password" ? "Use the owner credentials to begin a secure session." : "Enter the six-digit code. It is valid for 60 seconds and can only be used once."}</p><form onSubmit={submit}>{step === "password" ? <><label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label></> : <><label>Verification code<input className="otp-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></label><div className={remaining <= 10 ? "login-timer urgent" : "login-timer"}>{remaining}s remaining</div></>}<button type="submit" disabled={busy || (step === "otp" && remaining === 0)}>{busy ? "Verifying…" : step === "password" ? "Continue →" : "Verify and enter →"}</button></form>{message && <p className="login-message" role="status">{message}</p>}</section></main>;
}
