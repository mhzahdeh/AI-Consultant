import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Building2, Clock, ArrowRight } from 'lucide-react';
import { useAppData } from '../lib/AppProvider';
import type { InviteDetail } from '../lib/types';

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getInvite, acceptInvite, session } = useAppData();
  const token = searchParams.get('token');
  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invitation token is missing');
      setIsLoading(false);
      return;
    }

    void getInvite(token)
      .then((result) => setInvite(result))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load invitation'))
      .finally(() => setIsLoading(false));
  }, [getInvite, token]);

  const handleJoin = async () => {
    if (!token) return;
    try {
      setIsJoining(true);
      setError('');
      await acceptInvite(token, session?.authenticated ? {} : { fullName, password });
      navigate('/dashboard', { replace: true });
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Unable to accept invitation');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/5 px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 border border-black bg-black" />
            <span className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>
              AI Consultant Copilot
            </span>
          </div>
        </div>
      </header>

      <div className="px-8 py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-12 text-center">
              <h1
                className="mb-3 text-4xl tracking-tight text-black lg:text-5xl"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
              >
                You've been invited
              </h1>
              <p className="text-sm text-black/60">
                Join your team's workspace to collaborate on consulting engagements
              </p>
            </div>

            <div className="mb-8 border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              {isLoading ? (
                <div className="text-sm text-black/60">Loading invitation…</div>
              ) : error ? (
                <div className="border-l-2 border-black/20 bg-black/[0.02] p-4 text-sm text-black/70">{error}</div>
              ) : invite ? (
                <>
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-black/10 bg-black/[0.02]">
                      <Building2 className="h-8 w-8 text-black/60" />
                    </div>
                    <h2
                      className="mb-2 text-2xl tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      {invite.organizationName}
                    </h2>
                    <p className="text-sm text-black/60">
                      {invite.organizationPlan} Plan
                    </p>
                  </div>

                  <div className="mb-8 grid gap-6 md:grid-cols-2">
                    <div className="border border-black/10 bg-white p-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
                        Invited by
                      </div>
                      <div className="text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        {invite.invitedBy}
                      </div>
                      <div className="text-xs text-black/60">{invite.invitedByEmail}</div>
                    </div>

                    <div className="border border-black/10 bg-white p-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
                        Your Role
                      </div>
                      <div className="text-sm capitalize text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        {invite.role}
                      </div>
                      <div className="text-xs text-black/60">Access is scoped to this workspace</div>
                    </div>
                  </div>

                  <div className="mb-8 border-l-2 border-black/10 bg-black/[0.01] p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                      <div className="text-xs leading-relaxed text-black/70">
                        Invitation expires {invite.expiresIn}
                      </div>
                    </div>
                  </div>

                  {!session?.authenticated && (
                    <div className="mb-8 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm text-black">Full name</label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black">Create password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                          placeholder="At least 8 characters"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => void handleJoin()}
                      disabled={isJoining}
                      className="flex w-full items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90 disabled:opacity-60"
                    >
                      {isJoining ? 'Joining…' : 'Join Workspace'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {!session?.authenticated && (
                      <Link
                        to="/login"
                        className="block w-full border border-black/10 bg-white px-6 py-3 text-center text-sm text-black transition-all hover:border-black/20"
                      >
                        Sign in with another account
                      </Link>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
