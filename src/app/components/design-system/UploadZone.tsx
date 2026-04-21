import { Upload } from 'lucide-react';
import { useState } from 'react';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);

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
    console.log('Files dropped:', e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`cursor-pointer border-2 border-dashed transition-colors ${
        isDragging ? 'border-black bg-black/[0.02]' : 'border-black/10 bg-white hover:border-black/20'
      } p-12 text-center`}
    >
      <Upload className="mx-auto mb-4 h-8 w-8 text-black/40" />
      <p className="mb-1 text-sm text-black">Drop your RFP or brief here</p>
      <p className="text-xs text-black/40">or click to browse</p>
    </div>
  );
}
