import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Moon, Palette, Sun, Monitor, Check } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import BASE_URL from "@/config/base-url";
import { motion } from "framer-motion";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { trigger: changePasswordTrigger } = useApiMutation();

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!oldPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsLoading(true);
      const res = await changePasswordTrigger({
        url: `${BASE_URL}/change-password`,
        method: "post",
        data: {
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong while changing password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    {
      id: "light",
      label: "Light",
      icon: Sun,
      description: "Clean bright interface",
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
      description: "Deep monochromatic dark mode",
    },
    {
      id: "system",
      label: "System",
      icon: Monitor,
      description: "Sync with OS theme preferences",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-4xl"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your account security and interface appearance.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 🔹 Appearance / Theme Settings */}
        <Card className="rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-semibold">Appearance & Theme</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Customize how AG Solutions CRM looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mounted ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-border/80 hover:bg-accent/40"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                      <div className="p-2 rounded-lg bg-muted mb-2 text-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-xs text-foreground">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 bg-muted/40 animate-pulse rounded-lg" />
            )}
          </CardContent>
        </Card>

        {/* 🔹 Password Change Settings */}
        <Card className="rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Ensure your account is using a long, secure password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="old-password" className="text-xs">Current Password</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="pr-10 h-9 text-xs rounded-lg border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="pr-10 h-9 text-xs rounded-lg border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10 h-9 text-xs rounded-lg border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-9 px-4 text-xs font-medium rounded-lg shadow-xs"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;
