import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANGUAGES, useI18n, type LangCode } from "@/lib/i18n";

export function LanguageSelector() {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-full border-border/70 bg-card/60 px-3 text-ink shadow-sm backdrop-blur"
          aria-label={t("language")}
        >
          <Globe className="size-4 text-primary" />
          <span className="hidden text-xs font-medium sm:inline">{current.native}</span>
          <span className="text-xs font-semibold uppercase tracking-wider sm:hidden">
            {current.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLang(l.code as LangCode)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex flex-col">
              <span className="text-sm text-ink">{l.native}</span>
              <span className="text-[11px] text-muted-foreground">{l.label}</span>
            </span>
            {lang === l.code && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
