import React, { useState } from 'react';
import { XIcon, SendIcon } from 'lucide-react';
interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  subject: string;
}
export function ReplyModal({
  isOpen,
  onClose,
  recipient,
  subject
}: ReplyModalProps) {
  const [message, setMessage] = useState('');
  if (!isOpen) return null;
  const handleSend = () => {
    console.log('Sending email to:', recipient);
    console.log('Message:', message);
    onClose();
    setMessage('');
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 rounded-xl border border-white/10 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Reply to: {subject}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">To:</label>
            <input type="text" value={recipient} readOnly className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Message:
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your reply..." rows={8} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleSend} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-colors">
              <SendIcon className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>;
}