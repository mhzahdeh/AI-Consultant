import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Lock, FileText, X, CheckCircle2, Loader2, AlertCircle, Search, ExternalLink, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Sidebar } from './shared/Sidebar';
import { useAppData } from '../lib/AppProvider';
import { BackButton } from './shared/BackButton';
import type { UploadDraft, VaultCase } from '../lib/types';

type UploadStatus = 'idle' | 'uploading' | 'completed' | 'parsing' | 'parsed' | 'failed';

type UploadedFile = UploadDraft & { status: UploadStatus };

const PROBLEM_TYPE_OPTIONS = [
  { value: 'Market Entry Strategy', label: 'Market Entry Strategy' },
  { value: 'Digital Transformation', label: 'Digital Transformation' },
  { value: 'Operations Optimization', label: 'Operations Optimization' },
  { value: 'Growth Strategy', label: 'Growth Strategy' },
  { value: 'Cost Reduction', label: 'Cost Reduction' },
  { value: 'Organization Design', label: 'Organization Design' },
];

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export default function NewEngagement() {
  const navigate = useNavigate();
  const { createEngagement, listVaultCases } = useAppData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [engagementTitle, setEngagementTitle] = useState('');
  const [clientAlias, setClientAlias] = useState('');
  const [problemType, setProblemType] = useState('');
  const [brief, setBrief] = useState('');
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [caseQuery, setCaseQuery] = useState('');
  const [vaultCases, setVaultCases] = useState<VaultCase[]>([]);
  const [selectedVaultCaseIds, setSelectedVaultCaseIds] = useState<string[]>([]);
  const [isLoadingVaultCases, setIsLoadingVaultCases] = useState(false);
  const [vaultCaseError, setVaultCaseError] = useState('');
  const [sourceFirmFilter, setSourceFirmFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [showInternalOnly, setShowInternalOnly] = useState(false);
  const [showCaseLibrary, setShowCaseLibrary] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRetry = (id: string) => {
    setUploadedFiles(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f)
    );

    setTimeout(() => {
      setUploadedFiles(prev =>
        prev.map(f => f.id === id ? { ...f, status: 'parsed' } : f)
      );
    }, 2000);
  };

  const processFiles = async (files: File[]) => {
    const nextFiles = await Promise.all(files.map(async (file) => {
      const contentBase64 = await fileToBase64(file);
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
        type: file.name.split('.').pop()?.toUpperCase() || file.type.split('/')[1]?.toUpperCase() || 'FILE',
        mimeType: file.type || 'application/octet-stream',
        contentBase64,
        status: 'uploading',
        uploadedAt: new Date().toISOString(),
      };
      return newFile;
    }));

    nextFiles.forEach((newFile) => {
      setUploadedFiles((prev) => [...prev, newFile]);

      window.setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, status: 'completed' } : f))
        );

        window.setTimeout(() => {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === newFile.id ? { ...f, status: 'parsing' } : f))
          );

          window.setTimeout(() => {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === newFile.id ? { ...f, status: 'parsed' } : f))
            );
          }, 900);
        }, 350);
      }, 600);
    });
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    void processFiles(files);
    e.target.value = '';
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoadingVaultCases(true);
      setVaultCaseError('');
      void listVaultCases({
        query: caseQuery,
        title: engagementTitle,
        client: clientAlias,
        brief,
        problemType,
        industry: industryFilter,
        capability: capabilityFilter,
        sourceFirm: sourceFirmFilter,
        limit: 8,
      })
        .then((cases) => setVaultCases(cases))
        .catch((error) => {
          setVaultCaseError(error instanceof Error ? error.message : 'Unable to load case library');
        })
        .finally(() => setIsLoadingVaultCases(false));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [brief, capabilityFilter, caseQuery, clientAlias, engagementTitle, industryFilter, listVaultCases, problemType, sourceFirmFilter]);

  const toggleVaultCase = (caseId: string) => {
    setSelectedVaultCaseIds((prev) => (prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]));
  };

  const clearCaseFilters = () => {
    setCaseQuery('');
    setSourceFirmFilter('');
    setIndustryFilter('');
    setCapabilityFilter('');
    setShowSelectedOnly(false);
    setShowInternalOnly(false);
  };

  const filteredVaultCases = vaultCases.filter((vaultCase) => {
    if (showSelectedOnly && !selectedVaultCaseIds.includes(vaultCase.id)) return false;
    if (showInternalOnly && !vaultCase.isInternal) return false;
    return true;
  });

  const isFormValid = engagementTitle && clientAlias && problemType && (brief || uploadedFiles.length > 0);
  const readyFileCount = uploadedFiles.filter((file) => file.status === 'parsed').length;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!engagementTitle.trim()) nextErrors.engagementTitle = 'Add a clear engagement title.';
    if (!clientAlias.trim()) nextErrors.clientAlias = 'Add the client name.';
    if (!problemType.trim()) nextErrors.problemType = 'Choose the engagement type.';
    if (!brief.trim() && uploadedFiles.length === 0) {
      nextErrors.brief = 'Add a working brief or upload at least one file.';
    } else if (brief.trim() && brief.trim().length < 80 && uploadedFiles.length === 0) {
      nextErrors.brief = 'The brief is too thin on its own. Add more detail or upload source material.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async () => {
    if (isSubmitting) return;
    if (!validateForm()) {
      setFormError('Complete the missing inputs before creating the workspace.');
      return;
    }
    setFormError('');
    try {
      setIsSubmitting(true);
      const engagement = await createEngagement({
        title: engagementTitle,
        client: clientAlias,
        problemType,
        brief,
        notes,
        uploads: uploadedFiles.map((file) => {
          const { status, ...upload } = file;
          void status;
          return upload;
        }),
        selectedVaultCaseIds,
      });
      navigate(`/workspace?id=${engagement.id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create engagement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="engagements" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/dashboard" />
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Create New Engagement
            </h1>
            <p className="text-sm text-black/60">Define the engagement, add source context, optionally choose analog cases, then open the workspace.</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {formError && (
                <div className="border-l-2 border-black/20 bg-black/[0.02] p-4 text-sm text-black/70">
                  {formError}
                </div>
              )}

              <section className="border border-black/10 bg-black/[0.015] p-8">
                <div className="mb-4 text-xs uppercase tracking-[0.2em] text-black/40">MVP Path</div>
                <h2
                  className="mb-3 text-2xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Create one engagement, add the source material, then open the workspace.
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border border-black/10 bg-white p-4">
                    <div className="mb-1 text-xs text-black/40">Step 1</div>
                    <div className="text-sm text-black">Define the engagement title, client, and problem type.</div>
                  </div>
                  <div className="border border-black/10 bg-white p-4">
                    <div className="mb-1 text-xs text-black/40">Step 2</div>
                    <div className="text-sm text-black">Paste the brief or upload the RFP and supporting materials.</div>
                  </div>
                  <div className="border border-black/10 bg-white p-4">
                    <div className="mb-1 text-xs text-black/40">Optional</div>
                    <div className="text-sm text-black">Add analog cases if you want to influence the first draft.</div>
                  </div>
                </div>
              </section>
              {/* Basic Information */}
              <section className="border border-black/10 bg-white p-8">
                <h2
                  className="mb-6 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Engagement Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="mb-2 block text-sm text-black">
                      Engagement Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={engagementTitle}
                      onChange={(e) => {
                        setEngagementTitle(e.target.value);
                        if (fieldErrors.engagementTitle) setFieldErrors((prev) => ({ ...prev, engagementTitle: '' }));
                      }}
                      placeholder="e.g., Market Entry Strategy - Saudi Arabia"
                      className="w-full border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                    />
                    {fieldErrors.engagementTitle ? <div className="mt-2 text-xs text-red-700">{fieldErrors.engagementTitle}</div> : null}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="client" className="mb-2 block text-sm text-black">
                        Client Alias
                      </label>
                      <input
                        id="client"
                        type="text"
                        value={clientAlias}
                        onChange={(e) => {
                          setClientAlias(e.target.value);
                          if (fieldErrors.clientAlias) setFieldErrors((prev) => ({ ...prev, clientAlias: '' }));
                        }}
                        placeholder="e.g., Northstar Retail"
                        className="w-full border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                      />
                      {fieldErrors.clientAlias ? <div className="mt-2 text-xs text-red-700">{fieldErrors.clientAlias}</div> : null}
                    </div>

                    <div>
                      <label htmlFor="problem" className="mb-2 block text-sm text-black">
                        Problem Type
                      </label>
                      <select
                        id="problem"
                        value={problemType}
                        onChange={(e) => {
                          setProblemType(e.target.value);
                          if (fieldErrors.problemType) setFieldErrors((prev) => ({ ...prev, problemType: '' }));
                        }}
                        className="w-full appearance-none border border-black/10 bg-white py-3 px-4 text-sm text-black transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">Select problem type</option>
                        {PROBLEM_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.problemType ? <div className="mt-2 text-xs text-red-700">{fieldErrors.problemType}</div> : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="mb-2 block text-sm text-black">
                      Optional Notes
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional context or notes..."
                      rows={3}
                      className="w-full resize-none border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Brief Input */}
              <section className="border border-black/10 bg-white p-8">
                <h2
                  className="mb-2 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Brief or RFP Content
                </h2>
                <p className="mb-6 text-sm text-black/60">
                  Paste your brief directly or upload files below
                </p>

                <div>
                  <label htmlFor="brief" className="mb-2 block text-sm text-black">
                    Paste Brief
                  </label>
                  <textarea
                    id="brief"
                    value={brief}
                    onChange={(e) => {
                      setBrief(e.target.value);
                      if (fieldErrors.brief) setFieldErrors((prev) => ({ ...prev, brief: '' }));
                    }}
                    placeholder="Paste your RFP, client email chain, or opportunity notes here..."
                    rows={12}
                    className="w-full resize-none border border-black/10 bg-white py-4 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                  />
                  {fieldErrors.brief ? <div className="mt-2 text-xs text-red-700">{fieldErrors.brief}</div> : null}
                </div>
              </section>

              {/* File Upload */}
              <section className="border border-black/10 bg-white p-8">
                <div className="mb-6 flex items-start justify-between gap-6">
                  <div>
                    <h2
                      className="mb-2 text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Upload Files
                    </h2>
                    <p className="text-sm text-black/60">
                      Add RFP documents, email chains, or supporting materials if the brief alone is not enough.
                    </p>
                  </div>
                  <div className="border border-black/10 bg-black/[0.02] px-4 py-3 text-right">
                    <div className="text-xs uppercase tracking-wider text-black/40">Selected</div>
                    <div className="text-2xl tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
                      {readyFileCount}
                    </div>
                  </div>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseFiles}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBrowseFiles();
                    }
                  }}
                  className={`cursor-pointer border-2 border-dashed transition-colors ${
                    isDragging ? 'border-black bg-black/[0.02]' : 'border-black/10 bg-white hover:border-black/20'
                  } p-12 text-center`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileSelection}
                  />
                  <Upload className="mx-auto mb-4 h-8 w-8 text-black/40" />
                  <p className="mb-1 text-sm text-black">Drop your files here</p>
                  <p className="text-xs text-black/40">or click to browse • PDF, DOC, TXT up to 25MB</p>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
                      >
                        <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />

                        <div className="flex-1">
                          <div className="mb-1 text-sm text-black">{file.name}</div>
                          <div className="text-xs text-black/40">
                            {file.type} • {file.size}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3">
                          {file.status === 'uploading' && (
                            <div className="flex items-center gap-2 text-xs text-black/60">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <div className="flex items-center gap-2 text-xs text-black/60">
                              <CheckCircle2 className="h-4 w-4" />
                              Uploaded
                            </div>
                          )}
                          {file.status === 'parsing' && (
                            <div className="flex items-center gap-2 text-xs text-black/60">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Parsing...
                            </div>
                          )}
                          {file.status === 'parsed' && (
                            <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
                              <CheckCircle2 className="h-3 w-3" />
                              Ready
                            </span>
                          )}
                          {file.status === 'failed' && (
                            <>
                              <span className="inline-flex items-center gap-1.5 border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                                <AlertCircle className="h-3 w-3" />
                                Failed
                              </span>
                              <button
                                onClick={() => handleRetry(file.id)}
                                className="text-xs text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                              >
                                Retry
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-black/40 transition-colors hover:text-black"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="mt-6 border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                    <div className="text-xs leading-relaxed text-black/60">
                      Files remain private to your organization • Not used to train public models • You can delete uploads anytime • We recommend anonymized uploads for sensitive material
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-black/10 bg-white p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2
                      className="mb-2 text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Optional Analog Cases
                    </h2>
                    <p className="text-sm text-black/60">
                      Skip this if you want the app to recommend cases automatically. Open it only if you want tighter control over the first draft.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCaseLibrary((prev) => !prev)}
                    className={`inline-flex items-center gap-2 border px-4 py-2 text-sm transition-all ${
                      showCaseLibrary ? 'border-black bg-black text-white hover:bg-black/90' : 'border-black/10 bg-white text-black hover:border-black/20'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    {showCaseLibrary ? 'Hide Case Library' : 'Open Case Library'}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-black/50">
                  <span>{selectedVaultCaseIds.length} case{selectedVaultCaseIds.length === 1 ? '' : 's'} selected</span>
                  <span>Auto-recommendation runs even if you leave this closed</span>
                </div>

                {showCaseLibrary ? (
                  <div className="mt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                      <label className="flex items-center gap-3 border border-black/10 bg-white px-4 py-3 focus-within:border-black">
                        <Search className="h-4 w-4 text-black/40" />
                        <input
                          type="text"
                          value={caseQuery}
                          onChange={(e) => setCaseQuery(e.target.value)}
                          placeholder="Search by industry, source, function, or problem..."
                          className="w-full bg-transparent text-sm text-black placeholder-black/40 outline-none"
                        />
                      </label>
                      <div className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-sm text-black/60">
                        <span>Context-aware suggestions</span>
                        <Sparkles className="h-4 w-4 text-black/50" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <select
                        value={sourceFirmFilter}
                        onChange={(e) => setSourceFirmFilter(e.target.value)}
                        className="w-full appearance-none border border-black/10 bg-white px-4 py-3 text-sm text-black transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">All sources</option>
                        <option value="McKinsey">McKinsey</option>
                        <option value="Bain">Bain</option>
                        <option value="BCG">BCG</option>
                        <option value="Internal Vault">Internal Vault</option>
                      </select>
                      <select
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        className="w-full appearance-none border border-black/10 bg-white px-4 py-3 text-sm text-black transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">All industries</option>
                        <option value="Banking">Banking</option>
                        <option value="Consumer goods">Consumer goods</option>
                        <option value="Consumer packaged goods">Consumer packaged goods</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Industrial manufacturing">Industrial manufacturing</option>
                        <option value="Industrials">Industrials</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Nonprofit">Nonprofit</option>
                        <option value="Paper and packaging">Paper and packaging</option>
                        <option value="Real estate">Real estate</option>
                        <option value="Retail">Retail</option>
                        <option value="Technology">Technology</option>
                        <option value="Transportation">Transportation</option>
                      </select>
                      <select
                        value={capabilityFilter}
                        onChange={(e) => setCapabilityFilter(e.target.value)}
                        className="w-full appearance-none border border-black/10 bg-white px-4 py-3 text-sm text-black transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">All capabilities</option>
                        <option value="AI">AI</option>
                        <option value="Advanced analytics">Advanced analytics</option>
                        <option value="Behavior change">Behavior change</option>
                        <option value="Computer vision and AI">Computer vision and AI</option>
                        <option value="Decarbonization strategy">Decarbonization strategy</option>
                        <option value="Digital factory">Digital factory</option>
                        <option value="Digital operations">Digital operations</option>
                        <option value="Generative AI">Generative AI</option>
                        <option value="Leadership transformation">Leadership transformation</option>
                        <option value="Operating model">Operating model</option>
                        <option value="Portfolio focus">Portfolio focus</option>
                        <option value="Public-private collaboration">Public-private collaboration</option>
                        <option value="Sales transformation">Sales transformation</option>
                        <option value="Service transformation">Service transformation</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowSelectedOnly((prev) => !prev)}
                        className={`border px-4 py-3 text-sm transition-all ${
                          showSelectedOnly
                            ? 'border-black bg-black text-white hover:bg-black/90'
                            : 'border-black/10 bg-white text-black hover:border-black/20'
                        }`}
                      >
                        {showSelectedOnly ? 'Showing Selected' : 'Show Selected Only'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInternalOnly((prev) => !prev)}
                        className={`border px-4 py-3 text-sm transition-all ${
                          showInternalOnly
                            ? 'border-black bg-black text-white hover:bg-black/90'
                            : 'border-black/10 bg-white text-black hover:border-black/20'
                        }`}
                      >
                        {showInternalOnly ? 'Internal Only' : 'Show Internal Cases'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-black/50">
                      <span>{filteredVaultCases.length} cases shown</span>
                      {(caseQuery || sourceFirmFilter || industryFilter || capabilityFilter || showSelectedOnly || showInternalOnly) && (
                        <button
                          type="button"
                          onClick={clearCaseFilters}
                          className="border border-black/10 px-3 py-1 text-black transition-colors hover:border-black/20"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {vaultCaseError && (
                      <div className="border-l-2 border-black/20 bg-black/[0.02] p-4 text-sm text-black/70">
                        {vaultCaseError}
                      </div>
                    )}

                    <div className="space-y-4">
                      {isLoadingVaultCases ? (
                        <div className="flex items-center justify-center border border-black/10 bg-black/[0.01] px-6 py-10 text-sm text-black/60">
                          <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                          Loading case recommendations...
                        </div>
                      ) : filteredVaultCases.length ? (
                        filteredVaultCases.map((vaultCase) => {
                          const isSelected = selectedVaultCaseIds.includes(vaultCase.id);
                          return (
                            <div
                              key={vaultCase.id}
                              className={`border p-6 transition-all ${
                                isSelected
                                  ? 'border-black bg-black/[0.02]'
                                  : 'border-black/10 bg-white hover:border-black/20'
                              }`}
                            >
                              <div className="mb-4 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center bg-black px-3 py-1 text-xs text-white">
                                      {vaultCase.sourceFirm}
                                    </span>
                                    {vaultCase.isInternal && (
                                      <span className="inline-flex items-center border border-black bg-black px-3 py-1 text-xs text-white">
                                        Internal
                                      </span>
                                    )}
                                    <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black">
                                      {vaultCase.problemType}
                                    </span>
                                    <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">
                                      {vaultCase.industry}
                                    </span>
                                  </div>
                                  <h3
                                    className="mb-2 text-base tracking-tight text-black"
                                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                                  >
                                    {vaultCase.title}
                                  </h3>
                                  <p className="text-sm leading-relaxed text-black/70">{vaultCase.summary}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleVaultCase(vaultCase.id)}
                                  className={`shrink-0 border px-4 py-2 text-sm transition-all ${
                                    isSelected
                                      ? 'border-black bg-black text-white hover:bg-black/90'
                                      : 'border-black/10 bg-white text-black hover:border-black/20'
                                  }`}
                                >
                                  {isSelected ? 'Selected' : 'Select Case'}
                                </button>
                              </div>

                              <div className="mb-4 flex flex-wrap gap-2">
                                {vaultCase.tags.slice(0, 5).map((tag) => (
                                  <span key={tag} className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-4 text-xs text-black/50">
                                <div className="flex flex-wrap items-center gap-4">
                                  <span>{vaultCase.businessFunction}</span>
                                  <span>{vaultCase.capability}</span>
                                  <span>{vaultCase.region}</span>
                                  {vaultCase.linkedEngagementId && <span>Linked to prior engagement</span>}
                                  {typeof vaultCase.matchScore === 'number' && <span>Match score {vaultCase.matchScore}</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                  {vaultCase.linkedEngagementId && (
                                    <Link
                                      to={`/workspace?id=${vaultCase.linkedEngagementId}`}
                                      className="inline-flex items-center gap-1 text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                                    >
                                      Source engagement
                                    </Link>
                                  )}
                                  {vaultCase.sourceUrl ? (
                                    <a
                                      href={vaultCase.sourceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                                    >
                                      Source
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="border border-black/10 bg-black/[0.01] px-6 py-10 text-sm text-black/60">
                          No curated cases matched the current filters. Clear filters or add more brief context for better recommendations.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </section>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-black/5 pt-8">
                <Link
                  to="/dashboard"
                  className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                >
                  Save Draft
                </Link>
                <div className="text-right">
                  <div className="mb-2 text-xs text-black/45">
                    {readyFileCount > 0
                      ? `${readyFileCount} source file${readyFileCount === 1 ? '' : 's'} prepared`
                      : brief.trim()
                      ? 'Brief-only workflow'
                      : 'Add context to continue'}
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!isFormValid || isSubmitting}
                    className={`px-6 py-3 text-sm transition-all ${
                      isFormValid && !isSubmitting
                        ? 'border border-black bg-black text-white hover:bg-black/90'
                        : 'cursor-not-allowed border border-black/10 bg-black/5 text-black/40'
                    }`}
                  >
                    {isSubmitting
                      ? 'Creating Workspace…'
                      : selectedVaultCaseIds.length
                      ? `Continue with ${selectedVaultCaseIds.length} Selected Case${selectedVaultCaseIds.length === 1 ? '' : 's'}`
                      : 'Continue to Workspace'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
