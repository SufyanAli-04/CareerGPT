import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, 
  Sparkles, ShieldCheck, Mail, ArrowRight 
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { successToast, errorToast } from '../../utils/toast';

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM'
];

interface BookingState {
  name: string;
  email: string;
  company?: string;
  businessSize?: string;
  challenges?: string;
}

const BookSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = (location.state as BookingState) || {
    name: '',
    email: '',
    company: '',
    businessSize: '',
    challenges: ''
  };

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<Array<{ date: string; timeSlot: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch booked slots on mount
  useEffect(() => {
    const fetchBooked = async () => {
      try {
        const res = await bookingService.getBookedDates();
        if (res.data?.success) {
          setBookedSlots(res.data.bookedSlots || []);
        }
      } catch (err) {
        console.error('Fetch Booked Slots Error:', err);
      }
    };
    fetchBooked();
  }, []);

  // Simple validation to check if redirected from landing form
  useEffect(() => {
    if (!formData.name || !formData.email) {
      toastInfo();
    }
  }, [formData]);

  const toastInfo = () => {
    errorToast('Please fill out the session request form on the main page first.');
    navigate('/');
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday...

  const days = [];
  // Empty spaces for previous month's alignment
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    // Don't go to past months
    if (prev >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
      setCurrentDate(prev);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateStr = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 Sunday, 6 Saturday
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getSlotStatus = (dateStr: string, slot: string) => {
    const isBooked = bookedSlots.some(
      (b) => b.date === dateStr && b.timeSlot === slot
    );
    return isBooked ? 'booked' : 'available';
  };

  const handleConfirmBooking = async () => {
    if (!selectedDateStr || !selectedTimeSlot) {
      errorToast('Please select a Date and a Time Slot.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({
        ...formData,
        date: selectedDateStr,
        timeSlot: selectedTimeSlot
      });
      if (res.data?.success) {
        successToast(res.data.message || 'Session booked successfully!');
        setSuccess(true);
      } else {
        errorToast(res.data?.message || 'Failed to book session');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Booking failed. Try a different slot.';
      errorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#030308] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-xl p-8 rounded-3xl border border-purple-500/30 bg-[#0a0815]/90 backdrop-blur-xl text-center shadow-[0_20px_50px_rgba(168,85,247,0.15)]"
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 text-purple-400">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300 mb-3">
            Strategy Session Booked!
          </h2>
          <p className="text-gray-300 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Thank you, <span className="text-white font-semibold">{formData.name}</span>. We've reserved your slot on <span className="text-purple-400 font-semibold">{selectedDateStr}</span> at <span className="text-purple-400 font-semibold">{selectedTimeSlot}</span>. A confirmation invite and calendar block have been sent to <span className="text-white font-semibold">{formData.email}</span>.
          </p>

          <div className="p-4 rounded-2xl border border-white/5 bg-white/5 text-left text-xs space-y-2 mb-8">
            <div className="flex justify-between"><span className="text-gray-400">Client Name:</span> <span className="text-white font-medium">{formData.name}</span></div>
            {formData.company && <div className="flex justify-between"><span className="text-gray-400">Company:</span> <span className="text-white font-medium">{formData.company}</span></div>}
            <div className="flex justify-between"><span className="text-gray-400">Selected Date:</span> <span className="text-white font-medium">{selectedDateStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Time Slot:</span> <span className="text-white font-medium">{selectedTimeSlot}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status:</span> <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold uppercase tracking-wider">Scheduled (Ongoing)</span></div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold text-xs hover:shadow-lg hover:shadow-purple-600/25 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Return to Homepage <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030308] text-white flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#030308]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-[1480px] mx-auto px-4 py-6 flex items-center justify-between border-b border-white/5">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Homepage
        </button>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300">
          CareerGPT
        </span>
      </header>

      {/* Main Content Split Screen */}
      <main className="relative z-10 flex-1 w-full max-w-[1480px] mx-auto px-4 py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Side: Text and Strategy details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
              1-on-1 AI Career Consultation
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
              Schedule Your Career <span className="saas-gradient-text">Strategy Session</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Select an available date and time slot from the calendar. We'll map your profile strengths, discuss AI implementation strategies, and craft a step-by-step career path.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex gap-4 items-start p-4 rounded-2xl border border-white/5 bg-white/5">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl mt-0.5"><Clock size={20} /></div>
              <div>
                <h4 className="font-semibold text-white text-base">Duration & Medium</h4>
                <p className="text-sm text-gray-400 mt-1">45-minute interactive video call with Screen Share via Google Meet / Zoom.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl border border-white/5 bg-white/5">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl mt-0.5"><ShieldCheck size={20} /></div>
              <div>
                <h4 className="font-semibold text-white text-base">Interactive Assessment</h4>
                <p className="text-sm text-gray-400 mt-1">Live review of your ATS Resume evaluation, skill gap diagnostics, and matching targets.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl border border-white/5 bg-white/5">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl mt-0.5"><Mail size={20} /></div>
              <div>
                <h4 className="font-semibold text-white text-base">Calendar Invite</h4>
                <p className="text-sm text-gray-400 mt-1">An instant calendar invitation link will be sent to your email with link access.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Calendar & Time Slots */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0b0816]/70 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" /> Choose Date & Time
            </h3>

            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-white text-sm uppercase tracking-wider">
                {currentDate.toLocaleString('default', { month: 'long' })} {year}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                >
                  &larr;
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                >
                  &rarr;
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center mb-6">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="text-xs font-bold text-gray-500 uppercase py-1">{d}</span>
              ))}
              {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = formatDateStr(day);
                const isSelected = selectedDateStr === dateStr;
                const isWknd = isWeekend(day);
                const isPst = isPast(day);
                const disabled = isWknd || isPst;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (!disabled) {
                        setSelectedDateStr(dateStr);
                        setSelectedTimeSlot(''); // reset slot on date change
                      }
                    }}
                    disabled={disabled}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-600 text-white shadow-neon border border-purple-400' 
                        : disabled
                          ? 'text-gray-600 bg-transparent cursor-not-allowed'
                          : 'text-gray-300 border border-white/5 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/30'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Time Slot Selection (Shows up when Date is selected) */}
            {selectedDateStr && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-white/5"
              >
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" /> Available Time Slots for {selectedDateStr}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const status = getSlotStatus(selectedDateStr, slot);
                    const isBooked = status === 'booked';
                    const isSelected = selectedTimeSlot === slot;

                    return (
                      <button
                        key={slot}
                        onClick={() => {
                          if (!isBooked) setSelectedTimeSlot(slot);
                        }}
                        disabled={isBooked}
                        className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-400 shadow-lg' 
                            : isBooked
                              ? 'bg-red-500/10 border-red-500/20 text-red-400/50 cursor-not-allowed line-through'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/35'
                        }`}
                      >
                        {slot} {isBooked && '(Booked)'}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Booking confirmation trigger button */}
            <button
              onClick={handleConfirmBooking}
              disabled={submitting || !selectedDateStr || !selectedTimeSlot}
              className="mt-8 h-12 w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking Your Session...
                </>
              ) : (
                <>Confirm Booking Session <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookSession;
