"use client";

import React, { useState } from "react";
import { SelectedService } from "./BookingWizard";
import { Calendar, Clock, Star, MapPin, ChevronRight, ChevronLeft } from "lucide-react";

interface Step3TimeProps {
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
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
    let [hours, minutes] = time.split(':').map(Number);
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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        days.push({
            date,
            dayNumber: d,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: date.toISOString().split('T')[0],
        });
    }
    return days;
}

export default function Step3Time({ selectedServices, setSelectedServices }: Step3TimeProps) {
    // State for the currently displayed month in the circular picker
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const monthYearString = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
        setSelectedServices(prev =>
            prev.map(svc => ({ ...svc, date: dateStr, fromTime: "", toTime: "" }))
        );
        // Optionally, if the selected date is outside current month, update the picker to that month
        const selectedDateObj = new Date(dateStr);
        if (selectedDateObj.getMonth() !== currentMonth || selectedDateObj.getFullYear() !== currentYear) {
            setCurrentYear(selectedDateObj.getFullYear());
            setCurrentMonth(selectedDateObj.getMonth());
        }
    };

    const handleTimeSelect = (time24h: string) => {
        setSelectedServices(prev =>
            prev.map(svc => {
                const durationMinutes = parseDurationToMinutes(svc.duration || "1 hr");
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
    const selectedDate = mainService?.date ? new Date(mainService.date) : null;
    const fromTimeDisplay = mainService?.fromTime ? to12HourFormat(mainService.fromTime) : "";
    const toTimeDisplay = mainService?.toTime ? to12HourFormat(mainService.toTime) : "";
    const timeRange = fromTimeDisplay && toTimeDisplay
        ? `${fromTimeDisplay}–${toTimeDisplay}`
        : "Select time";
    const duration = mainService?.duration || "1 hr";

    // Determine which date is currently selected across all services (assuming same date for all)
    const selectedFullDate = mainService?.date || "";

    return (
        <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Select time</h1>

            <div className="flex justify-between items-center">
                <button
                    onClick={handleNoPreference}
                    className="text-sm font-medium text-gray-600 hover:text-[#623ce1] transition-colors"
                >
                    No preference
                </button>
                {/* Calendar icon for normal date picker */}
                <div className="relative">
                    <input
                        type="date"
                        id="calendar-date-input"
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        value={selectedFullDate}
                        onChange={(e) => handleDateSelect(e.target.value)}
                    />
                    <div className="bg-white border border-gray-200 rounded-full p-2 shadow-sm cursor-pointer hover:bg-gray-50">
                        <Calendar size={20} className="text-[#623ce1]" />
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
                        <Calendar size={18} className="text-[#623ce1]" />
                        <span className="font-semibold text-gray-800">{monthYearString}</span>
                    </div>
                    <button onClick={goNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>
                <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-thin">
                    {daysInMonth.map((day) => {
                        const isSelected = selectedFullDate === day.fullDate;
                        return (
                            <button
                                key={day.fullDate}
                                onClick={() => handleDateSelect(day.fullDate)}
                                className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-full transition-all
                                    ${isSelected
                                        ? 'bg-[#623ce1] text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <span className="text-xl font-bold">{day.dayNumber}</span>
                                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
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
                    <Clock size={18} className="text-[#623ce1]" />
                    <span className="font-semibold text-gray-800">Available time slots</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {TIME_SLOTS_24H.map((slot24h, idx) => {
                        const slot12h = TIME_SLOTS_12H[idx];
                        const isSelected = mainService?.fromTime === slot24h;
                        return (
                            <button
                                key={slot24h}
                                onClick={() => handleTimeSelect(slot24h)}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all
                                    ${isSelected
                                        ? 'bg-[#623ce1] text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                {slot12h}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    Duration: {duration} • End time calculated automatically
                </p>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mt-4">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Wow Beauty Lab MYMALL</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-gray-800">5.0</span>
                                <span className="text-gray-400 text-sm">★★★★★ (1,521)</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                                <MapPin size={14} />
                                <span>My Mall, Franklin Roosevelt, Limassol</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-5 bg-gray-50/40">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Date & Time</span>
                            <span className="font-medium text-gray-800">
                                {selectedDate ? (
                                    <>
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        , {timeRange}
                                    </>
                                ) : (
                                    "Not selected"
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Service</span>
                            <span className="font-medium text-gray-800 text-right max-w-[60%]">
                                {serviceNames} • {duration}
                            </span>
                        </div>
                        {/* <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-xl text-[#623ce1]">€{totalPrice}</span>
                        </div> */}
                    </div>
                </div>
                {/* <div className="p-5">
                    <button className="w-full bg-[#623ce1] hover:bg-[#4f2dc9] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                        Continue <ChevronRight size={18} />
                    </button>
                </div> */}
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 text-blue-800 p-4 rounded-xl">
                Select a date and time slot for your appointment. The end time will be set automatically based on service duration.
            </p>
        </div>
    );
}