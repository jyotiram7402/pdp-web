"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { downloadText, toCsv } from "@/lib/csv";
import { formatPrice } from "@/lib/format";
import { quote, quoteStore, subtotal, useStore, type Line } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { CheckCircleIcon, DownloadIcon, LoaderIcon, MailIcon, QuoteIcon } from "../ui/icons";
import { EmptyState } from "../ui/primitives";
import { LineItem } from "./line-item";

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  needBy: string;
  notes: string;
}

const EMPTY: FormState = { name: "", company: "", email: "", phone: "", country: "", needBy: "", notes: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function buildBody(form: FormState, lines: Line[]): string {
  const out = [`Quote request — ${siteConfig.name}`, "", `Name: ${form.name}`, `Company: ${form.company}`, `E-mail: ${form.email}`];
  if (form.phone) out.push(`Phone: ${form.phone}`);
  if (form.country) out.push(`Country: ${form.country}`);
  if (form.needBy) out.push(`Required by: ${form.needBy}`);
  out.push("", "Items:");
  lines.forEach((l, i) => out.push(`${i + 1}. ${l.sku} — ${l.title} — Qty ${l.qty}`));
  if (form.notes) out.push("", "Notes:", form.notes);
  return out.join("\n");
}

export function QuoteView() {
  const lines = useStore(quoteStore);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent-email" | "sent" | "error">("idle");

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const exportCsv = () => {
    const rows = [["Part number", "Description", "Quantity", "List price (USD)"]];
    for (const l of lines) rows.push([l.sku, l.title, String(l.qty), l.price != null ? l.price.toFixed(2) : ""]);
    downloadText("quote-request.csv", toCsv(rows));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.company.trim()) next.company = "Please enter your company.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Please enter a valid e-mail address.";
    setErrors(next);
    if (Object.keys(next).length || !lines.length) return;

    if (siteConfig.quote.endpoint) {
      setStatus("sending");
      try {
        const res = await fetch(siteConfig.quote.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            contact: form,
            items: lines.map((l) => ({ sku: l.sku, title: l.title, quantity: l.qty, listPrice: l.price })),
            submittedAt: new Date().toISOString(),
            page: window.location.href,
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus("sent");
        quote.clear();
      } catch {
        setStatus("error");
      }
      return;
    }

    const subject = `Quote request: ${lines.length} ${lines.length === 1 ? "part" : "parts"} — ${form.company}`;
    window.location.href = `mailto:${siteConfig.quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody(form, lines))}`;
    setStatus("sent-email");
  };

  if (status === "sent") {
    return (
      <EmptyState icon={<CheckCircleIcon size={22} className="text-success" />} title="Quote request sent" description="Thank you — our team will reply with pricing and lead times shortly.">
        <Link href="/catalog" className={buttonVariants({ variant: "ink" })}>
          Continue browsing
        </Link>
      </EmptyState>
    );
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon={<QuoteIcon size={22} />}
        title="Your quote list is empty"
        description="Add parts with the quote button on any product, or send your whole cart as a quote request."
      >
        <Link href="/catalog" className={buttonVariants({ variant: "ink" })}>
          Browse products
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] xl:gap-14">
      <div>
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{lines.length}</span> {lines.length === 1 ? "part" : "parts"} · indicative list value{" "}
            <span className="font-medium tabular-nums text-foreground">{formatPrice(subtotal(lines))}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={exportCsv}>
              <DownloadIcon size={15} /> Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={quote.clear}>
              Clear list
            </Button>
          </div>
        </div>
        <div className="divide-y">
          {lines.map((line) => (
            <LineItem key={line.sku} line={line} onQty={(qty) => quote.setQty(line.sku, qty)} onRemove={() => quote.remove(line.sku)} />
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
        <form onSubmit={submit} noValidate className="rounded-3xl border bg-card p-6 shadow-[0_24px_48px_-36px_rgb(15_23_42/0.35)]">
          <h2 className="text-lg font-semibold text-foreground">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">We’ll reply with pricing, availability and lead times.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name} className="sm:col-span-2">
              {(id) => <Input id={id} value={form.name} onChange={set("name")} autoComplete="name" invalid={!!errors.name} />}
            </Field>
            <Field label="Company" required error={errors.company} className="sm:col-span-2">
              {(id) => <Input id={id} value={form.company} onChange={set("company")} autoComplete="organization" invalid={!!errors.company} />}
            </Field>
            <Field label="Work e-mail" required error={errors.email} className="sm:col-span-2">
              {(id) => <Input id={id} type="email" value={form.email} onChange={set("email")} autoComplete="email" invalid={!!errors.email} />}
            </Field>
            <Field label="Phone">{(id) => <Input id={id} type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />}</Field>
            <Field label="Country">{(id) => <Input id={id} value={form.country} onChange={set("country")} autoComplete="country-name" />}</Field>
            <Field label="Required by" className="sm:col-span-2">
              {(id) => <Input id={id} type="date" value={form.needBy} onChange={set("needBy")} />}
            </Field>
            <Field label="Application notes" className="sm:col-span-2">
              {(id) => (
                <textarea
                  id={id}
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  rows={4}
                  placeholder="Annual volume, environment, custom finishes, target price…"
                  className="w-full resize-y rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                />
              )}
            </Field>
          </div>

          {status === "error" && (
            <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">We couldn’t send your request. Please try again or export the list.</p>
          )}
          {status === "sent-email" && (
            <div className="mt-4 rounded-xl bg-primary-soft px-3 py-2.5 text-sm text-foreground">
              Your e-mail app should now show the request addressed to {siteConfig.quote.email}. Send it to finish.{" "}
              <button type="button" onClick={quote.clear} className="font-medium text-primary hover:underline">
                Clear my list
              </button>
            </div>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={status === "sending"}>
            {status === "sending" ? <LoaderIcon size={17} className="animate-spin" /> : <MailIcon size={17} />}
            {status === "sending" ? "Sending…" : "Send quote request"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Your details are only used to answer this request.</p>
        </form>
      </aside>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children(id)}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Input({
  id,
  value,
  onChange,
  type = "text",
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  invalid?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring",
        invalid && "border-danger",
      )}
    />
  );
}
