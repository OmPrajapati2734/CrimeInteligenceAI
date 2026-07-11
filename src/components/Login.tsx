import React, { useState } from 'react';
import { Shield, Lock, User, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { sanitizeInput } from '../utils/sanitize';

interface LoginProps {
  onLoginSuccess: (token: string, officer: string, role: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('DGP');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CREDENTIALS: Record<string, { email: string; pass: string; name: string; label: string }> = {
    DGP: { email: 'dgp@ksp.gov.in', pass: 'DGP_ksp_2026!', name: 'DGP H. K. Patel', label: 'Director General of Police' },
    SP: { email: 'sp@ksp.gov.in', pass: 'SP_ksp_2026!', name: 'SP Rajesh Kumar', label: 'Superintendent of Police' },
    IO: { email: 'io@ksp.gov.in', pass: 'IO_ksp_2026!', name: 'Inspector H. S. Rao', label: 'Investigating Officer' },
    Constable: { email: 'constable@ksp.gov.in', pass: 'Constable_ksp_2026!', name: 'Constable Kumar S.', label: 'Police Constable' },
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setEmail(CREDENTIALS[role].email);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Escape inputs to prevent XSS/Injection
    const safeEmail = sanitizeInput(email);
    const safePassword = sanitizeInput(password);

    // Simulate Network/Enclave Latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const config = CREDENTIALS[selectedRole];
    if (config && safeEmail === config.email && safePassword === config.pass) {
      // Create secure token string: role-timestamp-salt
      const timestamp = Date.now();
      const rawToken = `${selectedRole}:${timestamp}:ksp_secure_salt_7721`;
      // Convert to mock hex token
      const hexToken = btoa(rawToken);
      
      // Store in sessionStorage
      sessionStorage.setItem('ksp_auth_token', hexToken);
      sessionStorage.setItem('ksp_auth_role', selectedRole);
      sessionStorage.setItem('ksp_auth_officer', config.name);
      
      setLoading(false);
      onLoginSuccess(hexToken, config.name, config.label);
    } else {
      setLoading(false);
      setError('Invalid credentials for selected clearing role.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#143D73]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-bg-secondary border border-border-color rounded-2xl shadow-xl p-8 z-10 animate-scale-in">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#143D73]/10 border border-[#143D73]/30 flex items-center justify-center mb-3">
            <Shield className="text-accent w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold uppercase font-outfit text-text-primary text-center leading-none">
            KSP Crime Intelligence OS
          </h2>
          <p className="text-[10px] text-text-muted font-mono tracking-widest uppercase mt-1">
            State Security Enclave Login
          </p>
        </div>

        {/* Tab Role Selectors */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-bg-tertiary border border-border-color rounded-lg mb-6">
          {Object.keys(CREDENTIALS).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className={`py-1.5 rounded text-[10px] font-bold transition ${
                selectedRole === role
                  ? 'bg-[#143D73] text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Selected Role Meta */}
        <div className="bg-[#143D73]/10 border border-[#143D73]/20 rounded-lg p-3.5 mb-6 text-xs flex gap-2.5 items-start">
          <Shield className="text-accent w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-text-primary block leading-none">
              Clearing Role: {selectedRole}
            </span>
            <span className="text-[10px] text-text-secondary block mt-1 font-mono">
              Cleared for {CREDENTIALS[selectedRole].label}. Access is logged.
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1.5">
              Secure Badge Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={CREDENTIALS[selectedRole].email}
                className="w-full bg-bg-primary text-text-primary text-xs pl-10 pr-4 py-2.5 rounded-lg border border-border-color outline-none focus:border-accent font-semibold transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1.5">
              Passkey Credentials
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-bg-primary text-text-primary text-xs pl-10 pr-10 py-2.5 rounded-lg border border-border-color outline-none focus:border-accent font-semibold transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-[11px] text-danger flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
              <p className="font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#143D73] hover:bg-[#1b4b8c] text-white font-bold rounded-lg text-xs transition border border-[#1b4b8c] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Decrypting Secure Profile...</span>
              </>
            ) : (
              <span>Authorize & Log In</span>
            )}
          </button>
        </form>

        {/* Security Warning Notice */}
        <div className="mt-6 border-t border-border-color pt-4 text-center">
          <p className="text-[9px] font-mono text-text-muted uppercase leading-relaxed">
            RESTRICTED GOVERNMENT COMPUTER SYSTEM. UNAUTHORIZED SYSTEM ACCESS SUBMITTED FOR CIVIL & CRIMINAL CHARGES UNDER IT ACT SEC 66.
          </p>
        </div>
      </div>
    </div>
  );
};
