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
  Upload,
  XCircle,
} from "lucide-react";

import yojanaLogo from "@/assets/yojanascan-logo.png";
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
import { Badge } from "@/components/ui/badge";
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
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SchemeSearch } from "@/components/SchemeSearch";
import { AiHelp } from "@/components/AiHelp";

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
  { id: 0, key: "aboutYou", icon: ShieldCheck },
  { id: 1, key: "whereLive", icon: MapPin },
  { id: 2, key: "workIncome", icon: Landmark },
  { id: 3, key: "docsTitle", icon: FileText },
] as const;

function Home() {
  const { t } = useI18n();
  const [step, setStep] = useState(-1);
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
                <ArrowLeft className="mr-2 size-4" /> {t("back")}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} className="min-w-32">
                  {t("next")} <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button onClick={submit} className="min-w-40 bg-[color:var(--seal)] text-ink hover:brightness-95">
                  <ScanLine className="mr-2 size-4" /> {t("scanSchemes")}
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

function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <img src={yojanaLogo} alt="YojanaScan logo" width={40} height={40} className="size-10 shrink-0" />
          <div className="leading-tight">
            <div className="font-display text-lg text-ink">YojanaScan</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t("tagline")}
            </div>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <SchemeSearch variant="icon" />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mx-auto mb-8 flex size-28 items-center justify-center rounded-3xl bg-card shadow-lg ring-1 ring-border">
          <img src={yojanaLogo} alt="YojanaScan logo" width={112} height={112} className="size-24 object-contain" />
        </div>
        <h1 className="font-display text-5xl text-ink sm:text-6xl">YojanaScan</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("welcomeSub")}</p>
        <Button size="lg" onClick={onStart} className="mt-10 h-12 bg-primary px-8 text-primary-foreground">
          {t("start")} <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
    </main>
  );
}

function Stepper({ current }: { current: number }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{t("step")} {current + 1} {t("of")} {STEPS.length}</span>
        <span className="text-ink">{t(STEPS[current].key)}</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= current ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="mt-5 hidden items-center justify-between sm:flex">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === current;
          const done = i < current;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`grid size-8 place-items-center rounded-full border transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : done
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-input bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span className={`text-sm ${active ? "font-semibold text-ink" : "text-muted-foreground"}`}>
                {t(s.key)}
              </span>
              {i < STEPS.length - 1 && <div className="mx-2 h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepPersonal({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <SectionHeading title={t("aboutYou")} subtitle={t("aboutYouSub")} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("fullName")}>
          <Input value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder={t("namePlaceholder")} />
        </Field>
        <Field label={t("age")}>
          <Input
            type="number"
            min={0}
            max={120}
            value={profile.age ?? ""}
            onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)}
            placeholder={t("agePlaceholder")}
          />
        </Field>
        <Field label={t("gender")}>
          <RadioGroup
            value={profile.gender}
            onValueChange={(v) => update("gender", v as Profile["gender"])}
            className="flex gap-4 pt-2"
          >
            {(["male", "female", "other"] as const).map((g) => (
              <label key={g} className="flex items-center gap-2">
                <RadioGroupItem value={g} id={`g-${g}`} />
                {t(g)}
              </label>
            ))}
          </RadioGroup>
        </Field>
        <Field label={t("category")}>
          <Select value={profile.category} onValueChange={(v) => update("category", v as Profile["category"])}>
            <SelectTrigger><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">{t("cat_general")}</SelectItem>
              <SelectItem value="obc">{t("cat_obc")}</SelectItem>
              <SelectItem value="sc">{t("cat_sc")}</SelectItem>
              <SelectItem value="st">{t("cat_st")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("religion")}>
          <Select value={profile.religion} onValueChange={(v) => update("religion", v as Profile["religion"])}>
            <SelectTrigger><SelectValue placeholder={t("selectReligion")} /></SelectTrigger>
            <SelectContent>
              {["hindu","muslim","christian","sikh","buddhist","jain","parsi","other"].map((r) => (
                <SelectItem key={r} value={r}>{t(`rel_${r}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("pwd")}>
          <label className="flex items-center gap-3 pt-2 text-sm">
            <Checkbox
              checked={profile.disability}
              onCheckedChange={(v) => update("disability", Boolean(v))}
            />
            {t("pwdYes")}
          </label>
        </Field>
      </div>
    </div>
  );
}

function StepLocation({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <SectionHeading title={t("whereLive")} subtitle={t("whereLiveSub")} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("stateUt")}>
          <Select value={profile.state} onValueChange={(v) => update("state", v)}>
            <SelectTrigger><SelectValue placeholder={t("selectState")} /></SelectTrigger>
            <SelectContent className="max-h-72">
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("area")}>
          <RadioGroup
            value={profile.residence}
            onValueChange={(v) => update("residence", v as Profile["residence"])}
            className="flex gap-4 pt-2"
          >
            <label className="flex items-center gap-2">
              <RadioGroupItem value="rural" id="a-r" /> {t("rural")}
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="urban" id="a-u" /> {t("urban")}
            </label>
          </RadioGroup>
        </Field>
        <Field label={t("bpl")}>
          <label className="flex items-center gap-3 pt-2 text-sm">
            <Checkbox checked={profile.bpl} onCheckedChange={(v) => update("bpl", Boolean(v))} />
            {t("bplYes")}
          </label>
        </Field>
        <Field label={t("bankAcc")}>
          <label className="flex items-center gap-3 pt-2 text-sm">
            <Checkbox
              checked={profile.hasBankAccount}
              onCheckedChange={(v) => update("hasBankAccount", Boolean(v))}
            />
            {t("bankYes")}
          </label>
        </Field>
      </div>
    </div>
  );
}

function StepLivelihood({
  profile,
  update,
}: {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
}) {
  const { t } = useI18n();
  const occs = ["student","farmer","salaried","selfEmployed","labour","unemployed","homemaker","retired"] as const;
  const occValueMap: Record<string, string> = {
    student: "student", farmer: "farmer", salaried: "salaried",
    selfEmployed: "self_employed", labour: "labour", unemployed: "unemployed",
    homemaker: "homemaker", retired: "retired",
  };
  return (
    <div className="space-y-6">
      <SectionHeading title={t("workIncome")} subtitle={t("workIncomeSub")} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("occupation")}>
          <Select value={profile.occupation} onValueChange={(v) => update("occupation", v as Profile["occupation"])}>
            <SelectTrigger><SelectValue placeholder={t("selectOccupation")} /></SelectTrigger>
            <SelectContent>
              {occs.map((k) => (
                <SelectItem key={k} value={occValueMap[k]}>{t(k)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("income")}>
          <Input
            type="number"
            min={0}
            value={profile.annualIncome ?? ""}
            onChange={(e) => update("annualIncome", e.target.value ? Number(e.target.value) : null)}
            placeholder={t("incomePlaceholder")}
          />
        </Field>
        {profile.occupation === "farmer" && (
          <Field label={t("land")}>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={profile.landHolding ?? ""}
              onChange={(e) => update("landHolding", e.target.value ? Number(e.target.value) : null)}
              placeholder={t("landPlaceholder")}
            />
          </Field>
        )}
      </div>
    </div>
  );
}

function StepDocuments({
  profile,
  toggleDoc,
}: {
  profile: Profile;
  toggleDoc: (key: DocKey, value: boolean) => void;
}) {
  const { t } = useI18n();
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const onFile = (key: DocKey, file: File | null) => {
    if (!file) return;
    setUploads((u) => ({ ...u, [key]: file.name }));
    toggleDoc(key, true);
  };

  return (
    <div className="space-y-6">
      <SectionHeading title={t("docsTitle")} subtitle={t("docsSub")} />
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
                    {fileName ? `${t("uploaded")}: ${fileName}` : t("uploadOptional")}
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
  const { t } = useI18n();
  return (
    <main id="results" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="bg-[color:var(--seal)]/15 text-ink hover:bg-[color:var(--seal)]/20">
            {t("reportReady")}
          </Badge>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            {profile.name ? `${profile.name}, ` : ""}
            {t("eligibleFor")}{" "}
            <span className="text-[color:var(--seal)]">{results.eligible.length}</span>{" "}
            {results.eligible.length === 1 ? t("scheme") : t("schemes")}.
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("reportNote")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            {t("editDetails")}
          </Button>
          <Button onClick={onReset} className="bg-primary text-primary-foreground">
            {t("startOver")}
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <SchemeSearch compact />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">{t("eligibleSchemes")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {results.eligible.length === 0 && (
            <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground md:col-span-2">
              {t("noMatches")}
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
                <span className="font-medium text-ink">{t("benefitLabel")}: </span>
                <span className="text-foreground/80">{scheme.benefits}</span>
              </div>

              {missingDocs.length > 0 ? (
                <div className="mt-4 rounded-lg border border-dashed p-3 text-xs">
                  <div className="font-medium text-ink">{t("stillNeedLabel")}</div>
                  <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                    {missingDocs.map((d) => (
                      <li key={d}>{DOCUMENT_LABELS[d]}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-success">
                  <Check className="size-4" /> {t("allDocsReady")}
                </div>
              )}

              <a
                href={scheme.link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t("applyNow")} <ArrowRight className="size-3.5" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {results.ineligible.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl text-ink">{t("notEligibleNow")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("notEligibleSub")}</p>
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

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t bg-parchment">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="font-display text-base text-ink">YojanaScan</div>
          <div>{t("footerInfo")}</div>
        </div>
        <div>© {new Date().getFullYear()} YojanaScan</div>
      </div>
    </footer>
  );
}
