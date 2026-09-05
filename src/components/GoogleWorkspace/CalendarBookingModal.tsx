import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Footprints, Sparkles, CheckCircle2, ExternalLink, AlertCircle, ShieldAlert } from 'lucide-react';
import { auth, signInWithGoogle, getCachedAccessToken, handleFirestoreError, db } from '../../lib/firebase';
import { createGoogleCalendarEvent, CalendarEventResult } from '../../lib/googleWorkspace';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CalendarBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarBookingModal: React.FC<CalendarBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState(auth.currentUser);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  const [category, setCategory] = useState('Men\'s Sports & Running Shoes');
  const [notes, setNotes] = useState('');
  
  // Modals & States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CalendarEventResult | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user || !getCachedAccessToken()) {
      setErrorMsg('Please sign in with Google to sync appointments to your Google Calendar.');
      return;
    }

    // Trigger explicit user confirmation dialog
    setShowConfirmModal(true);
  };

  const executeCalendarBooking = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Calculate start and end ISO strings
      const [hourStr, minuteStrWithPeriod] = timeSlot.split(':');
      const [minuteStr, period] = minuteStrWithPeriod.split(' ');
      let hour = parseInt(hourStr, 10);
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      const startDateObj = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minuteStr}:00+05:30`);
      const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000); // 1 hour slot

      const eventSummary = `VIP Shoe Fitting & Consultation - Marudhar Fashion Point`;
      const eventDescription = `Reserved VIP Fitting Session at Marudhar Fashion Point.\nCategory: ${category}\nNotes: ${notes || 'None'}\nPhone: +91 9782482250\nLocation: Pali, Rajasthan`;

      // 1. Call Google Calendar API
      const eventResult = await createGoogleCalendarEvent({
        summary: eventSummary,
        description: eventDescription,
        startDateTime: startDateObj.toISOString(),
        endDateTime: endDateObj.toISOString(),
        location: 'Marudhar Fashion Point, Pali, Rajasthan (+91 9782482250)',
      });

      // 2. Save appointment in Firestore
      try {
        await addDoc(collection(db, 'appointments'), {
          userId: user?.uid || 'guest',
          userEmail: user?.email || '',
          userName: user?.displayName || 'Valued Customer',
          date,
          timeSlot,
          category,
          notes,
          calendarEventId: eventResult.id,
          calendarHtmlLink: eventResult.htmlLink,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        });
      } catch (fsErr) {
        handleFirestoreError(fsErr, 'Save Appointment');
      }

      setCreatedEvent(eventResult);
    } catch (err: any) {
      console.error('Calendar booking failed:', err);
      setErrorMsg(err.message || 'Failed to add event to Google Calendar. Please check permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B8F63] flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                <span>Book VIP Store Fitting</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  GOOGLE CALENDAR SYNC
                </span>
              </h3>
              <p className="text-[11px] text-neutral-300">
                Reserve your store visit & sync event to Google Calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Success Screen */}
          {createdEvent ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0B8F63] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xl text-neutral-900">
                  Appointment Scheduled & Synced!
                </h4>
                <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                  Your VIP fitting session at Marudhar Fashion Point has been added to your Google Calendar.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-500 font-medium">Event:</span>
                  <span className="font-bold text-neutral-800">{createdEvent.summary}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-500 font-medium">Date & Time:</span>
                  <span className="font-bold text-[#0B8F63]">{date} at {timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Category:</span>
                  <span className="font-bold text-neutral-800">{category}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={createdEvent.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Calendar</span>
                </a>
                <button
                  onClick={() => { setCreatedEvent(null); onClose(); }}
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl text-xs"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMsg}</p>
                    {(!user || !getCachedAccessToken()) && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await signInWithGoogle(true);
                            setErrorMsg(null);
                          } catch (e: any) {
                            if (e?.code !== 'auth/popup-closed-by-user') {
                              setErrorMsg(e?.message || 'Google authorization failed.');
                            }
                          }
                        }}
                        className="underline text-red-800 font-bold mt-1 block"
                      >
                        Click here to Authorize Google Calendar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Account Status Badge */}
              <div className="p-3 bg-neutral-50 rounded-2xl border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Google" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#0B8F63] text-white font-bold flex items-center justify-center">
                      G
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-neutral-800 block">
                      {user ? user.displayName : 'Not Signed In'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {user
                        ? (getCachedAccessToken() ? user.email : 'Calendar authorization needed')
                        : 'Google Calendar sync requires authentication'}
                    </span>
                  </div>
                </div>

                {(!user || !getCachedAccessToken()) && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signInWithGoogle(true);
                        setErrorMsg(null);
                      } catch (e: any) {
                        if (e?.code !== 'auth/popup-closed-by-user') {
                          setErrorMsg(e?.message || 'Failed to authorize Google.');
                        }
                      }
                    }}
                    className="bg-[#0B8F63] hover:bg-[#086F4C] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all"
                  >
                    {!user ? 'Connect Google' : 'Authorize Calendar'}
                  </button>
                )}
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0B8F63]" />
                    <span>Fitting Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0B8F63]" />
                    <span>Preferred Slot</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                  >
                    <option value="10:00 AM">10:00 AM - Morning Slot</option>
                    <option value="11:30 AM">11:30 AM - Morning Slot</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                    <option value="04:30 PM">04:30 PM - Evening Slot</option>
                    <option value="07:00 PM">07:00 PM - Prime Evening Slot</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-[#0B8F63]" />
                  <span>Footwear Preference</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                >
                  <option value="Men's Sports & Running Shoes">Men's Sports & Running Shoes</option>
                  <option value="Men's Formal Leather Shoes">Men's Formal Leather Shoes</option>
                  <option value="Women's Sports & Athletic Shoes">Women's Sports & Athletic Shoes</option>
                  <option value="Kids' School & Sports Shoes">Kids' School & Sports Shoes</option>
                  <option value="Custom Size Request / Wedding Bulk Fitting">Custom Size / Wedding Bulk Fitting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Special Requests / Shoe Sizes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Size UK 9, looking for lightweight running sneakers or specific color preference..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B8F63]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#0B8F63]/20 text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{submitting ? 'Creating Event...' : 'Schedule & Sync to Google Calendar'}</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* EXPLICIT MANDATORY USER CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-100 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-neutral-900">
                Confirm Google Calendar Event
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Do you confirm creating the appointment event on your Google Calendar (<span className="font-bold text-neutral-900">{user?.email}</span>)?
              </p>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border text-left text-[11px] space-y-1 text-neutral-700">
              <p><strong>Title:</strong> VIP Shoe Fitting - Marudhar Fashion Point</p>
              <p><strong>Date & Time:</strong> {date} at {timeSlot}</p>
              <p><strong>Location:</strong> Pali, Rajasthan</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeCalendarBooking}
                className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                Yes, Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
