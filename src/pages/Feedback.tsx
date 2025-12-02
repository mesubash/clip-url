import { useState } from "react";
import { MessageSquare, Send, Bug, Lightbulb, AlertCircle, HelpCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateFeedback, type FeedbackCreate } from "@/hooks/useFeedback";

const feedbackTypes = [
  { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-yellow-500" },
  { value: "complaint", label: "Complaint", icon: AlertCircle, color: "text-red-500" },
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-orange-500" },
  { value: "other", label: "Other", icon: HelpCircle, color: "text-blue-500" },
] as const;

const Feedback = () => {
  const { isAuthenticated, user } = useAuth();
  const createFeedback = useCreateFeedback();
  
  const [type, setType] = useState<FeedbackCreate["type"]>("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subject.length < 5) {
      toast({
        title: "Subject too short",
        description: "Subject must be at least 5 characters",
        variant: "destructive",
      });
      return;
    }

    if (message.length < 10) {
      toast({
        title: "Message too short",
        description: "Message must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated && !email) {
      toast({
        title: "Email required",
        description: "Please provide your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFeedback.mutateAsync({
        type,
        subject,
        message,
        email: isAuthenticated ? undefined : email,
      });
      
      setSubmitted(true);
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setType("suggestion");
    setSubject("");
    setMessage("");
    setEmail("");
    setSubmitted(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Send us Feedback</h1>
            <p className="text-muted-foreground mt-2">
              We'd love to hear from you! Share your suggestions, report issues, or just say hi.
            </p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="card-elevated p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold">Thank you for your feedback!</h2>
              <p className="text-muted-foreground">
                Your message has been received. We appreciate you taking the time to help us improve.
              </p>
              <Button onClick={handleReset} variant="outline">
                Submit Another
              </Button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as FeedbackCreate["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          {item.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email (for non-logged in users) */}
              {!isAuthenticated && (
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll use this to follow up if needed
                  </p>
                </div>
              )}

              {isAuthenticated && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Submitting as <span className="font-medium text-foreground">{user?.email}</span>
                  </p>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of your feedback"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={255}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {subject.length}/255
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/5000
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createFeedback.isPending}
                className="w-full gradient-primary btn-glow"
                size="lg"
              >
                {createFeedback.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Feedback;
