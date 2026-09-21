import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(currentUser.email || 'developer@aiinfrasummit.io');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(currentUser.name || 'Dev Engineer');
  const [team, setTeam] = useState(currentUser.hackathonTeam || 'InfraScale Zero');
  const [role, setRole] = useState(currentUser.role || 'AI Systems Architect');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      id: currentUser.id || `user_${Date.now()}`,
      name: name.trim() || 'Dev Engineer',
      email: email.trim() || 'developer@aiinfrasummit.io',
      role: role.trim() || 'AI Systems Architect',
      hackathonTeam: team.trim() || 'InfraScale Zero',
      isGuest: false,
    };
    StorageService.saveUser(updated);
    onUpdateUser(updated);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  const handleGuestLogin = () => {
    const guest: UserProfile = {
      id: 'guest_judge_01',
      name: 'Hackathon Judge',
      email: 'judge@aiinfrasummit.io',
      role: 'Hackathon Evaluator',
      hackathonTeam: 'AI Infra Summit Panel',
      isGuest: true,
    };
    StorageService.saveUser(guest);
    onUpdateUser(guest);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="auth-modal-container"
        className="w-full max-w-md bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111728]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isSignUp ? 'Create Developer Account' : 'Developer Authentication'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Supabase & Local Session Authentication
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Authentication state updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Alex Mercer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="dev@aiinfrasummit.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="AI Systems Architect"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Hackathon Team</label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="InfraScale Zero"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] mt-2"
          >
            {isSignUp ? 'Sign Up & Start Building' : 'Sign In'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-slate-500 text-[11px]">or quick evaluation</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-purple-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Continue as Hackathon Judge / Demo User</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 hover:text-blue-400 text-xs transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account yet? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
