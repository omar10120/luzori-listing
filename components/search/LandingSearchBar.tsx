"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Box from "@mui/material/Box";
import { Search, MapPin, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import UiButton from "@/components/ui/Button";

import type { GlobalCategory } from "@/lib/apiEndpoints";
import { fetchGlobalCategoriesClient } from "@/lib/centersPublicApi";

export type LandingSearchBarVariant = "hero" | "header";

export interface LandingSearchBarProps {
  variant?: LandingSearchBarVariant;
  className?: string;
  initialCategorySlug?: string | null;
  initialCategoryId?: string | null;
  initialCategoryName?: string | null;
  initialDate?: string | null;
  initialTimePreset?: "any" | "morning" | "afternoon" | "evening" | null;
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYmd(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const dt = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function LandingSearchBar({
  variant = "hero",
  className,
  initialCategorySlug,
  initialCategoryId,
  initialCategoryName,
  initialDate,
  initialTimePreset,
}: LandingSearchBarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [categories, setCategories] = useState<GlobalCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [treatmentOpen, setTreatmentOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [treatmentFilter, setTreatmentFilter] = useState("");
  const [manualSelectedCategory, setManualSelectedCategory] = useState<GlobalCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate ?? null);
  const [timePreset, setTimePreset] = useState<"any" | "morning" | "afternoon" | "evening">(
    initialTimePreset && initialTimePreset !== "any" ? initialTimePreset : "any"
  );

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const [calYear, setCalYear] = useState(() => today.getFullYear());
  const [calMonth, setCalMonth] = useState(() => today.getMonth());

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const rows = await fetchGlobalCategoriesClient();
      
      setCategories(rows);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const initialResolvedCategory = useMemo(() => {
    if (!categories.length) return null;
    if (initialCategorySlug) {
      return categories.find((c) => c.slug === initialCategorySlug) ?? null;
    }
    if (initialCategoryId) {
      return categories.find((c) => String(c.id) === String(initialCategoryId)) ?? null;
    }
    if (initialCategoryName) {
      return categories.find((c) => c.name === initialCategoryName) ?? null;
    }
    return null;
  }, [categories, initialCategorySlug, initialCategoryId, initialCategoryName]);

  const selectedCategory = manualSelectedCategory ?? initialResolvedCategory;

  const filteredCategories = useMemo(() => {
    const q = treatmentFilter.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, treatmentFilter]);

  const timeSummary = useMemo(() => {
    if (!selectedDate && timePreset === "any") return t("any_time");
    const parts: string[] = [];
    if (selectedDate) {
      const d = parseYmd(selectedDate);
      if (d) {
        parts.push(
          d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })
        );
      }
    }
    if (timePreset !== "any") parts.push(t(`search_time_${timePreset}`));
    return parts.length ? parts.join(" · ") : t("any_time");
  }, [selectedDate, timePreset, locale, t]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const startPad = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calYear, calMonth]);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isDayDisabled = useCallback(
    (day: number) => {
      const d = new Date(calYear, calMonth, day);
      d.setHours(0, 0, 0, 0);
      return d < startOfToday;
    },
    [calMonth, calYear, startOfToday]
  );

  const pickDay = useCallback(
    (day: number) => {
      if (isDayDisabled(day)) return;
      setSelectedDate(formatYmd(new Date(calYear, calMonth, day)));
    },
    [calMonth, calYear, isDayDisabled]
  );

  const selectCategory = useCallback((category: GlobalCategory) => {
    setManualSelectedCategory(category);
    setTreatmentFilter("");
    setTreatmentOpen(false);
  }, []);

  const clearCategory = useCallback(() => {
    setManualSelectedCategory(null);
    setTreatmentFilter("");
  }, []);

  const goSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("global_category_slug", selectedCategory.slug);
    if (selectedDate) params.set("date", selectedDate);
    if (timePreset !== "any") params.set("time_preset", timePreset);
    router.push(`/${locale}/search${params.toString() ? `?${params}` : ""}`);
  }, [router, locale, selectedCategory, selectedDate, timePreset]);

  const previousMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  const barWrapper = cn(
    "relative flex w-full flex-col items-stretch gap-0 rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 sm:flex-row sm:items-stretch sm:rounded-full sm:p-1.5 sm:pr-1",
    variant === "header" && "max-w-6xl sm:rounded-2xl"
  );

  const outlinedSx = {
    justifyContent: "flex-start",
    textTransform: "none" as const,
    borderRadius: 9999,
    px: 2,
    py: 1.25,
    color: "text.primary",
    borderColor: "divider",
  };

  return (
    <div className={cn("relative z-[100] w-full", className)}>
      <div className={barWrapper}>
        {/* Treatment — opens MUI dialog */}
        <div className="flex min-h-[52px] flex-1 flex-col justify-center px-2 py-1 sm:px-3">
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Search size={18} className="text-gray-400" />}
            endIcon={
              selectedCategory ? (
                <Box
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCategory();
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label={t("close")}
                >
                  <X size={16} />
                </Box>
              ) : undefined
            }
            sx={outlinedSx}
            onClick={() => {
              setTreatmentOpen(true);
              setTimeOpen(false);
            }}
          >
            <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "start" }}>
              {selectedCategory ? selectedCategory.name : t("treatment_placeholder")}
            </Box>
          </Button>
        </div>

        <div className="hidden h-8 w-px shrink-0 self-center bg-gray-200 sm:block" />

        <div className="flex min-h-[52px] flex-1 items-center gap-2 px-4 py-2">
          <MapPin size={18} className="shrink-0 text-gray-400" />
          <span className="truncate text-sm text-gray-700">{t("current_location")}</span>
        </div>

        <div className="hidden h-8 w-px shrink-0 self-center bg-gray-200 sm:block" />

        {/* Time — slide dialog */}
        <div className="flex min-h-[52px] flex-1 flex-col justify-center px-2 py-1 sm:px-3">
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Clock size={18} className="text-gray-400" />}
            sx={outlinedSx}
            onClick={() => {
              setTimeOpen(true);
              setTreatmentOpen(false);
            }}
          >
            <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{timeSummary}</Box>
          </Button>
        </div>

        <UiButton
          type="button"
          size="lg"
          variant="primary"
          onClick={() => void goSearch()}
          aria-label={t("search")}
          className={cn("m-2 shrink-0 rounded-full", variant === "header" && "sm:rounded-full")}
        >
          {t("search")}
        </UiButton>
      </div>

      {/* Treatment / categories dialog */}
      <Dialog
        open={treatmentOpen}
        onClose={() => setTreatmentOpen(false)}
        slots={{ transition: SlideUp }}
        keepMounted
        fullWidth
        maxWidth="sm"
        aria-labelledby="landing-treatment-dialog-title"
        aria-describedby="landing-treatment-dialog-desc"
      >
        <DialogTitle id="landing-treatment-dialog-title">{t("search_treatments")}</DialogTitle>
        <DialogContent dividers>
          <Typography id="landing-treatment-dialog-desc" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("treatment_placeholder")}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={t("search_filter_categories")}
            value={treatmentFilter}
            onChange={(e) => setTreatmentFilter(e.target.value)}
            sx={{ mb: 2 }}
          />
          {categoriesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : filteredCategories.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              {t("search_no_categories")}
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 360, overflow: "auto" }}>
              {filteredCategories.map((category) => (
                <ListItemButton key={category.id} onClick={() => selectCategory(category)}>
                  {category.image && (
                    <img src={category.image} width={15} height={15} className="w-8 h-8 object-cover rounded-full mx-2" />
                  )}
                  {/* <ListItemText primary={category.name} secondary={category.slug} /> */}
                  <ListItemText primary={locale === "ar" ? category.nameAr : category.name}  />
                  
                  
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTreatmentOpen(false)}>{t("close")}</Button>
        </DialogActions>
      </Dialog>

      {/* Time — slide-up dialog (calendar + presets) */}
      <Dialog
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        slots={{ transition: SlideUp }}
        keepMounted
        fullWidth
        maxWidth="sm"
        aria-labelledby="landing-time-dialog-title"
        aria-describedby="landing-time-dialog-description"
        role="alertdialog"
      >
        <DialogTitle id="landing-time-dialog-title">{t("any_time")}</DialogTitle>
        <DialogContent dividers>
          <Typography id="landing-time-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("search_select_time")}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              fullWidth
              variant={selectedDate === formatYmd(today) ? "contained" : "outlined"}
              onClick={() => setSelectedDate(formatYmd(today))}
              sx={{ flexDirection: "column", py: 1.5 }}
            >
              <Typography variant="subtitle2">{t("search_today")}</Typography>
              <Typography variant="caption" color="text.secondary">
                {today.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
              </Typography>
            </Button>
            <Button
              fullWidth
              variant={selectedDate === formatYmd(tomorrow) ? "contained" : "outlined"}
              onClick={() => setSelectedDate(formatYmd(tomorrow))}
              sx={{ flexDirection: "column", py: 1.5 }}
            >
              <Typography variant="subtitle2">{t("search_tomorrow")}</Typography>
              <Typography variant="caption" color="text.secondary">
                {tomorrow.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
              </Typography>
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <IconButton onClick={previousMonth} aria-label="Previous month" size="small">
              <ChevronLeft size={20} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {new Date(calYear, calMonth, 1).toLocaleDateString(locale, { month: "long", year: "numeric" })}
            </Typography>
            <IconButton onClick={nextMonth} aria-label="Next month" size="small">
              <ChevronRight size={20} />
            </IconButton>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 1 }}>
            {WEEK_DAYS.map((d) => (
              <Typography key={d} variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                {d}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 2 }}>
            {calendarCells.map((day, idx) =>
              day == null ? (
                <Box key={`e-${idx}`} />
              ) : (
                <Button
                  key={day}
                  size="small"
                  disabled={isDayDisabled(day)}
                  variant={
                    selectedDate === formatYmd(new Date(calYear, calMonth, day)) ? "contained" : "text"
                  }
                  onClick={() => pickDay(day)}
                  sx={{ minWidth: 0, aspectRatio: "1", borderRadius: "50%", p: 0, fontSize: "0.8rem" }}
                >
                  {day}
                </Button>
              )
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
            {t("search_select_time")}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {(["any", "morning", "afternoon", "evening"] as const).map((key) => (
              <Button
                key={key}
                size="small"
                variant={timePreset === key ? "contained" : "outlined"}
                onClick={() => setTimePreset(key)}
              >
                {t(`search_time_${key}`)}
              </Button>
            ))}
          </Box>

          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => {
              setSelectedDate(null);
              setTimePreset("any");
            }}
          >
            {t("search_clear_datetime")}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeOpen(false)} variant="contained" color="primary">
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
