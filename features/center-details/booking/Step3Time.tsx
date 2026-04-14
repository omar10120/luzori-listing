"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SelectedService } from "./BookingWizard";
import type { Worker } from "@/lib/apiEndpoints";
import { Calendar, Clock, Star, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface Step3TimeProps {
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
    selectedBranchId: number | null;
}

function toLocalDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Parse `YYYY-MM-DD` as local calendar date (avoids UTC shift from `new Date(isoString)`). */
function parseLocalDateKey(dateKey: string): Date | null {
    if (!dateKey) return null;
    const [y, m, d] = dateKey.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

/** Strictly before local today (compare as ISO date strings). */
function isBeforeLocalToday(dateKey: string, todayKey: string): boolean {
    return dateKey < todayKey;
}

function time24hToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}

function getNowMinutesLocal(): number {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
}

/** Slot start is not usable when booking for today and the time has already passed. */
function isTimeSlotUnavailable(
    slot24h: string,
    selectedDateKey: string,
    todayKey: string
): boolean {
    if (!selectedDateKey) return true;
    if (selectedDateKey !== todayKey) return false;
    return time24hToMinutes(slot24h) <= getNowMinutesLocal();
}

/** Same worker resolution as booking submit / step 2 (branch pool, then explicit id). */
function resolveWorkerForService(
    svc: SelectedService,
    branchId: number | null
): Worker | undefined {
    const branchPool =
        branchId != null
            ? svc.workers?.filter((w) => w.branch_id === branchId) ?? []
            : [];
    const pool = branchPool.length > 0 ? branchPool : svc.workers ?? [];
    const explicitId = svc.selectedWorkerId;
    if (explicitId != null) {
        return pool.find((w) => w.id === explicitId) ?? svc.workers?.find((w) => w.id === explicitId);
    }
    return pool[0] ?? svc.workers?.[0];
}

function collectWorkerVacationDateKeys(
    services: SelectedService[],
    branchId: number | null
): Set<string> {
    const keys = new Set<string>();
    for (const svc of services) {
        const worker = resolveWorkerForService(svc, branchId);
        for (const v of worker?.vacations ?? []) {
            if (v?.day) keys.add(v.day.slice(0, 10));
        }
    }
    return keys;
}

// Helper: parse duration string like "1 hr, 30 mins" or "1 hr" to minutes
function parseDurationToMinutes(duration: string): number {
    let total = 0;
    const hoursMatch = duration.match(/(\d+)\s*hr/);
    const minsMatch = duration.match(/(\d+)\s*min/);
    if (hoursMatch) total += parseInt(hoursMatch[1]) * 60;
    if (minsMatch) total += parseInt(minsMatch[1]);
    return total || 120; // default 2 hours
}

// Convert "2:30 pm" -> "14:30"
function to24HourFormat(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    const parts = time.split(':').map(Number);
    let hours = parts[0];
    const minutes = parts[1];
    if (modifier === 'pm' && hours !== 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Add minutes to a 24h time string and return as 24h
function addMinutesTo24h(time24h: string, minutesToAdd: number): string {
    const [hours, minutes] = time24h.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    const newHours = date.getHours();
    const newMinutes = date.getMinutes();
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

// Convert 24h "14:30" -> "2:30 pm"
function to12HourFormat(time24h: string): string {
    const [hours, minutes] = time24h.split(':').map(Number);
    const modifier = hours >= 12 ? 'pm' : 'am';
    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${displayHours}:${paddedMinutes} ${modifier}`;
}

// Predefined time slots in 12h display format
const TIME_SLOTS_12H = [
    "9:00 am",
    "9:30 am",
    "10:00 am",
    "10:30 am",
    "11:00 am",
    "11:30 am",
    "12:00 pm",
    "12:30 pm",
    "1:00 pm",
    "1:30 pm",
    "2:00 pm",
    "2:30 pm",
    "3:00 pm",
    "3:30 pm",
    "4:00 pm",
    "4:30 pm",
    "5:00 pm",
    "5:30 pm",
    "6:00 pm",
    "6:30 pm",
    "7:00 pm",
    "7:30 pm",
    "8:00 pm"
];
const TIME_SLOTS_24H = TIME_SLOTS_12H.map(to24HourFormat);

// Generate days for a given month (year, month) - returns array of {date, dayNumber, dayName, fullDate}
function getDaysInMonth(year: number, month: number) {
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        days.push({
            date,
            dayNumber: d,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: toLocalDateKey(date),
        });
    }
    return days;
}

export default function Step3Time({
    selectedServices,
    setSelectedServices,
    selectedBranchId,
}: Step3TimeProps) {
    const t = useTranslations();
    const locale = useLocale();
    // State for the currently displayed month in the circular picker
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const monthYearString = new Date(currentYear, currentMonth).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const vacationDateKeys = useMemo(
        () => collectWorkerVacationDateKeys(selectedServices, selectedBranchId),
        [selectedServices, selectedBranchId]
    );

    const todayKey = toLocalDateKey(new Date());

    const isDateUnavailable = (dateKey: string) =>
        vacationDateKeys.has(dateKey) || isBeforeLocalToday(dateKey, todayKey);

    const selectedDateKey = selectedServices[0]?.date ?? "";

    // Drop date/time if in the past or worker vacation (e.g. data refreshed).
    useEffect(() => {
        if (!selectedDateKey) return;
        const blocked =
            vacationDateKeys.has(selectedDateKey) ||
            isBeforeLocalToday(selectedDateKey, todayKey);
        if (!blocked) return;
        setSelectedServices((prev) =>
            prev.map((svc) => ({ ...svc, date: "", fromTime: "", toTime: "" }))
        );
    }, [selectedDateKey, vacationDateKeys, todayKey, setSelectedServices]);

    const selectedFromTime = selectedServices[0]?.fromTime ?? "";
    const visibleDays = daysInMonth.filter((day) => !isBeforeLocalToday(day.fullDate, todayKey));

    // Clear time if it's today and the chosen slot is now in the past.
    useEffect(() => {
        if (!selectedDateKey || !selectedFromTime) return;
        if (!isTimeSlotUnavailable(selectedFromTime, selectedDateKey, todayKey)) return;
        setSelectedServices((prev) =>
            prev.map((svc) => ({ ...svc, fromTime: "", toTime: "" }))
        );
    }, [selectedDateKey, selectedFromTime, todayKey, setSelectedServices]);

    // Navigation: previous month
    const goPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(currentYear - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };
    // Navigation: next month
    const goNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear(currentYear + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Handle date selection (both from circular picker and calendar)
    const handleDateSelect = (dateStr: string) => {
        if (isDateUnavailable(dateStr)) return;
        setSelectedServices(prev =>
            prev.map(svc => ({ ...svc, date: dateStr, fromTime: "", toTime: "" }))
        );
        // Optionally, if the selected date is outside current month, update the picker to that month
        const selectedDateObj = parseLocalDateKey(dateStr);
        if (
            selectedDateObj &&
            (selectedDateObj.getMonth() !== currentMonth ||
                selectedDateObj.getFullYear() !== currentYear)
        ) {
            setCurrentYear(selectedDateObj.getFullYear());
            setCurrentMonth(selectedDateObj.getMonth());
        }
    };

    const handleTimeSelect = (time24h: string) => {
        const dateKey = selectedServices[0]?.date ?? "";
        if (isTimeSlotUnavailable(time24h, dateKey, todayKey)) return;
        setSelectedServices(prev =>
            prev.map(svc => {
                const durationMinutes = parseDurationToMinutes(svc.duration || t("booking_default_short_duration"));
                const toTime = addMinutesTo24h(time24h, durationMinutes);
                return { ...svc, fromTime: time24h, toTime };
            })
        );
    };

    const handleNoPreference = () => {
        setSelectedServices(prev =>
            prev.map(svc => ({ ...svc, date: "", fromTime: "", toTime: "" }))
        );
    };

    // Total price
    const totalPrice = selectedServices.reduce((sum, svc) => sum + (Number(svc.price) || 0), 0);

    const mainService = selectedServices[0];
    const serviceNames = selectedServices.map(s => s.name).join(" + ");
    const selectedDate = mainService?.date ? parseLocalDateKey(mainService.date) : null;
    const fromTimeDisplay = mainService?.fromTime ? to12HourFormat(mainService.fromTime) : "";
    const toTimeDisplay = mainService?.toTime ? to12HourFormat(mainService.toTime) : "";
    const timeRange = fromTimeDisplay && toTimeDisplay
        ? `${fromTimeDisplay}–${toTimeDisplay}`
        : t("booking_select_time");
    const duration = mainService?.duration || t("booking_default_short_duration");

    // Determine which date is currently selected across all services (assuming same date for all)
    const selectedFullDate = mainService?.date || "";
    const visibleTimeSlots = TIME_SLOTS_24H
        .map((slot24h, idx) => ({ slot24h, slot12h: TIME_SLOTS_12H[idx] }))
        .filter(({ slot24h }) => selectedFullDate && !isTimeSlotUnavailable(slot24h, selectedFullDate, todayKey));

    return (
        <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">{t("booking_select_time")}</h1>

            <div className="flex justify-between items-center">
                <button
                    onClick={handleNoPreference}
                    className="text-sm font-medium text-gray-600 hover:text-[#225D5C] transition-colors"
                >
                    {t("booking_no_preference")}
                </button>
                {/* Calendar icon for normal date picker */}
                <div className="relative">
                    <input
                        type="date"
                        id="calendar-date-input"
                        min={todayKey}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        value={selectedFullDate}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (!v || isDateUnavailable(v)) return;
                            handleDateSelect(v);
                        }}
                    />
                    <div className="bg-white border border-gray-200 rounded-full p-2 shadow-sm cursor-pointer hover:bg-gray-50">
                        <Calendar size={20} className="text-[#225D5C]" />
                    </div>
                </div>
            </div>

            {/* Date picker - circular with month navigation */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={goPrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-[#225D5C]" />
                        <span className="font-semibold text-gray-800">{monthYearString}</span>
                    </div>
                    <button onClick={goNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>
                <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-thin">
                    {visibleDays.map((day) => {
                        const isSelected = selectedFullDate === day.fullDate;
                        const isVacation = vacationDateKeys.has(day.fullDate);
                        const isOff = isVacation;
                        return (
                            <button
                                key={day.fullDate}
                                type="button"
                                disabled={isOff}
                                title={
                                    isVacation
                                            ? t("booking_professional_unavailable_day_off")
                                            : undefined
                                }
                                onClick={() => !isOff && handleDateSelect(day.fullDate)}
                                className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-full transition-all
                                    ${isOff
                                        ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-100"
                                        : isSelected
                                            ? "bg-[#225D5C] text-white shadow-md"
                                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                                    }`}
                            >
                                <span className="text-xl font-bold">{day.dayNumber}</span>
                                <span className={`text-xs ${isSelected && !isOff ? "text-white/80" : "text-gray-500"}`}>
                                    {day.dayName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time slots list */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-[#225D5C]" />
                    <span className="font-semibold text-gray-800">{t("booking_available_time_slots")}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {visibleTimeSlots.map(({ slot24h, slot12h }) => {
                        const isSelected = mainService?.fromTime === slot24h;
                        return (
                            <button
                                key={slot24h}
                                type="button"
                                onClick={() => handleTimeSelect(slot24h)}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all
                                    ${isSelected
                                        ? "bg-[#225D5C] text-white shadow-md"
                                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                                    }`}
                            >
                                {slot12h}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    {!selectedFullDate
                        ? t("booking_choose_date_to_see_available_times")
                        : t("booking_duration_with_auto_end", { duration })}
                </p>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mt-4">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">{t("booking_sample_center_name")}</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-gray-800">5.0</span>
                                <span className="text-gray-400 text-sm">★★★★★ (1,521)</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                                <MapPin size={14} />
                                <span>{t("booking_sample_center_address")}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-5 bg-gray-50/40">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">{t("booking_date_time")}</span>
                            <span className="font-medium text-gray-800">
                                {selectedDate ? (
                                    <>
                                        {selectedDate.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        , {timeRange}
                                    </>
                                ) : (
                                    t("booking_not_selected")
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">{t("services")}</span>
                            <span className="font-medium text-gray-800 text-right max-w-[60%]">
                                {serviceNames} • {duration}
                            </span>
                        </div>
                        {/* <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-xl text-[#225D5C]">€{totalPrice}</span>
                        </div> */}
                    </div>
                </div>
                {/* <div className="p-5">
                    <button className="w-full bg-[#225D5C] hover:bg-[#4f2dc9] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                        Continue <ChevronRight size={18} />
                    </button>
                </div> */}
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 text-blue-800 p-4 rounded-xl">
                {t("booking_select_date_time_hint")}
            </p>
        </div>
    );
}