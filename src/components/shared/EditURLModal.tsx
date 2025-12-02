import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditURLModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: {
    id: string;
    alias: string;
    expiresAt?: string;
  };
  onSave: (data: { alias: string; expiresAt?: string }) => void;
}

export function EditURLModal({ open, onOpenChange, url, onSave }: EditURLModalProps) {
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Sync state when url prop changes
  useEffect(() => {
    if (url) {
      setAlias(url.alias || "");
      // Format date for input if exists
      setExpiresAt(url.expiresAt ? url.expiresAt.split("T")[0] : "");
    }
  }, [url]);

  const handleSave = () => {
    onSave({ alias, expiresAt: expiresAt || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="alias">Custom Alias</Label>
            <Input
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="my-custom-link"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires">Expiration Date (Optional)</Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            {expiresAt && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setExpiresAt("")}
              >
                Clear expiration
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
