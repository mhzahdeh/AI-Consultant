import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Edit3, Upload, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Sidebar } from './shared/Sidebar';

export default function BriefReview() {
  const [isEditing, setIsEditing] = useState(false);
  const [brief, setBrief] = useState(
    'Client seeks to assess expansion opportunity into Saudi Arabia retail market. Key questions include: market entry timing, recommended entry mode (greenfield vs acquisition), regulatory considerations, and competitive landscape assessment. Expected timeline: 8-week engagement with deliverables including market sizing, competitor analysis, go-to-market strategy, and implementation roadmap.'
  );

  const engagementData = {
    title: 'Market Entry Strategy - Saudi Arabia',
    client: 'Northstar Retail',
    problemType: 'Market Entry Strategy',
  };

  const uploadedFiles = [
    {
      id: 1,
      name: 'RFP_Northstar_Saudi_Expansion.pdf',
      type: 'PDF',
      size: '2.4 MB',
      status: 'parsed',
      extractedPages: 12,
    },
    {
      id: 2,
      name: 'Client_Email_Chain.docx',
      type: 'DOC',
      size: '156 KB',
      status: 'parsed',
      extractedPages: 4,
    },
  ];

  const parsingSummary = {
    totalPages: 16,
    extractedSections: 8,
    detectedTopics: ['Market Entry', 'Regulatory Framework', 'Competition', 'Timeline'],
    confidence: 'High',
  };

  const allReady = uploadedFiles.every(f => f.status === 'parsed') && brief.length > 0;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="engagements" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/new-engagement"
              className="inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </Link>
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Review Brief
            </h1>
            <p className="text-sm text-black/60">Review extracted content before generating outputs</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Engagement Summary */}
              <section className="border border-black/10 bg-white p-8">
                <h2
                  className="mb-6 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Engagement Overview
                </h2>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-xs text-black/40">Title</div>
                    <div className="text-sm text-black">{engagementData.title}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Client</div>
                    <div className="text-sm text-black">{engagementData.client}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Problem Type</div>
                    <div className="text-sm text-black">{engagementData.problemType}</div>
                  </div>
                </div>
              </section>

              {/* Canonical Brief */}
              <section className="border border-black/10 bg-white p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2
                      className="mb-1 text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Canonical Brief
                    </h2>
                    <p className="text-sm text-black/60">This is your source of truth for generation</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
                  >
                    <Edit3 className="h-4 w-4" />
                    {isEditing ? 'Save' : 'Edit Brief'}
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={8}
                    className="w-full resize-none border border-black/10 bg-white py-4 px-4 text-sm text-black transition-colors focus:border-black focus:outline-none"
                  />
                ) : (
                  <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
                    <p className="text-sm leading-relaxed text-black">{brief}</p>
                  </div>
                )}
              </section>

              {/* Uploaded Files */}
              <section className="border border-black/10 bg-white p-8">
                <h2
                  className="mb-6 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Source Files
                </h2>

                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 border border-black/10 bg-white p-4"
                    >
                      <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />

                      <div className="flex-1">
                        <div className="mb-1 text-sm text-black">{file.name}</div>
                        <div className="text-xs text-black/40">
                          {file.type} • {file.size} • {file.extractedPages} pages extracted
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        Parsed
                      </span>

                      <button className="text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                        Preview
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20">
                    <Upload className="h-4 w-4" />
                    Add More Files
                  </button>
                </div>
              </section>

              {/* Parsing Summary */}
              <section className="border border-black/10 bg-white p-8">
                <h2
                  className="mb-6 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Parsing Summary
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-1 text-xs text-black/40">Total Pages</div>
                        <div className="text-2xl tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
                          {parsingSummary.totalPages}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-black/40">Sections Found</div>
                        <div className="text-2xl tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
                          {parsingSummary.extractedSections}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-black/40">Parse Confidence</div>
                      <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        {parsingSummary.confidence}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs text-black/40">Detected Topics</div>
                    <div className="flex flex-wrap gap-2">
                      {parsingSummary.detectedTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Readiness Indicator */}
              <section className="border border-black/10 bg-white p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {allReady ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-black" />
                        <div>
                          <h3
                            className="mb-1 text-base text-black"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                          >
                            Ready to generate
                          </h3>
                          <p className="text-sm text-black/60">
                            All files parsed successfully and brief is complete
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-6 w-6 text-black/40" />
                        <div>
                          <h3
                            className="mb-1 text-base text-black/60"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                          >
                            Waiting for files
                          </h3>
                          <p className="text-sm text-black/40">
                            Some files are still processing
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-black/5 pt-8">
                <Link
                  to="/new-engagement"
                  className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                >
                  Back to Edit
                </Link>
                <button
                  disabled={!allReady}
                  className={`inline-flex items-center gap-2 border px-6 py-3 text-sm transition-all ${
                    allReady
                      ? 'border-black bg-black text-white hover:bg-black/90'
                      : 'cursor-not-allowed border-black/10 bg-black/5 text-black/40'
                  }`}
                >
                  Continue to Match Cases
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
