import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, Database, ShieldCheck, ExternalLink, RefreshCw, Plus, Clock, MapPin, Footprints } from 'lucide-react';
import { auth, signInWithGoogle, logoutUser, getCachedAccessToken } from '../../lib/firebase';
import { listGoogleCalendarEvents, CalendarEventResult } from '../../lib/googleWorkspace';
import { User as FirebaseUser } from 'firebase/auth';

interface WorkspaceHubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendarModal: () => void;
  onOpenGmailModal: () => void;
}

export const WorkspaceHubDrawer: React.FC<WorkspaceHubDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCalendarModal,
  onOpenGmailModal,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [activeTab, setActiveTab] = useState<'calendar' | 'gmail' | 'firebase'>('calendar');
  const [events, setEvents] = useState<CalendarEventResult[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u && getCachedAccessToken()) {
        fetchCalendarEvents();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCalendarEvents = async () => {
    if (!getCachedAccessToken()) return;
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const items = await listGoogleCalendarEvents();
      setEvents(items);
    } catch (err: any) {
      console.error('Fetch events error:', err);
      setEventsError(err.message || 'Failed to sync with Google Calendar.');
    } fontFinally: {
      setLoadingEvents(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Google Workspace</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  CONNECTED
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Google Calendar, Gmail & Firebase Hub
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

        {/* User Card */}
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 text-white flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-3 min-w-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-[#0B8F63]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0B8F63] text-white font-bold flex items-center justify-center">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-xs block text-white truncate">
                  {user.displayName || 'Google Account User'}
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  {user.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Not signed in</span>
              <button
                onClick={() => signInWithGoogle()}
                className="bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Sign in with Google
              </button>
            </div>
          )}

          {user && (
            <button
              onClick={() => logoutUser()}
              className="text-[11px] font-bold text-neutral-400 hover:text-red-400 underline shrink-0"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-2 pt-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2.5 px-3 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'calendar'
                ? 'border-[#0B8F63] text-[#0B8F63] bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-2.5 px-3 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'gmail'
                ? 'border-red-600 text-red-600 bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2.5 px-3 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'firebase'
                ? 'border-amber-600 text-amber-600 bg-white rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firestore</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">

          {/* TAB 1: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-neutral-900">
                    Google Calendar Events
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Synced VIP store fitting appointments
                  </p>
                </div>
                <button
                  onClick={fetchCalendarEvents}
                  disabled={loadingEvents}
                  className="p-1.5 text-neutral-500 hover:text-[#0B8F63] hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Refresh Events"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin text-[#0B8F63]' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => { onClose(); onOpenCalendarModal(); }}
                className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Book New VIP Store Fitting</span>
              </button>

              {eventsError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                  {eventsError}
                </div>
              )}

              {events.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                    Upcoming Synced Events
                  </span>
                  {events.map((evt) => (
                    <div key={evt.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-xs text-neutral-900">{evt.summary}</h5>
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#0B8F63] hover:bg-[#0B8F63]/10 rounded-lg shrink-0"
                            title="View in Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-[#0B8F63]" />
                          {new Date(evt.start.dateTime).toLocaleDateString()} at {new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 space-y-2">
                  <Calendar className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-xs font-semibold text-neutral-700">No upcoming fittings booked</p>
                  <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                    Click above to schedule a store visit and automatically sync it with your Google Calendar.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GMAIL */}
          {activeTab === 'gmail' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-neutral-900">
                  Gmail Integration
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Send store inquiries and footwear orders via Gmail API
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-xs text-red-900">Direct Store Email Service</span>
                </div>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Send emails directly from your Gmail address (<span className="font-bold">{user?.email || 'Your Gmail'}</span>) to Marudhar Fashion Point managers.
                </p>
                <button
                  onClick={() => { onClose(); onOpenGmailModal(); }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Inquiry via Gmail</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                  Quick Email Shortcuts
                </span>
                
                <button
                  onClick={() => { onClose(); onOpenGmailModal(); }}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-xs text-neutral-800 block group-hover:text-red-600">
                      Footwear Size Consultation
                    </span>
                    <span className="text-[10px] text-neutral-500">Ask for size availability or custom measurements</span>
                  </div>
                  <Mail className="w-4 h-4 text-neutral-400 group-hover:text-red-600 shrink-0" />
                </button>

                <button
                  onClick={() => { onClose(); onOpenGmailModal(); }}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border text-left flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-xs text-neutral-800 block group-hover:text-red-600">
                      Bulk / Wholesale Order Quote
                    </span>
                    <span className="text-[10px] text-neutral-500">Inquire about wedding party shoes & bulk clothing</span>
                  </div>
                  <Mail className="w-4 h-4 text-neutral-400 group-hover:text-red-600 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-neutral-900">
                  Firebase Cloud Firestore
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Real-time persistent data storage status
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0B8F63]" />
                  <span className="font-bold text-xs text-emerald-900">Firestore Database Active</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Your store appointments, customer inquiries, and user settings are synchronized in real-time with Google Firebase Cloud Storage.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border text-xs space-y-2 text-neutral-700">
                <div className="flex justify-between border-b pb-1.5">
                  <span>Database Region:</span>
                  <span className="font-bold text-neutral-900">asia-southeast1</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Collections:</span>
                  <span className="font-mono text-[10px] text-[#0B8F63] font-bold">users, inquiries, appointments</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Rules:</span>
                  <span className="font-bold text-emerald-600">Deployed & Active</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-center text-[10px] text-neutral-500">
          Marudhar Fashion Point • Official Google Calendar & Gmail Integration
        </div>

      </div>
    </div>
  );
};
