import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Check, AlertCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/shared/GoogleLoginButton";
import { authService } from "@/lib/auth";
import { validateEmail, validateName, validatePasswordStrength } from "@/lib/validation";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { register, setUser } = useAuth();

  const passwordStrength = validatePasswordStrength(password);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    const nameResult = validateName(name);
    if (!nameResult.isValid) {
      newErrors.name = nameResult.error;
    }
    
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error;
    }
    
    if (!passwordStrength.isValid) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      toast({
        title: "Account created!",
        description: "Welcome to ClipURL. Check your email to verify your account!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setIsGoogleLoading(true);
    try {
      const user = await authService.googleAuth(credential);
      setUser(user);
      toast({
        title: "Welcome!",
        description: "Your account has been created with Google",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Google sign-up failed",
        description: error instanceof Error ? error.message : "Failed to sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    toast({
      title: "Google sign-up error",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md card-elevated animate-in-scale border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Start clipping your links today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-4">
            {/* Google OAuth Button */}
            <div className="space-y-4">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isLoading || isGoogleLoading}
                text="signup_with"
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                required
                className={`h-11 input-focus ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                required
                className={`h-11 input-focus ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  required
                  className={`h-11 pr-10 input-focus ${errors.password ? "border-destructive" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1 mb-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
              {/* Password strength indicators */}
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${passwordStrength.requirements.length ? 'bg-green-500' : 'bg-muted'}`}>
                    {passwordStrength.requirements.length ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className={`text-xs transition-colors ${passwordStrength.requirements.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${passwordStrength.requirements.uppercase ? 'bg-green-500' : 'bg-muted'}`}>
                    {passwordStrength.requirements.uppercase ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className={`text-xs transition-colors ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${passwordStrength.requirements.number ? 'bg-green-500' : 'bg-muted'}`}>
                    {passwordStrength.requirements.number ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className={`text-xs transition-colors ${passwordStrength.requirements.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${passwordStrength.requirements.special ? 'bg-green-500' : 'bg-muted'}`}>
                    {passwordStrength.requirements.special ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className={`text-xs transition-colors ${passwordStrength.requirements.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                    One special character
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 gradient-primary btn-glow text-primary-foreground font-medium" 
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Register;
