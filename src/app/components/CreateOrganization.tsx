import { Link } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, ArrowRight } from 'lucide-react';
import { useAppData } from '../lib/AppProvider';
import { useNavigate } from 'react-router';

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { createOrganization } = useAppData();
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [useCase, setUseCase] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    if (!slug || slug === generateSlug(orgName)) {
      setSlug(generateSlug(name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!orgName) {
      newErrors.orgName = 'Organization name is required';
    }
    if (!slug) {
      newErrors.slug = 'Workspace slug is required';
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    setFormError('');

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        await createOrganization({ name: orgName, slug, useCase, plan: 'Starter' });
        navigate('/dashboard', { replace: true });
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to create organization');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black/5 px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 border border-black bg-black" />
            <span className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>
              AI Consultant Copilot
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title */}
            <div className="mb-12 text-center">
              <h1
                className="mb-3 text-4xl tracking-tight text-black lg:text-5xl"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
              >
                Create your workspace
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-black/60">
                All uploads, generated artifacts, and prior work stay scoped to your organization. Nothing is shared outside your workspace.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left: Form */}
              <div className="lg:col-span-2">
                <div className="border border-black/10 bg-white p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                      <div className="border-l-2 border-black/20 bg-black/[0.02] p-3 text-xs text-black/70">
                        {formError}
                      </div>
                    )}
                    {/* Organization Name */}
                    <div>
                      <label htmlFor="orgName" className="mb-2 block text-sm text-black">
                        Organization Name
                      </label>
                      <input
                        id="orgName"
                        type="text"
                        value={orgName}
                        onChange={(e) => handleOrgNameChange(e.target.value)}
                        placeholder="e.g., Acme Consulting"
                        className={`w-full border ${errors.orgName ? 'border-black' : 'border-black/10'} bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none`}
                      />
                      {errors.orgName && (
                        <p className="mt-1.5 text-xs text-black/60">{errors.orgName}</p>
                      )}
                    </div>

                    {/* Workspace Slug */}
                    <div>
                      <label htmlFor="slug" className="mb-2 block text-sm text-black">
                        Workspace Slug
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-black/40">copilot.ai/</span>
                        <input
                          id="slug"
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="acme-consulting"
                          className={`flex-1 border ${errors.slug ? 'border-black' : 'border-black/10'} bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none`}
                        />
                      </div>
                      {errors.slug ? (
                        <p className="mt-1.5 text-xs text-black/60">{errors.slug}</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-black/40">
                          This will be your workspace URL
                        </p>
                      )}
                    </div>

                    {/* Use Case */}
                    <div>
                      <label htmlFor="useCase" className="mb-2 block text-sm text-black">
                        Use Case (Optional)
                      </label>
                      <select
                        id="useCase"
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        className="w-full appearance-none border border-black/10 bg-white py-3 px-4 text-sm text-black transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">Select your use case</option>
                        <option value="solo">Solo consultant</option>
                        <option value="boutique">Boutique firm (2-20 people)</option>
                        <option value="advisory">Advisory team within larger organization</option>
                      </select>
                      <p className="mt-1.5 text-xs text-black/40">
                        Helps us optimize your experience
                      </p>
                    </div>

                    {/* Privacy Notice */}
                    <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                        <div className="text-xs leading-relaxed text-black/70">
                          Your workspace is completely private. Files, engagements, and vault contents are accessible only to members you explicitly invite. Data is not used to train public models.
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4 border-t border-black/5 pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                      >
                        {isSubmitting ? 'Creating…' : 'Create Organization'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <Link
                        to="/accept-invite"
                        className="text-center text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                      >
                        I've been invited instead
                      </Link>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right: Plan Info */}
              <div>
                <div className="sticky top-8 space-y-4">
                  {/* Current Plan */}
                  <div className="border border-black bg-black/[0.02] p-6">
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className="text-sm text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        Starter
                      </span>
                      <span className="text-xs text-black/60">Your plan</span>
                    </div>
                    <div className="mb-3 text-xs text-black/60">1 user • 100 uploads / month</div>
                    <div className="text-lg text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                      Free
                    </div>
                  </div>

                  {/* Coming Soon */}
                  <div className="border border-black/10 bg-white p-6">
                    <div className="mb-3 text-xs uppercase tracking-wider text-black/40">
                      Coming Soon
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'Solo', price: '$49/mo', desc: '1 user · unlimited vault' },
                        { name: 'Team', price: '$149/mo', desc: 'Up to 10 users · shared vault' },
                        { name: 'Enterprise', price: 'Custom', desc: 'Unlimited seats · custom controls' },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between opacity-50">
                          <div>
                            <div className="text-xs text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{p.name}</div>
                            <div className="text-xs text-black/50">{p.desc}</div>
                          </div>
                          <div className="text-xs text-black/60">{p.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included in Starter */}
                  <div className="border border-black/10 bg-white p-6">
                    <div className="mb-3 text-xs uppercase tracking-wider text-black/40">
                      Included on Starter
                    </div>
                    <ul className="space-y-2 text-xs text-black/70">
                      <li>• Unlimited engagements</li>
                      <li>• Document generation from prior work</li>
                      <li>• Version history</li>
                      <li>• Export to DOCX and PDF</li>
                      <li>• Private organization vault</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
