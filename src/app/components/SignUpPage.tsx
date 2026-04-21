import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!organization) {
      newErrors.organization = 'Organization name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', { email, password, organization });
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
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
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
              Create your account
            </h1>
            <p className="text-sm text-black/60">
              Start turning briefs into structured consulting output
            </p>
          </div>

          {/* Form Card */}
          <div className="border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization */}
              <div>
                <label htmlFor="organization" className="mb-2 block text-sm text-black">
                  Organization name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Acme Consulting"
                    className={`w-full border ${errors.organization ? 'border-black' : 'border-black/10'} bg-white py-3 pl-10 pr-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none`}
                  />
                </div>
                {errors.organization && (
                  <p className="mt-1.5 text-xs text-black/60">{errors.organization}</p>
                )}
              </div>

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
                <label htmlFor="password" className="mb-2 block text-sm text-black">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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
                className="w-full border border-black bg-black py-3 text-sm text-white transition-all hover:bg-black/90"
              >
                Create account
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

              {/* Google Sign Up */}
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

            {/* Privacy Notice */}
            <div className="mt-6 border-t border-black/5 pt-6">
              <p className="text-xs leading-relaxed text-black/50">
                By creating an account, you confirm that your data is private to your organization and will not be used to train shared public models.
              </p>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-black/60">
            Already have an account?{' '}
            <Link to="/login" className="text-black underline decoration-black/20 transition-colors hover:decoration-black">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
