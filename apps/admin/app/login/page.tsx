"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";
type Step = "password" | "otp" | "totp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => { if (!remaining) return; const timer = window.setInterval(() => setRemaining((v) => Math.max(v - 1, 0)), 1000); return () => window.clearInterval(timer); }, [remaining]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(""); try { const endpoint = step === "password" ? "login" : step === "otp" ? "verify-otp" : "verify-totp"; const body = step === "password" ? { email, password } : { code }; const response = await fetch(`${apiUrl}/auth/${endpoint}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message ?? "Authentication failed"); if (data.authenticated) { router.push("/"); return; } if (step === "password") { setStep(data.requiresOtp ? "otp" : "totp"); setRemaining(data.expiresIn ?? 60); setMessage(data.requiresOtp ? "A verification code was sent to your email." : "Enter your authenticator code."); } else if (step === "otp" && data.requiresTotp) { setStep("totp"); setCode(""); setMessage("Email verified. Enter your authenticator code."); } else router.push("/"); } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication failed"); } finally { setBusy(false); } }
  const isOtp = step === "otp";
  return <main className="login-shell"><div className="login-mark">AHR<span>.</span><small>private workspace</small></div><section className="login-panel"><p className="admin-kicker">Owner authentication</p><h1>{step === "password" ? <>Enter the<br /><em>control room.</em></> : step === "otp" ? <>Check your<br /><em>inbox.</em></> : <>Verify your<br /><em>authenticator.</em></>}</h1><p className="login-copy">{step === "password" ? "Use the owner credentials to begin a secure session." : isOtp ? "Enter the six-digit email code. It expires in 60 seconds." : "Enter the current six-digit authenticator code."}</p><form onSubmit={submit}>{step === "password" ? <><label>Email<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /><button className="password-toggle" type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label></> : <><label>{isOtp ? "Email verification code" : "Authenticator code"}<input className="otp-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></label>{isOtp && <div className="login-timer">{remaining}s remaining</div>}</>}<button type="submit" disabled={busy || (step === "otp" && remaining === 0)}>{busy ? "Verifying…" : step === "password" ? "Continue" : "Verify and enter"}</button></form>{message && <p className="login-message" role="status">{message}</p>}</section></main>;
}

