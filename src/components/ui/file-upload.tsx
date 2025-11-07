import { File as FileIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Context for managing file upload state
type FileUploadContextValue = {
  value: File[];
  onValueChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  onFileReject?: (file: File, message: string) => void;
};

const FileUploadContext = React.createContext<
  FileUploadContextValue | undefined
>(undefined);

function useFileUpload() {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within FileUpload');
  }
  return context;
}

// Main FileUpload component
type FileUploadProps = FileUploadContextValue & {
  children: React.ReactNode;
};

export function FileUpload({
  children,
  value,
  onValueChange,
  accept,
  maxFiles,
  maxSize,
  multiple = true,
  onFileReject,
}: FileUploadProps) {
  return (
    <FileUploadContext.Provider
      value={{
        value,
        onValueChange,
        accept,
        maxFiles,
        maxSize,
        multiple,
        onFileReject,
      }}
    >
      <div className="space-y-4">{children}</div>
    </FileUploadContext.Provider>
  );
}

// FileUploadDropzone - The drag and drop area
type FileUploadDropzoneProps = React.HTMLAttributes<HTMLDivElement>;

export function FileUploadDropzone({
  className,
  children,
  ...props
}: FileUploadDropzoneProps) {
  const { value, onValueChange, accept, maxFiles, maxSize, onFileReject } =
    useFileUpload();
  const [isDragging, setIsDragging] = React.useState(false);

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Check max files
      if (maxFiles && value.length + validFiles.length >= maxFiles) {
        onFileReject?.(
          file,
          `Du kan maximalt ladda upp ${maxFiles} fil${maxFiles > 1 ? 'er' : ''}`,
        );
        break;
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        const sizeMB = Math.round(maxSize / 1024 / 1024);
        onFileReject?.(file, `Filen får max vara ${sizeMB}MB`);
        continue;
      }

      // Check accept types
      if (accept) {
        const acceptTypes = accept.split(',').map((t) => t.trim());
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const mimeType = file.type;

        const isAccepted = acceptTypes.some((type) => {
          if (type.startsWith('.')) {
            return type.toLowerCase() === fileExtension;
          }
          if (type.endsWith('/*')) {
            return mimeType.startsWith(type.replace('/*', ''));
          }
          return type === mimeType;
        });

        if (!isAccepted) {
          onFileReject?.(file, 'Filtypen stöds inte');
          continue;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onValueChange([...value, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <section
      aria-label="Filuppladdningsområde"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'flex flex-col min-h-[120px] items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-4 transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

// FileUploadTrigger - Button to open file picker
type FileUploadTriggerProps = React.HTMLAttributes<HTMLLabelElement> & {
  asChild?: boolean;
  children: React.ReactNode;
};

export function FileUploadTrigger({
  asChild,
  children,
  ...props
}: FileUploadTriggerProps) {
  const {
    onValueChange,
    value,
    accept,
    multiple,
    maxFiles,
    maxSize,
    onFileReject,
  } = useFileUpload();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Check max files
      if (maxFiles && value.length + validFiles.length >= maxFiles) {
        onFileReject?.(
          file,
          `Du kan maximalt ladda upp ${maxFiles} fil${maxFiles > 1 ? 'er' : ''}`,
        );
        break;
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        const sizeMB = Math.round(maxSize / 1024 / 1024);
        onFileReject?.(file, `Filen få max vara ${sizeMB}MB`);
        continue;
      }

      // Check accept types
      if (accept) {
        const acceptTypes = accept.split(',').map((t) => t.trim());
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const mimeType = file.type;

        const isAccepted = acceptTypes.some((type) => {
          if (type.startsWith('.')) {
            return type.toLowerCase() === fileExtension;
          }
          if (type.endsWith('/*')) {
            return mimeType.startsWith(type.replace('/*', ''));
          }
          return type === mimeType;
        });

        if (!isAccepted) {
          onFileReject?.(file, 'Filtypen stöds inte');
          continue;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onValueChange([...value, ...validFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  // If asChild, clone the child and add onClick handler
  if (asChild && React.isValidElement(children)) {
    return (
      <>
        {React.cloneElement(children, {
          onClick: handleClick,
          ...props,
        } as React.HTMLAttributes<HTMLElement>)}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={handleFileChange}
        />
      </>
    );
  }

  return (
    <>
      <label
        {...props}
        htmlFor={inputId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="cursor-pointer"
      >
        {children}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleFileChange}
      />
    </>
  );
}

// FileUploadList - Container for file items
type FileUploadListProps = React.HTMLAttributes<HTMLDivElement>;

export function FileUploadList({
  className,
  children,
  ...props
}: FileUploadListProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

// FileUploadItem context
type FileUploadItemContextValue = {
  file: File;
  onDelete: () => void;
};

const FileUploadItemContext = React.createContext<
  FileUploadItemContextValue | undefined
>(undefined);

function useFileUploadItem() {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error('useFileUploadItem must be used within FileUploadItem');
  }
  return context;
}

// FileUploadItem - Individual file display
type FileUploadItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: File;
};

export function FileUploadItem({
  value: file,
  className,
  children,
  ...props
}: FileUploadItemProps) {
  const { value, onValueChange } = useFileUpload();

  const handleDelete = () => {
    onValueChange(value.filter((f) => f !== file));
  };

  return (
    <FileUploadItemContext.Provider value={{ file, onDelete: handleDelete }}>
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border bg-card p-3',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </FileUploadItemContext.Provider>
  );
}

// FileUploadItemPreview - File icon preview
type FileUploadItemPreviewProps = React.HTMLAttributes<HTMLDivElement>;

export function FileUploadItemPreview({
  className,
  ...props
}: FileUploadItemPreviewProps) {
  const { file } = useFileUploadItem();
  const isPDF = file.type === 'application/pdf';

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-md',
        isPDF ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600',
        className,
      )}
      {...props}
    >
      <FileIcon className="size-5" />
    </div>
  );
}

// FileUploadItemMetadata - File name and size
type FileUploadItemMetadataProps = React.HTMLAttributes<HTMLDivElement>;

export function FileUploadItemMetadata({
  className,
  ...props
}: FileUploadItemMetadataProps) {
  const { file } = useFileUploadItem();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
      <p className="truncate text-sm font-medium">{file.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatFileSize(file.size)}
      </p>
    </div>
  );
}

// FileUploadItemDelete - Delete button
type FileUploadItemDeleteProps = React.HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children?: React.ReactNode;
};

export function FileUploadItemDelete({
  asChild,
  children,
  ...props
}: FileUploadItemDeleteProps) {
  const { onDelete } = useFileUploadItem();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: onDelete,
      ...props,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button type="button" onClick={onDelete} {...props}>
      {children}
    </button>
  );
}
