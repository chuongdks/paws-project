import React from 'react';
import { X, User, Mail, ShieldCheck, VenetianMask, Pencil, Check, Loader2, Lock, Eye, EyeOff, Users, ShieldPlus, ShieldMinus, Ban, RotateCcw, ChevronDown } from 'lucide-react';
import { useAuth, GENDER_OPTIONS } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { useModalA11y } from '../hook/useModalA11y.js';
import { useUserManagement } from '../hook/useUserManagement.js';

// True unless the record explicitly marks the account inactive — handles
// is_active coming back as a real boolean, 0/1, or "0"/"1" from the API.
const isUserActive = (u) => !(u.is_active === false || u.is_active === 0 || u.is_active === '0');

// One row in the admin's user-management list — compact by necessity, since
// this whole panel lives inside the account modal's max-w-sm shell rather
// than getting its own dedicated screen.
function UserRow({ targetUser, isSelf, onPromote, onDemote, onToggleActive, busy }) {
  const isTargetAdmin = targetUser.role === 'admin';
  const active = isUserActive(targetUser);

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-divider-subtle last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-secondary-strong truncate">{targetUser.name}</p>
        <p className="text-[11px] text-faint truncate">{targetUser.email}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${
          isTargetAdmin ? 'bg-admin-soft text-admin-text border-admin-border' : 'bg-surface-subtle text-secondary border-divider'
        }`}>
          {isTargetAdmin ? 'Admin' : 'Member'}
        </span>
        {!active && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-danger-soft text-danger-text border border-danger-border whitespace-nowrap">
            Disabled
          </span>
        )}
        {!isSelf && (
          <>
            <button
              title={isTargetAdmin ? 'Demote to member' : 'Promote to admin'}
              onClick={() => (isTargetAdmin ? onDemote(targetUser.id) : onPromote(targetUser.id))}
              disabled={busy}
              className="p-1 rounded-md text-faint hover:text-accent-text hover:bg-accent-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isTargetAdmin ? <ShieldMinus className="h-3.5 w-3.5" /> : <ShieldPlus className="h-3.5 w-3.5" />}
            </button>
            <button
              title={active ? 'Disable account' : 'Re-enable account'}
              onClick={() => onToggleActive(targetUser.id, !active)}
              disabled={busy}
              className="p-1 rounded-md text-faint hover:text-danger-text hover:bg-danger-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {active ? <Ban className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Small read-only row, matches the style used in ServiceDetailPanel's InfoRow ──
function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-faint mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
        <div className="text-sm text-secondary-strong leading-snug">{children}</div>
      </div>
    </div>
  );
}

// `onExportServices` is optional and admin-only — passed down from App.jsx
// (useServiceCRUD's exportServicesJSON). Kept as a plain text link rather
// than a button so it doesn't read as a "real" feature in the UI; it's a dev
// convenience for refreshing src/data/service.json, not something meant to
// be discovered by browsing.
export default function AccountModal({ onClose, onExportServices }) {
  const { user, isAdmin, updateGender, profileError, clearProfileError, changePassword, passwordError, clearPasswordError } = useAuth();
  const [editingGender, setEditingGender] = useState(false);
  const [genderDraft, setGenderDraft]     = useState(user?.gender ?? '');
  const [savingGender, setSavingGender]   = useState(false);
  const panelRef = useModalA11y(onClose);

  // ── Change password ─────────────────────────────────────────────────────
  const [editingPassword, setEditingPassword]   = useState(false);
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showPasswords, setShowPasswords]       = useState(false);
  const [savingPassword, setSavingPassword]     = useState(false);
  const [passwordFormError, setPasswordFormError] = useState(null); // client-side checks, separate from the server's passwordError

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFormError(null);
    setShowPasswords(false);
  };

  const openPasswordForm = () => {
    resetPasswordForm();
    clearPasswordError();
    setEditingPassword(true);
  };

  const cancelPasswordForm = () => {
    resetPasswordForm();
    clearPasswordError();
    setEditingPassword(false);
  };

  const savePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordFormError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFormError('New password and confirmation do not match.');
      return;
    }
    setPasswordFormError(null);
    setSavingPassword(true);
    const ok = await changePassword(currentPassword, newPassword, confirmPassword);
    setSavingPassword(false);
    if (ok) {
      resetPasswordForm();
      setEditingPassword(false);
    }
  };

  // ── Manage users (admin only) ────────────────────────────────────────────
  const [showUserManagement, setShowUserManagement] = useState(false);
  const {
    users, loading: usersLoading, error: usersError, actioningId,
    fetchUsers, promote, demote, setActive,
  } = useUserManagement();

  const toggleUserManagement = () => {
    const next = !showUserManagement;
    setShowUserManagement(next);
    if (next && users.length === 0) fetchUsers();
  };

  if (!user) return null;

  const saveGender = async () => {
    setSavingGender(true);
    const ok = await updateGender(genderDraft);
    setSavingGender(false);
    if (ok) setEditingGender(false);
  };

  const inputCls = "w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all";

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="account-modal-title"
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 outline-none">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="account-modal-title" className="text-base font-bold text-primary">My Account</h2>
          <button onClick={onClose}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar + role badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-soft-strong text-accent-text-strong text-base font-bold flex items-center justify-center shrink-0">
            {user.name?.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
          </div>
          <div>
            <p className="font-semibold text-primary text-sm">{user.name}</p>
            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isAdmin
                ? 'bg-admin-soft text-admin-text border-admin-border'
                : 'bg-surface-subtle text-secondary border-divider'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-4 pt-1 border-t border-divider-subtle">
          <InfoRow icon={User} label="Name">{user.name}</InfoRow>
          <InfoRow icon={Mail} label="Email">{user.email}</InfoRow>
          <InfoRow icon={ShieldCheck} label="Role">{isAdmin ? 'Administrator' : 'Community Member'}</InfoRow>

          <InfoRow icon={VenetianMask} label="Gender">
            {editingGender ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={genderDraft}
                    onChange={e => setGenderDraft(e.target.value)}
                    disabled={savingGender}
                    className={inputCls}
                  >
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <button onClick={saveGender} title="Save" disabled={savingGender}
                    className="p-2 rounded-lg text-success-text hover:bg-success-soft transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed">
                    {savingGender ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                </div>
                {profileError && <p className="text-xs text-danger-text">{profileError}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>{user.gender || 'Not set'}</span>
                <button onClick={() => { setGenderDraft(user.gender ?? ''); clearProfileError(); setEditingGender(true); }} title="Edit"
                  className="p-1 rounded-md text-faint hover:text-accent-text hover:bg-accent-soft transition-colors">
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </InfoRow>
        </div>

        {/* Change password — collapsed by default, expands into a small form */}
        <div className="pt-1 border-t border-divider-subtle">
          {!editingPassword ? (
            <button onClick={openPasswordForm}
              className="flex items-center gap-2.5 text-sm text-secondary-strong hover:text-accent-text transition-colors">
              <Lock className="h-4 w-4 text-faint shrink-0" />
              Change Password
            </button>
          ) : (
            <div className="space-y-2.5">
              <p className="flex items-center gap-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <Lock className="h-4 w-4 text-faint shrink-0" /> Change Password
              </p>

              <div className="space-y-2 pl-6">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPasswordFormError(null); clearPasswordError(); }}
                  disabled={savingPassword}
                  className="w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all disabled:opacity-60"
                />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="New password (min. 6 characters)"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordFormError(null); clearPasswordError(); }}
                  disabled={savingPassword}
                  className="w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all disabled:opacity-60"
                />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordFormError(null); clearPasswordError(); }}
                  disabled={savingPassword}
                  className="w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all disabled:opacity-60"
                />

                <button type="button" onClick={() => setShowPasswords(s => !s)}
                  className="flex items-center gap-1.5 text-[11px] text-faint hover:text-secondary-strong transition-colors">
                  {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>

                {(passwordFormError || passwordError) && (
                  <p className="text-xs text-danger-text">{passwordFormError || passwordError}</p>
                )}

                <div className="flex gap-2 pt-0.5">
                  <button onClick={cancelPasswordForm} disabled={savingPassword}
                    className="flex-1 px-3 py-2 text-xs font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Cancel
                  </button>
                  <button onClick={savePassword} disabled={savingPassword}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {savingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {savingPassword ? 'Saving…' : 'Save Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manage users — admin only. Promote/demote and enable/disable any account. */}
        {isAdmin && (
          <div className="pt-1 border-t border-divider-subtle">
            <button onClick={toggleUserManagement}
              className="w-full flex items-center justify-between gap-2.5 text-sm text-secondary-strong hover:text-accent-text transition-colors">
              <span className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-faint shrink-0" />
                Manage Users
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-faint transition-transform ${showUserManagement ? 'rotate-180' : ''}`} />
            </button>

            {showUserManagement && (
              <div className="pt-2.5">
                {usersLoading ? (
                  <p className="text-xs text-faint italic py-2 text-center">Loading users…</p>
                ) : usersError ? (
                  <p className="text-xs text-danger-text py-2 text-center">{usersError}</p>
                ) : users.length === 0 ? (
                  <p className="text-xs text-faint italic py-2 text-center">No users found.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto pr-0.5">
                    {users.map(u => (
                      <UserRow
                        key={u.id}
                        targetUser={u}
                        isSelf={u.id === user.id}
                        onPromote={promote}
                        onDemote={demote}
                        onToggleActive={setActive}
                        busy={actioningId === u.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button onClick={() => { clearProfileError(); onClose(); }}
          className="w-full py-2.5 rounded-lg bg-surface-subtle hover:bg-divider text-secondary text-sm font-semibold transition-colors">
          Close
        </button>

        {/* Exports the live services array as service.json so it can be dropped back into src/data/service.json as a fresh offline fallback snapshot. */}
        {isAdmin && onExportServices && (
          <div className="pt-1 text-center">
            <button onClick={onExportServices}
              className="text-[11px] text-faint hover:text-secondary-strong hover:underline transition-colors">
              Export services data for offline use (JSON)<br></br>
              For those who come after: Put the service.json file in "paws-project/src/data"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
