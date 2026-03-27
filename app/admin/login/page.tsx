"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ADMIN_SESSION_KEY = "admin:isLoggedIn";

// demo creds (change if you want)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const COLORS = {
  olive: "#5A5E27",
  burgundy: "#640017",
  chocolate: "#2F1B1A",
  ivory: "#EFEFC9",
} as const;

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInHere, setLoggedInHere] = useState(false);

  function login() {
  if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    alert("Wrong username or password");
    return;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, "true");

  // ✅ auto redirect
  router.push("/admin/dashboard");
}
  return (
    <main style={page}>
      <div style={card}>
        <div style={topLine} />
        <h1 style={title}>ADMIN LOGIN</h1>
        <p style={subTitle}>Sign in to manage appointments & staff.</p>

        {!loggedInHere ? (
          <>
            <label style={label}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              style={input}
            />

            <label style={label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              autoComplete="current-password"
              style={input}
            />

            <button type="button" onClick={login} style={primaryBtn}>
              LOGIN
            </button>

            <div style={hintRow}>
              <span style={dot} />
              <span style={hintText}>College project mode (local login only).</span>
            </div>
          </>
        ) : (
          <>
            <div style={successBox}>
              <div style={successTitle}>Access granted</div>
              <div style={successText}>You can open the dashboard whenever you want.</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={() => router.push("/admin")} style={primaryBtn}>
                GO TO DASHBOARD
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername("");
                  setPassword("");
                }}
                style={ghostBtn}
              >
                STAY HERE
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: COLORS.ivory,
  color: COLORS.chocolate,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  borderRadius: 22,
  padding: 24,
  background: "rgba(255,255,255,0.60)",
  border: "1px solid rgba(47,27,26,0.14)",
  boxShadow: "0 28px 80px rgba(47,27,26,0.12)",
  backdropFilter: "blur(8px)",
};

const topLine: React.CSSProperties = {
  height: 3,
  width: 84,
  borderRadius: 999,
  background: COLORS.olive,
  opacity: 0.9,
};

const title: React.CSSProperties = {
  margin: "16px 0 0 0",
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

const subTitle: React.CSSProperties = {
  margin: "10px 0 0 0",
  color: "rgba(47,27,26,0.70)",
  lineHeight: 1.4,
};

const label: React.CSSProperties = {
  display: "block",
  marginTop: 18,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const input: React.CSSProperties = {
  width: "100%",
  height: 46,
  marginTop: 10,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(47,27,26,0.18)",
  outline: "none",
  background: "rgba(255,255,255,0.85)",
  color: COLORS.chocolate,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  height: 46,
  marginTop: 18,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: COLORS.burgundy,
  color: COLORS.ivory,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  cursor: "pointer",
  boxShadow: "0 16px 40px rgba(100,0,23,0.22)",
};

const ghostBtn: React.CSSProperties = {
  flex: 1,
  height: 46,
  borderRadius: 14,
  border: "1px solid rgba(47,27,26,0.18)",
  background: "transparent",
  color: COLORS.chocolate,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  cursor: "pointer",
};

const hintRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 14,
  color: "rgba(47,27,26,0.65)",
  fontSize: 13,
};

const dot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: COLORS.olive,
  opacity: 0.9,
};

const hintText: React.CSSProperties = {
  letterSpacing: "0.02em",
};

const successBox: React.CSSProperties = {
  marginTop: 18,
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(90,94,39,0.35)",
  background: "rgba(239,239,201,0.65)",
};

const successTitle: React.CSSProperties = {
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const successText: React.CSSProperties = {
  marginTop: 8,
  color: "rgba(47,27,26,0.72)",
};