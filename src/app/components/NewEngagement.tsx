import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Lock, FileText, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Sidebar } from './shared/Sidebar';
import { useAppData } from '../lib/AppProvider';
import { BackButton } from './shared/BackButton';

type UploadStatus = 'idle' | 'uploading' | 'completed' | 'parsing' | 'parsed' | 'failed';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: UploadStatus;
  uploadedAt: string;
}

export default function NewEngagement() {
  const navigate = useNavigate();
  const { createEngagement } = useAppData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [engagementTitle, setEngagementTitle] = useState('');
  const [clientAlias, setClientAlias] = useState('');
  const [problemType, setProblemType] = useState('');
  const [brief, setBrief] = useState('');
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).slice(2, 11),
        name: file.name,
        size: file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
        type: file.name.split('.').pop()?.toUpperCase() || file.type.split('/')[1]?.toUpperCase() || 'FILE',
        status: 'uploading',
        uploadedAt: new Date().toISOString(),
      };

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
    processFiles(files);
    e.target.value = '';
  };

  const isFormValid = engagementTitle && clientAlias && problemType && (brief || uploadedFiles.length > 0);

  const handleCreate = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    const engagement = await createEngagement({
      title: engagementTitle,
      client: clientAlias,
      problemType,
      brief,
      notes,
      uploads: uploadedFiles,
    });
    navigate(`/workspace?id=${engagement.id}`);
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
            <p className="text-sm text-black/60">Start by providing engagement details and your brief</p>
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
                      onChange={(e) => setEngagementTitle(e.target.value)}
                      placeholder="e.g., Market Entry Strategy - Saudi Arabia"
                      className="w-full border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                    />
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
                        onChange={(e) => setClientAlias(e.target.value)}
                        placeholder="e.g., Northstar Retail"
                        className="w-full border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="problem" className="mb-2 block text-sm text-black">
                        Problem Type
                      </label>
                      <select
                        id="problem"
                        value={problemType}
                        onChange={(e) => setProblemType(e.target.value)}
                        className="w-full appearance-none border border-black/10 bg-white py-3 px-4 text-sm text-black transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">Select problem type</option>
                        <option value="market-entry">Market Entry Strategy</option>
                        <option value="digital">Digital Transformation</option>
                        <option value="operations">Operations Optimization</option>
                        <option value="growth">Growth Strategy</option>
                        <option value="cost">Cost Reduction</option>
                        <option value="org">Organization Design</option>
                      </select>
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
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Paste your RFP, client email chain, or opportunity notes here..."
                    rows={12}
                    className="w-full resize-none border border-black/10 bg-white py-4 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
                  />
                </div>
              </section>

              {/* File Upload */}
              <section className="border border-black/10 bg-white p-8">
                <h2
                  className="mb-2 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Upload Files
                </h2>
                <p className="mb-6 text-sm text-black/60">
                  Upload RFP documents, email chains, or supporting materials
                </p>

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

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-black/5 pt-8">
                <Link
                  to="/dashboard"
                  className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                >
                  Save Draft
                </Link>
                <button
                  onClick={handleCreate}
                  disabled={!isFormValid || isSubmitting}
                  className={`px-6 py-3 text-sm transition-all ${
                    isFormValid && !isSubmitting
                      ? 'border border-black bg-black text-white hover:bg-black/90'
                      : 'cursor-not-allowed border border-black/10 bg-black/5 text-black/40'
                  }`}
                >
                  {isSubmitting ? 'Creating Workspace…' : 'Continue to Workspace'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
