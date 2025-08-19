// src/pages/help/HelpSupportPage.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Send } from "lucide-react";

export const HelpSupportPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const faqs = [
    { q: "How do I create a backup?", a: "Go to the Backup & Restore page and click 'Create Backup'." },
    { q: "How can I restore my system?", a: "Find the backup you want and click 'Restore'." },
    { q: "What is dynamic pricing?", a: "Dynamic pricing uses AI to adjust prices in real-time." },
  ];

  const submitSupportRequest = async () => {
    if (!email || !message) {
      alert("Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/v1/support", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        },
        body: JSON.stringify({ email, message }),
      });
      alert("Support request sent!");
      setEmail("");
      setMessage("");
    } catch (error) {
      alert("Failed to send support request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help and support resources</p>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b pb-2">
              <p className="font-semibold">{faq.q}</p>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Support Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>Send us a message and we’ll get back to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={submitSupportRequest} disabled={loading}>
            {loading && <Send className="h-4 w-4 animate-spin mr-2" />}
            Send Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSupportPage;
