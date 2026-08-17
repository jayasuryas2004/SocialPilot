"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppButton from "@/components/ui/AppButton";
import { CheckCircle2, User, Mail, Building2, MessageSquare, Loader2 } from "lucide-react";
import { submitContactForm } from "@/lib/api/contact";
import { INQUIRY_TYPES } from "@/constants/contact";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", inquiryType: "general", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitContactForm(form);
      setSent(true);
    } catch (err) {
      setError(err.message || "Couldn't send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-8 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message sent</h3>
        <p className="text-slate-500">
          Thanks, {form.name.split(" ")[0] || "there"} — our team will reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10"
    >
      <div className="mb-7">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Send us a message</h2>
        <p className="text-sm text-slate-500">We'll get back to you within one business day.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="mb-1.5 block">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              required
              className="pl-9 rounded-xl h-11 focus-visible:ring-brand-purple/40 focus-visible:border-brand-purple"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="James Okonkwo"
            />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              required
              type="email"
              className="pl-9 rounded-xl h-11 focus-visible:ring-brand-purple/40 focus-visible:border-brand-purple"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <Label className="mb-1.5 block">Company (optional)</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 rounded-xl h-11 focus-visible:ring-brand-purple/40 focus-visible:border-brand-purple"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Your company"
          />
        </div>
      </div>

      <div className="mb-5">
        <Label className="mb-2 block">What's this about?</Label>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update("inquiryType", t.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                form.inquiryType === t.value
                  ? "bg-brand-purple border-brand-purple text-white"
                  : "border-slate-200 text-slate-600 hover:border-brand-purple/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label className="mb-1.5 block">Message</Label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Textarea
            required
            className="pl-9 pt-3 rounded-xl h-28 focus-visible:ring-brand-purple/40 focus-visible:border-brand-purple"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Tell us what you need..."
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <AppButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending...
          </>
        ) : (
          "Send message"
        )}
      </AppButton>

      <p className="text-xs text-slate-400 text-center mt-4">
        By submitting, you agree to be contacted about your inquiry.
      </p>
    </form>
  );
}