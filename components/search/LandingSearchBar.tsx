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
import { Search, MapPin, Clock, X, ChevronLeft, ChevronRight, Building2, User as UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import UiButton from "@/components/ui/Button";

import type { CenterDetailData, GlobalCategory } from "@/lib/apiEndpoints";
import { fetchCentersSearchClient, fetchGlobalCategoriesClient } from "@/lib/centersPublicApi";
import { buildProfessionals, type Professional } from "@/lib/searchEntities";
import { generateCenterSlug, generateProfessionalSlug } from "@/lib/slugify";

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

type EntityFilter = "all" | "treatments" | "venues" | "professionals";

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
  const [centers, setCenters] = useState<CenterDetailData[]>([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersLoaded, setCentersLoaded] = useState(false);
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
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

  const loadCenters = useCallback(async () => {
    setCentersLoading(true);
    try {
      const rows = await fetchCentersSearchClient({});
      setCenters(rows);
      setCentersLoaded(true);
    } finally {
      setCentersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  // Lazy-load centers (used for Venues + Professionals search) only when dialog opens.
  useEffect(() => {
    if (treatmentOpen && !centersLoaded && !centersLoading) {
      void loadCenters();
    }
  }, [treatmentOpen, centersLoaded, centersLoading, loadCenters]);

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

  const allProfessionals = useMemo<Professional[]>(
    () => buildProfessionals(centers),
    [centers]
  );

  const filteredVenues = useMemo(() => {
    const q = treatmentFilter.trim().toLowerCase();
    if (!q) return centers;
    return centers.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.domain?.toLowerCase().includes(q)) return true;
      return (c.branches || []).some(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q)
      );
    });
  }, [centers, treatmentFilter]);

  const filteredProfessionals = useMemo(() => {
    const q = treatmentFilter.trim().toLowerCase();
    if (!q) return allProfessionals;
    return allProfessionals.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.centerName.toLowerCase().includes(q) ||
        (p.centerCategoryName?.toLowerCase().includes(q) ?? false)
    );
  }, [allProfessionals, treatmentFilter]);

  const resultCounts = useMemo(
    () => ({
      treatments: filteredCategories.length,
      venues: filteredVenues.length,
      professionals: filteredProfessionals.length,
    }),
    [filteredCategories.length, filteredVenues.length, filteredProfessionals.length]
  );

  const isSearchLoading = categoriesLoading || centersLoading;
  const showTreatments = entityFilter === "all" || entityFilter === "treatments";
  const showVenues = entityFilter === "all" || entityFilter === "venues";
  const showProfessionals =
    entityFilter === "all" || entityFilter === "professionals";

  const hasAnyResults =
    (showTreatments && resultCounts.treatments > 0) ||
    (showVenues && resultCounts.venues > 0) ||
    (showProfessionals && resultCounts.professionals > 0);

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

  const selectVenue = useCallback(
    (center: CenterDetailData) => {
      setTreatmentOpen(false);
      setTreatmentFilter("");
      router.push(
        `/${locale}/center/${generateCenterSlug(center.name, center.id)}`
      );
    },
    [locale, router]
  );

  const selectProfessional = useCallback(
    (pro: Professional) => {
      setTreatmentOpen(false);
      setTreatmentFilter("");
      router.push(
        `/${locale}/professional/${generateProfessionalSlug(
          pro.name,
          pro.centerId,
          pro.workerId
        )}`
      );
    },
    [locale, router]
  );

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
            startIcon={<Search size={18} className={`text-gray-400 ${locale == "ar" ? "ml-4" : ""}`} />}

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
            startIcon={<Clock size={18} className={`text-gray-400 ${locale == "ar" ? "ml-4" : ""}`} />}
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
            {t("search_panel_hint")}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={t("search_panel_placeholder")}
            value={treatmentFilter}
            onChange={(e) => setTreatmentFilter(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <FilterPill
              active={entityFilter === "all"}
              onClick={() => setEntityFilter("all")}
            >
              {t("all")}
            </FilterPill>
            <FilterPill
              active={entityFilter === "treatments"}
              count={resultCounts.treatments}
              onClick={() => setEntityFilter("treatments")}
            >
              {t("search_treatments")}
            </FilterPill>
            <FilterPill
              active={entityFilter === "venues"}
              count={resultCounts.venues}
              onClick={() => setEntityFilter("venues")}
            >
              {t("tab_venues")}
            </FilterPill>
            <FilterPill
              active={entityFilter === "professionals"}
              count={resultCounts.professionals}
              onClick={() => setEntityFilter("professionals")}
            >
              {t("tab_professionals")}
            </FilterPill>
          </Box>

          {isSearchLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : !hasAnyResults ? (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              {t("search_no_results")}
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 420, overflow: "auto" }}>
              {showTreatments && filteredCategories.length > 0 && (
                <SearchSection title={t("search_treatments")}>
                  {filteredCategories.map((category) => (
                    <ListItemButton
                      key={`cat-${category.id}`}
                      onClick={() => selectCategory(category)}
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt=""
                          className="w-8 h-8 object-cover rounded-full mx-2"
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            mx: 1,
                            borderRadius: "50%",
                            bgcolor: "primary.50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Search size={14} className="text-[#225D5C]" />
                        </Box>
                      )}
                      <ListItemText
                        primary={locale === "ar" ? category.nameAr || category.name : category.name}
                      />
                    </ListItemButton>
                  ))}
                </SearchSection>
              )}

              {showVenues && filteredVenues.length > 0 && (
                <SearchSection title={t("tab_venues")}>
                  {filteredVenues.map((center) => {
                    const branch = center.branches?.[0];
                    const subtitle = branch
                      ? [branch.city, branch.address].filter(Boolean).join(" · ")
                      : center.domain;
                    return (
                      <ListItemButton
                        key={`v-${center.id}`}
                        onClick={() => selectVenue(center)}
                      >
                        {center.logo ? (
                          <img
                            src={center.logo}
                            alt=""
                            className="w-8 h-8 object-cover rounded-md mx-2"
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              mx: 1,
                              borderRadius: 1,
                              bgcolor: "grey.100",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Building2 size={14} className="text-gray-600" />
                          </Box>
                        )}
                        <ListItemText primary={center.name} secondary={subtitle} />
                      </ListItemButton>
                    );
                  })}
                </SearchSection>
              )}

              {showProfessionals && filteredProfessionals.length > 0 && (
                <SearchSection title={t("tab_professionals")}>
                  {filteredProfessionals.map((pro) => {
                    const subtitle =
                      pro.centerCategoryName ||
                      pro.centerGlobalCategoryName ||
                      pro.centerName;
                    return (
                      <ListItemButton
                        key={`p-${pro.key}`}
                        onClick={() => selectProfessional(pro)}
                      >
                        {pro.image ? (
                          <img
                            src={pro.image}
                            alt=""
                            className="w-8 h-8 object-cover rounded-full mx-2"
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              mx: 1,
                              borderRadius: "50%",
                              bgcolor: "grey.200",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <UserIcon size={14} className="text-gray-700" />
                          </Box>
                        )}
                        <ListItemText primary={pro.name} secondary={subtitle} />
                      </ListItemButton>
                    );
                  })}
                </SearchSection>
              )}
            </Box>
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

function FilterPill({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
      )}
    >
      <span>{children}</span>
      {count != null && count > 0 && (
        <span
          className={cn(
            "inline-flex h-4 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
            active ? "bg-white/15 text-white" : "bg-gray-100 text-gray-700"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          px: 2,
          py: 0.5,
          color: "text.secondary",
          fontWeight: 600,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          display: "block",
        }}
      >
        {title}
      </Typography>
      <List dense disablePadding>
        {children}
      </List>
    </Box>
  );
}
