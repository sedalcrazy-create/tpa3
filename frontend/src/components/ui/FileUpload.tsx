import { useRef, useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  previewUrl?: string;
}

export default function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  previewUrl,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreview(previewUrl || null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      {preview && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            onClick={handleClear}
            className="absolute top-0 end-0 bg-red-500 text-white p-0.5 rounded-bl"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <CloudArrowUpIcon className="w-5 h-5" />
        {value ? value.name : 'انتخاب فایل'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
