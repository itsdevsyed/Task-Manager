import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../../../context/AuthContext"; 
import { signupApi } from "../api";
import { Loader2, UserPlus } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const data = await signupApi(formData);

      if (data.token && data.user) {
        login(data.user, data.token);

        navigate("/tasks");
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      const fieldErrors = err.response?.data?.fields;

      if (fieldErrors) {
        const firstField = Object.values(fieldErrors)[0] as string;
        setError(firstField);
      } else {
        setError(serverError || "Connection failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-zinc-950" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Enter your details to get started with TaskManager
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase font-bold tracking-widest">Full Name</Label>
              <Input
                placeholder="John Doe"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-zinc-700 h-11"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase font-bold tracking-widest">Email Address</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-zinc-700 h-11"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase font-bold tracking-widest">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-zinc-700 h-11"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-100 text-zinc-950 hover:bg-white h-11 font-bold transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <Link to="/login" className="text-zinc-200 hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
