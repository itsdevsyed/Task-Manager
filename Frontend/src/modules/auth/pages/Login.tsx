import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { loginApi } from "../api";
import { setToken } from "@/store/auth.store";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await loginApi({ email, password });

      setToken(res.token);

      navigate("/tasks");
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090b] selection:bg-primary/30">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_farthest-side_at_50%_100%,#18181b,transparent)] opacity-50 pointer-events-none" />

      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl shadow-black/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-100">
            Login
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Enter your details to sign in
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="text-zinc-400 font-medium ml-0.5">
                Email
              </Label>
              <Input
                type="email"
                placeholder="Enter email"
                className="bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-400 font-medium ml-0.5">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Enter password"
                className="bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold"
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
