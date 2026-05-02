import React, {
  ChangeEvent,
  ReactNode,
  useRef,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Upload,
  Video,
  X,
} from "lucide-react";
import { FileUploadPreview } from "../../model/model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  accept: string;
  multiple: boolean;
  id: string;
  icon: ReactNode;
  onFileSelect: (files: FileList) => void;
  onPreviewFileRemove: (file: File) => void;
  uploadProgress?: Record<string, number>;
  required?: boolean;
  hint?: string;
  initialFiles?: { url: string; type: string; id?: string | number }[];
  onRemoveInitialFile?: (
    file: { url: string; type: string; id?: string | number },
    type: "image" | "video"
  ) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function pickIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Video;
  return FileText;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  label,
  accept,
  multiple,
  id,
  icon,
  uploadProgress,
  required = false,
  hint,
  initialFiles = [],
  onRemoveInitialFile,
  onPreviewFileRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<FileUploadPreview[]>([]);
  const [existingFiles, setExistingFiles] = useState(initialFiles);
  const [isDragging, setIsDragging] = useState(false);

  const allowedType = accept.split("/")[0];
  const totalCount = existingFiles.length + previews.length;

  const buildPreviews = useCallback(
    (files: File[]): FileUploadPreview[] =>
      files.map((file, i) => ({
        id: Date.now() + i,
        url: URL.createObjectURL(file),
        type: file.type,
        file,
        uploadProgress: 0,
      })),
    []
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    onFileSelect(files);
    setPreviews(buildPreviews(Array.from(files)));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((f) => f.type.startsWith(allowedType));

    if (validFiles.length === 0) {
      toast.error(`Only ${allowedType} files are allowed in this drop zone.`);
      return;
    }

    const dt = new DataTransfer();
    validFiles.forEach((f) => dt.items.add(f));
    onFileSelect(dt.files);
    setPreviews(buildPreviews(validFiles));
  };

  const handleRemovePreview = (previewId: number) => {
    const target = previews.find((p) => p.id === previewId);
    if (!target) return;
    URL.revokeObjectURL(target.url);
    setPreviews((prev) => prev.filter((p) => p.id !== previewId));
    onPreviewFileRemove?.(target.file as File);
  };

  const handleRemoveExisting = (file: {
    url: string;
    type: string;
    id?: string | number;
  }) => {
    const kind = file.type.startsWith("image/") ? "image" : "video";
    setExistingFiles((prev) => prev.filter((f) => f.url !== file.url));
    onRemoveInitialFile?.(file, kind);
  };

  const triggerFilePicker = () => inputRef.current?.click();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {icon}
        </div>
        <label htmlFor={id} className="cursor-pointer text-sm font-semibold">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
        {totalCount > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {totalCount} file{totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerFilePicker();
          }
        }}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/60"
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            isDragging
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Drop files here" : "Drag & drop or click to browse"}
          </p>
          {hint && (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <input
          ref={inputRef}
          title="filepicker"
          type="file"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="sr-only"
          id={id}
        />
      </div>

      {/* File list */}
      {(existingFiles.length > 0 || previews.length > 0) && (
        <div className="space-y-2">
          {existingFiles.map((file) => (
            <FileRow
              key={file.id || file.url}
              name={file.url.split("/").pop() || "Existing file"}
              type={file.type}
              previewUrl={
                file.type.startsWith("image/") ? file.url : undefined
              }
              progress={100}
              onRemove={() => handleRemoveExisting(file)}
            />
          ))}
          {previews.map((preview) => {
            const progress =
              uploadProgress?.[preview.file.name] ??
              preview.uploadProgress ??
              0;
            return (
              <FileRow
                key={preview.id}
                name={preview.file.name}
                size={preview.file.size}
                type={preview.type}
                previewUrl={
                  preview.type.startsWith("image/") ? preview.url : undefined
                }
                progress={progress}
                onRemove={() => handleRemovePreview(preview.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

function FileRow({
  name,
  size,
  type,
  previewUrl,
  progress,
  onRemove,
}: {
  name: string;
  size?: number;
  type: string;
  previewUrl?: string;
  progress: number;
  onRemove: () => void;
}) {
  const FileTypeIcon = pickIcon(type);
  const complete = progress >= 100;

  return (
    <div className="group relative flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs transition-shadow hover:shadow-md">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileTypeIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {size != null ? formatSize(size) : "—"}
        </p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {complete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${name}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default FileUpload;