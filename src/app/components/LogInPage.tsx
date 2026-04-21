import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { BackButton } from './shared/BackButton';
import { useAppData } from '../lib/AppProvider';

export default function LogInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logIn } = useAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    setFormError('');

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        await logIn(email, password);
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from || '/dashboard', { replace: true });
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to log in');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Back to home */}
      <div className="absolute left-6 top-6">
        <BackButton fallbackTo="/" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 border border-black bg-black" />
            <h1
              className="mb-2 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-black/60">
              Log in to access your consulting workspace
            </p>
          </div>

          {/* Form Card */}
            <div className="border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="border-l-2 border-black/20 bg-black/[0.02] p-3 text-xs text-black/70">
                  {formError}
                </div>
              )}
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-black">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full border ${errors.email ? 'border-black' : 'border-black/10'} bg-white py-3 pl-10 pr-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-black/60">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm text-black">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full border ${errors.password ? 'border-black' : 'border-black/10'} bg-white py-3 pl-10 pr-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-black/60">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-black bg-black py-3 text-sm text-white transition-all hover:bg-black/90"
              >
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-black/40">or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                className="w-full border border-black/10 bg-white py-3 text-sm text-black transition-all hover:border-black/20 hover:bg-black/[0.01]"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </div>
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-black/60">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black underline decoration-black/20 transition-colors hover:decoration-black">
              Create one
            </Link>
          </p>

          {/* Invite Notice */}
          <div className="mt-8 border border-black/5 bg-black/[0.01] p-4 text-center">
            <p className="text-xs leading-relaxed text-black/60">
              Demo owner login: `sarah@northstar-advisory.com` / `ChangeMe123!`
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
