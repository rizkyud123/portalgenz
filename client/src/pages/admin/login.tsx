import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: () => {
      toast({
        title: "Login berhasil",
        description: "Selamat datang di dashboard admin",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Login gagal",
        description: error.message || "Username atau password salah",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Username dan password harus diisi",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2" data-testid="admin-portal-title">NewsPortal</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="admin-panel-title">Admin Panel</h2>
          <p className="text-muted-foreground" data-testid="login-description">Masuk ke dashboard admin untuk mengelola konten</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login Admin</CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial admin untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="username-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    data-testid="remember-me-checkbox"
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                    Ingat saya
                  </Label>
                </div>
                
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  data-testid="forgot-password-link"
                >
                  Lupa password?
                </button>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="login-button"
              >
                {loginMutation.isPending ? "Masuk..." : "Masuk"}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2" data-testid="demo-credentials-title">Demo Credentials:</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p data-testid="demo-admin">
                  <strong>Admin:</strong> admin / admin123
                </p>
                <p data-testid="demo-editor">
                  <strong>Editor:</strong> editor / editor123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
