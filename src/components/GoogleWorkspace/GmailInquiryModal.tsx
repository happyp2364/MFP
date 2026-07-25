import React, { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';
import { auth, signInWithGoogle, getCachedAccessToken, handleFirestoreError, db } from '../../lib/firebase';
import { sendGmailMessage, GmailSendResult } from '../../lib/googleWorkspace';
import { collection, addDoc } from 'firebase/firestore';

interface GmailInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultBody?: string;
}

export const GmailInquiryModal: React.FC<GmailInquiryModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'Custom Shoe Inquiry - Marudhar Fashion Point',
  defaultBody = '',
}) => {
  const [user, setUser] = useState(auth.currentUser);
  const [subject, setSubject] = useState(defaultSubject);
  const [category, setCategory] = useState('Order & Footwear Size Inquiry');
  const [message, setMessage] = useState(defaultBody);
  const recipientEmail = 'vpcreation2002@gmail.com';

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<GmailSendResult | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (defaultSubject) setSubject(defaultSubject);
    if (defaultBody) setMessage(defaultBody);
  }, [defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user || !getCachedAccessToken()) {
      setErrorMsg('Please sign in with Google to send messages directly from your Gmail account.');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('Please type your inquiry message before sending.');
      return;
    }

    // Trigger explicit user confirmation dialog
    setShowConfirmModal(true);
  };

  const executeGmailSend = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const fullBody = `Inquiry Category: ${category}\nFrom: ${user?.displayName || 'Customer'} (${user?.email})\nPhone: +91 9782482250\n\nMessage:\n${message}\n\n---\nSent via Marudhar Fashion Point Gmail Integration`;

      // 1. Call Gmail API
      const res = await sendGmailMessage({
        to: recipientEmail,
        subject,
        bodyText: fullBody,
      });

      // 2. Save inquiry in Firestore
      try {
        await addDoc(collection(db, 'inquiries'), {
          userId: user?.uid || 'guest',
          email: user?.email || '',
          name: user?.displayName || 'Valued Customer',
          category,
          message,
          gmailThreadId: res.threadId || res.id,
          sentViaGmail: true,
          createdAt: new Date().toISOString(),
        });
      } catch (fsErr) {
        handleFirestoreError(fsErr, 'Save Gmail Inquiry');
      }

      setSendResult(res);
    } catch (err: any) {
      console.error('Gmail send failed:', err);
      setErrorMsg(err.message || 'Failed to send Gmail message. Please check permissions.');
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
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                <span>Send Direct Gmail Message</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-extrabold px-2 py-0.5 rounded-full border border-red-500/30">
                  GMAIL API
                </span>
              </h3>
              <p className="text-[11px] text-neutral-300">
                Email store owners directly at {recipientEmail}
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

          {sendResult ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0B8F63] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xl text-neutral-900">
                  Email Sent via Gmail!
                </h4>
                <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                  Your message was delivered from <span className="font-bold text-neutral-900">{user?.email}</span> to <span className="font-bold text-neutral-900">{recipientEmail}</span>.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-500 font-medium">Subject:</span>
                  <span className="font-bold text-neutral-800">{subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Message Ref:</span>
                  <span className="font-mono text-[10px] text-neutral-600">{sendResult.id}</span>
                </div>
              </div>

              <button
                onClick={() => { setSendResult(null); onClose(); }}
                className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3 rounded-xl shadow-md text-xs transition-all"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMsg}</p>
                    {!user && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await signInWithGoogle();
                            setErrorMsg(null);
                          } catch (e) {}
                        }}
                        className="underline text-red-800 font-bold mt-1 block"
                      >
                        Click here to Sign in with Google
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Connected Account */}
              <div className="p-3 bg-neutral-50 rounded-2xl border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
                      G
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-neutral-800 block">
                      From: {user ? user.email : 'Not Signed In'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      To: {recipientEmail}
                    </span>
                  </div>
                </div>

                {!user && (
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Inquiry Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Order & Footwear Size Inquiry">Order & Footwear Size Inquiry</option>
                  <option value="Custom Design / Wholesale Request">Custom Design / Wholesale Request</option>
                  <option value="Store Visit & VIP Fitting Question">Store Visit & VIP Fitting Question</option>
                  <option value="Feedback / Return Request">Feedback / Return Request</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Your Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message details, requested shoe sizes, or questions here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-600/20 text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending Gmail Message...' : 'Send Email via Gmail'}</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* EXPLICIT MANDATORY USER CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-100 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-neutral-900">
                Confirm Gmail Message Dispatch
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Do you confirm sending this email directly from your Gmail account (<span className="font-bold text-neutral-900">{user?.email}</span>) to <span className="font-bold text-neutral-900">{recipientEmail}</span>?
              </p>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border text-left text-[11px] space-y-1 text-neutral-700">
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Category:</strong> {category}</p>
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
                onClick={executeGmailSend}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                Yes, Send Gmail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
