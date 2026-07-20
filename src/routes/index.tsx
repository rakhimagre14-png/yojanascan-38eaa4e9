import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Landmark,
  MapPin,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DOCUMENT_LABELS,
  INDIAN_STATES,
  type DocKey,
  type Profile,
  evaluate,
} from "@/lib/schemes";

export const Route = createFileRoute("/")({
  component: Home,
});

const emptyProfile: Profile = {
  name: "",
  age: null,
  gender: "",
  state: "",
  residence: "",
  category: "",
  religion: "",
  occupation: "",
  annualIncome: null,
  landHolding: null,
  disability: false,
  bpl: false,
  hasBankAccount: false,
  documents: {
    aadhaar: false,
    pan: false,
    voterId: false,
    incomeCertificate: false,
    casteCertificate: false,
    domicile: false,
    disabilityCertificate: false,
    bankPassbook: false,
    rationCard: false,
    landRecord: false,
    marksheet: false,
  },
};

const STEPS = [
  { id: 0, title: "Personal", icon: ShieldCheck },
  { id: 1, title: "Location", icon: MapPin },
  { id: 2, title: "Livelihood", icon: Landmark },
  { id: 3, title: "Documents", icon: FileText },
] as const;

function Home() {
  const [step, setStep] = useState(-1); // -1 = landing
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [showResults, setShowResults] = useState(false);

  const results = useMemo(() => (showResults ? evaluate(profile) : null), [showResults, profile]);

  const update = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const toggleDoc = (key: DocKey, value: boolean) =>
    setProfile((p) => ({ ...p, documents: { ...p.documents, [key]: value } }));

  const start = () => {
    setShowResults(false);
    setStep(0);
  };

  const submit = () => {
    setShowResults(true);
    setStep(-1);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const reset = () => {
    setProfile(emptyProfile);
    setShowResults(false);
    setStep(-1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {step === -1 && !showResults && <Landing onStart={start} />}

      {step >= 0 && (
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
          <Stepper current={step} />
          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
            {step === 0 && <StepPersonal profile={profile} update={update} />}
            {step === 1 && <StepLocation profile={profile} update={update} />}
            {step === 2 && <StepLivelihood profile={profile} update={update} />}
            {step === 3 && (
              <StepDocuments profile={profile} toggleDoc={toggleDoc} />
            )}

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 size-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} className="min-w-32">
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button onClick={submit} className="min-w-40 bg-[color:var(--seal)] text-ink hover:brightness-95">
                  <ScanLine className="mr-2 size-4" /> Scan schemes
                </Button>
              )}
            </div>
          </div>
        </main>
      )}

      {showResults && results && (
        <Results
          profile={profile}
          results={results}
          onEdit={() => setStep(0)}
          onReset={reset}
        />
      )}

      <Footer />
    </div>
  );
}

/* ---------- Header ---------- */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <ScanLine className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg text-ink">YojanaScan</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Govt. scheme eligibility scanner
            </div>
          </div>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#schemes" className="hover:text-foreground">Schemes</a>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Landing ---------- */

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main>
      <section className="relative overflow-hidden border-b bg-parchment">
        <div className="absolute inset-0 bg-grid-notice opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <Badge className="rounded-full bg-[color:var(--seal)]/15 text-ink hover:bg-[color:var(--seal)]/20">
              <Sparkles className="mr-1 size-3.5" /> Free · No sign-up
            </Badge>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
              Find every government scheme <em className="not-italic text-[color:var(--seal)]">you actually qualify for.</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Answer a short questionnaire about your family, income, and documents — YojanaScan
              matches you against India&rsquo;s central schemes and tells you exactly what to apply for.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onStart} className="h-12 bg-primary text-primary-foreground">
                Start scanning <ArrowRight className="ml-2 size-4" />
              </Button>
              <a
                href="#how"
                className="inline-flex h-12 items-center rounded-md border border-input px-5 text-sm font-medium hover:bg-secondary"
              >
                How it works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <Stat n="17+" label="schemes covered" />
              <Stat n="4" label="quick steps" />
              <Stat n="~2 min" label="to your results" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Eligibility Report
                </div>
                <Badge variant="secondary" className="bg-success/15 text-success">Sample</Badge>
              </div>
              <div className="mt-4 space-y-3">
                <MockRow name="PM-KISAN Samman Nidhi" ok />
                <MockRow name="Kisan Credit Card" ok />
                <MockRow name="Ayushman Bharat PMJAY" ok />
                <MockRow name="PMAY (Urban)" ok={false} />
                <MockRow name="Sukanya Samriddhi Yojana" ok={false} />
              </div>
              <Separator className="my-5" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Matched benefits</span>
                <span className="font-semibold text-ink">₹5.14 lakh / year</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden size-28 rotate-6 rounded-2xl bg-[color:var(--seal)]/25 blur-2xl sm:block" />
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">How YojanaScan works</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A guided form, a rules engine, and a plain-language report — nothing leaves your browser.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Tell us about you", d: "Age, family, location, occupation and income — the basics used by every scheme." },
            { n: "02", t: "Mark your documents", d: "Tick the papers you have (Aadhaar, PAN, income cert., etc.) or upload them." },
            { n: "03", t: "Get matched", d: "See eligible schemes, benefits, missing documents and where to apply." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border bg-card p-6">
              <div className="font-display text-4xl text-[color:var(--seal)]">{s.n}</div>
              <div className="mt-3 font-semibold text-ink">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="schemes" className="border-t bg-parchment">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Schemes we scan</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "PMAY (G)", "PMAY (U) 2.0", "PM-KISAN", "KCC", "Ayushman Bharat",
              "Ayushman Vaya Vandana", "Sukanya Samriddhi", "Ujjwala 2.0",
              "Post-Matric Scholarship", "Pragati (Girls)", "PM MUDRA",
              "Stand-Up India", "PM-SYM", "DDRS", "MGNREGA", "PMMVY", "Atal Pension",
            ].map((s) => (
              <span
                key={s}
                className="rounded-full border bg-card px-3 py-1 text-sm text-ink"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-10">
            <Button size="lg" onClick={onStart} className="h-12 bg-primary text-primary-foreground">
              Scan my eligibility <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-2xl text-ink">{n}</span>
      <span>{label}</span>
    </div>
  );
}

function MockRow({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
      <span className="text-ink">{name}</span>
      {ok ? (
        <span className="inline-flex items-center gap-1 text-success">
          <CheckCircle2 className="size-4" /> Eligible
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <XCircle className="size-4" /> Not now
        </span>
      )}
    </div>
  );
}

/* ---------- Stepper ---------- */

function Stepper({ current }: { current: number }) {
  const pct = ((current + 1) / STEPS.length) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Step {current + 1} of {STEPS.length}</span>
        <span>{STEPS[current].title}</span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
      <div className="mt-4 flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === current;
          const done = i < current;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`grid size-8 place-items-center rounded-full border ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : done
                      ? "border-success bg-success text-success-foreground"
                      : "border-input bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span className={`hidden text-sm sm:inline ${active ? "text-ink" : "text-muted-foreground"}`}>
                {s.title}
              </span>
              {i < STEPS.length - 1 && <div className="mx-2 h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Step 1 ---------- */

function StepPersonal({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading title="About you" subtitle="Basic information used by nearly every scheme." />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Priya Sharma" />
        </Field>
        <Field label="Age">
          <Input
            type="number"
            min={0}
            max={120}
            value={profile.age ?? ""}
            onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 34"
          />
        </Field>
        <Field label="Gender">
          <RadioGroup
            value={profile.gender}
            onValueChange={(v) => update("gender", v as Profile["gender"])}
            className="flex gap-4 pt-2"
          >
            {(["male", "female", "other"] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 capitalize">
                <RadioGroupItem value={g} id={`g-${g}`} />
                {g}
              </label>
            ))}
          </RadioGroup>
        </Field>
        <Field label="Social category">
          <Select value={profile.category} onValueChange={(v) => update("category", v as Profile["category"])}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="obc">OBC</SelectItem>
              <SelectItem value="sc">SC</SelectItem>
              <SelectItem value="st">ST</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Religion">
          <Select value={profile.religion} onValueChange={(v) => update("religion", v as Profile["religion"])}>
            <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
            <SelectContent>
              {["hindu","muslim","christian","sikh","buddhist","jain","parsi","other"].map((r) => (
                <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Person with disability">
          <label className="flex items-center gap-3 pt-2 text-sm">
            <Checkbox
              checked={profile.disability}
              onCheckedChange={(v) => update("disability", Boolean(v))}
            />
            Yes, I have a certified disability
          </label>
        </Field>
      </div>
    </div>
  );
}

/* ---------- Step 2 ---------- */

function StepLocation({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading title="Where you live" subtitle="Some benefits depend on state and rural/urban status." />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="State / UT">
          <Select value={profile.state} onValueChange={(v) => update("state", v)}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Area">
          <RadioGroup
            value={profile.residence}
            onValueChange={(v) => update("residence", v as Profile["residence"])}
            className="flex gap-4 pt-2"
          >
            <label className="flex items-center gap-2">
              <RadioGroupItem value="rural" id="a-r" /> Rural
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="urban" id="a-u" /> Urban
            </label>
          </RadioGroup>
        </Field>
        <Field label="BPL / low-income household">
          <label className="flex items-center gap-3 pt-2 text-sm">
            <Checkbox checked={profile.bpl} onCheckedChange={(v) => update("bpl", Boolean(v))} />
            Yes, household is below poverty line
          </label>
        </Field>
        <Field label="Active bank account">
          <label className="flex items-center gap-3 pt-2 text-sm">
            <Checkbox
              checked={profile.hasBankAccount}
              onCheckedChange={(v) => update("hasBankAccount", Boolean(v))}
            />
            Yes, linked with Aadhaar
          </label>
        </Field>
      </div>
    </div>
  );
}

/* ---------- Step 3 ---------- */

function StepLivelihood({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading title="Work & income" subtitle="Used to check income ceilings and occupation-linked schemes." />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Occupation">
          <Select value={profile.occupation} onValueChange={(v) => update("occupation", v as Profile["occupation"])}>
            <SelectTrigger><SelectValue placeholder="Select occupation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="salaried">Salaried employee</SelectItem>
              <SelectItem value="self_employed">Self-employed / business</SelectItem>
              <SelectItem value="labour">Daily wage / unorganised worker</SelectItem>
              <SelectItem value="unemployed">Unemployed / job-seeker</SelectItem>
              <SelectItem value="homemaker">Homemaker</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Annual family income (₹)">
          <Input
            type="number"
            min={0}
            value={profile.annualIncome ?? ""}
            onChange={(e) => update("annualIncome", e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 240000"
          />
        </Field>
        {profile.occupation === "farmer" && (
          <Field label="Land holding (acres)">
            <Input
              type="number"
              min={0}
              step="0.1"
              value={profile.landHolding ?? ""}
              onChange={(e) => update("landHolding", e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 2.5"
            />
          </Field>
        )}
      </div>
    </div>
  );
}

/* ---------- Step 4 ---------- */

function StepDocuments({
  profile,
  toggleDoc,
}: {
  profile: Profile;
  toggleDoc: (key: DocKey, value: boolean) => void;
}) {
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const onFile = (key: DocKey, file: File | null) => {
    if (!file) return;
    setUploads((u) => ({ ...u, [key]: file.name }));
    toggleDoc(key, true);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Documents you have"
        subtitle="Tick what you already have, or upload a copy. Files stay in your browser."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(DOCUMENT_LABELS) as DocKey[]).map((key) => {
          const label = DOCUMENT_LABELS[key];
          const checked = profile.documents[key];
          const fileName = uploads[key];
          return (
            <div
              key={key}
              className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                checked ? "border-success/50 bg-success/5" : "bg-background"
              }`}
            >
              <Checkbox
                id={`doc-${key}`}
                checked={checked}
                onCheckedChange={(v) => toggleDoc(key, Boolean(v))}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <Label htmlFor={`doc-${key}`} className="cursor-pointer text-sm font-medium text-ink">
                  {label}
                </Label>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <Upload className="size-3.5" />
                  <span className="truncate">
                    {fileName ? `Uploaded: ${fileName}` : "Upload a copy (optional)"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => onFile(key, e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Shared ---------- */

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm text-ink">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ---------- Results ---------- */

function Results({
  profile,
  results,
  onEdit,
  onReset,
}: {
  profile: Profile;
  results: ReturnType<typeof evaluate>;
  onEdit: () => void;
  onReset: () => void;
}) {
  return (
    <main id="results" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="bg-[color:var(--seal)]/15 text-ink hover:bg-[color:var(--seal)]/20">
            Report ready
          </Badge>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            {profile.name ? `${profile.name}, ` : ""}
            you may be eligible for{" "}
            <span className="text-[color:var(--seal)]">{results.eligible.length}</span> scheme
            {results.eligible.length === 1 ? "" : "s"}.
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Based on the details you shared. Verify final eligibility on each scheme&rsquo;s official portal
            before applying.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit details
          </Button>
          <Button onClick={onReset} className="bg-primary text-primary-foreground">
            Start over
          </Button>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">Eligible schemes</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {results.eligible.length === 0 && (
            <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground md:col-span-2">
              No matches yet. Try adjusting your details — most people miss a scheme because of an
              unchecked category, income field, or documents. Use <em>Edit details</em> above.
            </div>
          )}
          {results.eligible.map(({ scheme, missingDocs }) => (
            <article
              key={scheme.id}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-2xl bg-success/15 text-success">
                <CheckCircle2 className="absolute right-3 top-3 size-6" />
              </div>
              <Badge variant="secondary" className="mb-3">{scheme.category}</Badge>
              <h3 className="font-display text-xl text-ink">{scheme.name}</h3>
              <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                {scheme.ministry}
              </div>
              <p className="mt-3 text-sm text-foreground/80">{scheme.summary}</p>
              <div className="mt-4 rounded-lg bg-secondary p-3 text-sm">
                <span className="font-medium text-ink">Benefit: </span>
                <span className="text-foreground/80">{scheme.benefits}</span>
              </div>

              {missingDocs.length > 0 ? (
                <div className="mt-4 rounded-lg border border-dashed p-3 text-xs">
                  <div className="font-medium text-ink">Still need:</div>
                  <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                    {missingDocs.map((d) => (
                      <li key={d}>{DOCUMENT_LABELS[d]}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-success">
                  <Check className="size-4" /> All required documents ready
                </div>
              )}

              <a
                href={scheme.link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Apply on official portal <ArrowRight className="size-3.5" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {results.ineligible.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl text-ink">Not eligible right now</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Why each one didn&rsquo;t match — useful if a detail changes later.
          </p>
          <Accordion type="single" collapsible className="mt-4 rounded-2xl border bg-card">
            {results.ineligible.map(({ scheme, reasons }) => (
              <AccordionItem key={scheme.id} value={scheme.id} className="px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <XCircle className="size-4 text-muted-foreground" />
                    <span className="text-ink">{scheme.name}</span>
                    <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                      {scheme.category}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground">
                    {reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </main>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="border-t bg-parchment">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="font-display text-base text-ink">YojanaScan</div>
          <div>Informational tool. Final eligibility is decided by the concerned department.</div>
        </div>
        <div>© {new Date().getFullYear()} YojanaScan</div>
      </div>
    </footer>
  );
}
