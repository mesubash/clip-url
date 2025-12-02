import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

type VerificationStatus = "loading" | "success" | "error" | "no-token";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<VerificationStatus>(token ? "loading" : "no-token");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    const verifyEmail = async () => {
      try {
        const user = await authService.verifyEmail(token);
        setUser(user);
        setStatus("success");
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        });
      } catch (err: any) {
        const message = err.message || "Verification failed";
        setErrorMessage(message);
        setStatus("error");
        toast({
          title: "Verification failed",
          description: message,
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [token, setUser]);

  // Loading state
  if (status === "loading") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Verifying your email...</CardTitle>
            <CardDescription>
              Please wait while we verify your email address.
            </CardDescription>
          </CardHeader>
        </Card>
      </AuthLayout>
    );
  }

  // No token
  if (status === "no-token") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Missing Verification Link</CardTitle>
            <CardDescription>
              It looks like you accessed this page without a verification token. Please check your email for the verification link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Link to="/login" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now access all features.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  // Error state
  return (
    <AuthLayout>
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>
            {errorMessage || "The verification link is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Link to="/login" className="w-full">
            <Button className="w-full">Go to Login</Button>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            You can request a new verification email from your account settings.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default VerifyEmail;
