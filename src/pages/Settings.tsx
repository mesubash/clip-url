import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/shared/CopyButton";
import { Key, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiKey, setApiKey] = useState("sk_live_xxxxxxxxxxxxxxxxxxxx");
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "Profile updated",
      description: "Your changes have been saved",
    });
    setIsLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
    setCurrentPassword("");
    setNewPassword("");
    setIsLoading(false);
  };

  const handleGenerateApiKey = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 26)}`;
    setApiKey(newKey);
    toast({
      title: "API key generated",
      description: "Your new API key is ready",
    });
    setIsLoading(false);
  };

  const handleRevokeApiKey = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setApiKey("");
    toast({
      title: "API key revoked",
      description: "Your API key has been revoked",
    });
    setIsLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleProfileSave} disabled={isLoading}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Key</CardTitle>
            <CardDescription>
              Use your API key to integrate with external services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKey ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-2.5 font-mono text-sm">
                    <span className="text-muted-foreground">
                      {apiKey.substring(0, 12)}••••••••••••••••
                    </span>
                  </div>
                  <CopyButton value={apiKey} variant="outline" />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerateApiKey}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRevokeApiKey}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Revoke
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleGenerateApiKey} disabled={isLoading}>
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
