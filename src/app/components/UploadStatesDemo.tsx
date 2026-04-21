import { Link } from 'react-router';
import { ArrowLeft, FileText, X, CheckCircle2, Loader2, AlertCircle, Upload } from 'lucide-react';
import { Sidebar } from './shared/Sidebar';

export default function UploadStatesDemo() {
  const uploadStates = [
    {
      name: 'Idle / Empty',
      description: 'No files uploaded yet',
      component: (
        <div className="cursor-pointer border-2 border-dashed border-black/10 bg-white p-12 text-center transition-colors hover:border-black/20">
          <Upload className="mx-auto mb-4 h-8 w-8 text-black/40" />
          <p className="mb-1 text-sm text-black">Drop your files here</p>
          <p className="text-xs text-black/40">or click to browse • PDF, DOC, TXT up to 25MB</p>
        </div>
      ),
    },
    {
      name: 'Dragging Over',
      description: 'User is dragging files over the drop zone',
      component: (
        <div className="cursor-pointer border-2 border-dashed border-black bg-black/[0.02] p-12 text-center">
          <Upload className="mx-auto mb-4 h-8 w-8 text-black/40" />
          <p className="mb-1 text-sm text-black">Drop your files here</p>
          <p className="text-xs text-black/40">or click to browse • PDF, DOC, TXT up to 25MB</p>
        </div>
      ),
    },
    {
      name: 'Uploading',
      description: 'File is being uploaded to server',
      component: (
        <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
          <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
          <div className="flex-1">
            <div className="mb-1 text-sm text-black">Market_Analysis_Report.pdf</div>
            <div className="text-xs text-black/40">PDF • 2.4 MB</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-black/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
          <button className="text-black/40 transition-colors hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      name: 'Upload Complete',
      description: 'File uploaded successfully, ready for parsing',
      component: (
        <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
          <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
          <div className="flex-1">
            <div className="mb-1 text-sm text-black">Market_Analysis_Report.pdf</div>
            <div className="text-xs text-black/40">PDF • 2.4 MB</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-black/60">
            <CheckCircle2 className="h-4 w-4" />
            Uploaded
          </div>
          <button className="text-black/40 transition-colors hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      name: 'Parsing',
      description: 'File content is being extracted and analyzed',
      component: (
        <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
          <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
          <div className="flex-1">
            <div className="mb-1 text-sm text-black">Market_Analysis_Report.pdf</div>
            <div className="text-xs text-black/40">PDF • 2.4 MB</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-black/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing...
          </div>
          <button className="text-black/40 transition-colors hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      name: 'Parse Complete / Ready',
      description: 'File successfully parsed and ready for use',
      component: (
        <div className="flex items-center gap-4 border border-black/10 bg-white p-4 transition-all hover:border-black/20">
          <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
          <div className="flex-1">
            <div className="mb-1 text-sm text-black">Market_Analysis_Report.pdf</div>
            <div className="text-xs text-black/40">PDF • 2.4 MB • 12 pages extracted</div>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </span>
          <button className="text-black/40 transition-colors hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      name: 'Parse Failed',
      description: 'File could not be parsed, with retry option',
      component: (
        <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
          <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
          <div className="flex-1">
            <div className="mb-1 text-sm text-black">Corrupted_Document.pdf</div>
            <div className="text-xs text-black/40">PDF • 1.2 MB</div>
          </div>
          <span className="inline-flex items-center gap-1.5 border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
          <button className="text-xs text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
            Retry
          </button>
          <button className="text-black/40 transition-colors hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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
              Back
            </Link>
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Upload States Reference
            </h1>
            <p className="text-sm text-black/60">All upload and parsing state variations</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-4xl space-y-12">
            {uploadStates.map((state, i) => (
              <section key={i}>
                <h2
                  className="mb-2 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {state.name}
                </h2>
                <p className="mb-4 text-sm text-black/60">{state.description}</p>
                <div>{state.component}</div>
              </section>
            ))}

            {/* Combined Example */}
            <section className="border-t border-black/5 pt-12">
              <h2
                className="mb-6 text-lg tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Multiple Files Example
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-4 border border-black/10 bg-white p-4 transition-all hover:border-black/20">
                  <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-black">RFP_Document.pdf</div>
                    <div className="text-xs text-black/40">PDF • 2.4 MB • 12 pages extracted</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    Ready
                  </span>
                  <button className="text-black/40 transition-colors hover:text-black">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
                  <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-black">Client_Emails.docx</div>
                    <div className="text-xs text-black/40">DOC • 156 KB</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing...
                  </div>
                  <button className="text-black/40 transition-colors hover:text-black">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
                  <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-black">Background_Research.pdf</div>
                    <div className="text-xs text-black/40">PDF • 3.1 MB</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                    <AlertCircle className="h-3 w-3" />
                    Failed
                  </span>
                  <button className="text-xs text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                    Retry
                  </button>
                  <button className="text-black/40 transition-colors hover:text-black">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
