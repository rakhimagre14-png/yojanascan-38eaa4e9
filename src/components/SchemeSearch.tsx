import { useMemo, useRef, useState, useEffect } from "react";
import { Search, ArrowRight, X, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SCHEMES, DOCUMENT_LABELS, type Scheme } from "@/lib/schemes";
import { useI18n } from "@/lib/i18n";

type Variant = "inline" | "compact" | "icon";

export function SchemeSearch({
  compact = false,
  variant,
}: {
  compact?: boolean;
  variant?: Variant;
}) {
  const mode: Variant = variant ?? (compact ? "compact" : "inline");
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<Scheme | null>(null);
  const [iconOpen, setIconOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SCHEMES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const showDropdown = focused && query.trim().length > 0;

  const suggestions = (
    <>
      {matches.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">{t("noSchemeFound")}</div>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {matches.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(s);
                  setFocused(false);
                  setIconOpen(false);
                }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-secondary"
              >
                <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.ministry}</div>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {s.category}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <>
      {mode === "icon" ? (
        <>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("searchSchemes")}
            onClick={() => setIconOpen(true)}
            className="h-9 w-9 rounded-full border-border/70 bg-card/60 text-ink shadow-sm backdrop-blur"
          >
            <Search className="size-4 text-primary" />
          </Button>
          <Dialog open={iconOpen} onOpenChange={setIconOpen}>
            <DialogContent className="max-w-lg p-0">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle className="text-base">{t("searchSchemes")}</DialogTitle>
              </DialogHeader>
              <div className="relative px-4 pb-2">
                <Search className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-11 rounded-lg border-border/70 bg-card pl-9"
                />
              </div>
              <div className="border-t">{query.trim() ? suggestions : (
                <div className="p-4 text-sm text-muted-foreground">{t("searchHint")}</div>
              )}</div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div ref={boxRef} className={`relative ${mode === "compact" ? "w-full" : "mx-auto w-full max-w-xl"}`}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder={t("searchPlaceholder")}
              className="h-12 rounded-xl border-border/70 bg-card pl-10 pr-10 text-base shadow-sm"
              aria-label={t("searchPlaceholder")}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={t("clear")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg">
              {suggestions}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <Badge variant="secondary" className="mb-2 w-fit">
                  {selected.category}
                </Badge>
                <DialogTitle className="font-display text-2xl text-ink">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-wider">
                  {selected.ministry}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2 text-sm">
                <Section title={t("purpose")}>{selected.summary}</Section>
                <Section title={t("benefits")}>{selected.benefits}</Section>

                <div>
                  <SectionTitle>{t("eligibility")}</SectionTitle>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/85">
                    {getEligibilityLines(selected).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <SectionTitle>{t("requiredDocs")}</SectionTitle>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {selected.requiredDocs.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-foreground/85">
                        <FileText className="size-3.5 text-primary" />
                        {DOCUMENT_LABELS[d]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  {t("close")}
                </Button>
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-105"
                >
                  {t("applyPortal")} <ArrowRight className="size-3.5" />
                </a>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <p className="mt-1.5 text-foreground/85">{children}</p>
    </div>
  );
}

function getEligibilityLines(s: Scheme): string[] {
  const emptyProfile = {
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
      aadhaar: false, pan: false, voterId: false, incomeCertificate: false,
      casteCertificate: false, domicile: false, disabilityCertificate: false,
      bankPassbook: false, rationCard: false, landRecord: false, marksheet: false,
    },
  } as Parameters<typeof s.eligible>[0];
  const { reasons } = s.eligible(emptyProfile);
  return reasons.length ? reasons : ["Open to all eligible applicants — see official portal for details."];
}
