"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radar } from "lucide-react";
import { readJson } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OrbBackground from "@/components/decor/orb-background";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(u: string, p: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <OrbBackground className="opacity-60" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col gap-8 md:flex-row md:items-start">
        <Card className="w-full max-w-sm border border-border/60 bg-card/90 p-2 shadow-2xl backdrop-blur">
          <CardHeader className="items-center gap-2 text-center">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <Radar className="size-5 text-primary" />
              SyncSpace
            </Link>
            <p className="text-sm text-muted-foreground">Sign in to your team&rsquo;s notebook</p>
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void signIn(username, password);
              }}
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={busy} className="mt-1 w-full">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="hidden max-w-sm flex-col gap-4 pt-6 text-sm text-muted-foreground md:flex">
          <p className="font-display text-2xl text-foreground">
            Every briefing, cited back to the source.
          </p>
          <p>
            SyncSpace reframes the same verified facts for your role —
            engineering, marketing, product, or executive.
          </p>
        </div>
      </div>
    </main>
  );
}
