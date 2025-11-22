// biome-ignore-all lint: file-header: This is a UI component file for file uploads
import { File as FileIcon } from 'lucide-react';
import {
  type ChangeEvent,
  cloneElement,
  createContext,
  type DragEvent,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
  useId,
  useRef,
  useState,
} from 'react';
import { validateFiles } from '@/lib/file-validation';
import { cn } from '@/lib/utils';

type FileUploadContextValue = {
  value: File[];
  onValueChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  onFileReject?: (file: File, message: string) => void;
};

const FileUploadContext = createContext<FileUploadContextValue | undefined>(
  undefined
);

function useFileUpload() {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within FileUpload');
  }
  return context;
}

type FileUploadProps = FileUploadContextValue & {
  children: ReactNode;
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
      <div className="w-full min-w-0 space-y-4">{children}</div>
    </FileUploadContext.Provider>
  );
}

type FileUploadDropzoneProps = HTMLAttributes<HTMLDivElement>;

export function FileUploadDropzone({
  className,
  children,
  ...props
}: FileUploadDropzoneProps) {
  const {
    value,
    onValueChange,
    accept,
    maxFiles,
    maxSize,
    multiple,
    onFileReject,
  } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const validateAndAddFiles = async (newFiles: File[]) => {
    const result = await validateFiles({
      currentFiles: value,
      newFiles,
      accept,
      maxFiles,
      maxSize,
    });

    for (const error of result.errors) {
      onFileReject?.(error.file, error.message);
    }

    if (result.validFiles.length > 0) {
      onValueChange([...value, ...result.validFiles]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only cancel dragging if we are leaving the dropzone entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // If the click came from the file input itself, stop (prevents loops)
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // If the user clicked a button inside the dropzone (like a "Remove" button)
    // we usually don't want to open the file picker.
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.preventDefault();
    inputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Ignore if typing in a text input inside the dropzone
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      aria-label="File upload area - click or drag and drop files here"
      className={cn(
        'flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-4 text-left transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25',
        className
      )}
      onClick={handleClick}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      {children}
      <input
        accept={accept}
        className="sr-only"
        id={inputId}
        multiple={multiple}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}

type FileUploadTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const validateAndAddFiles = async (newFiles: File[]) => {
    const result = await validateFiles({
      currentFiles: value,
      newFiles,
      accept,
      maxFiles,
      maxSize,
    });

    for (const error of result.errors) {
      onFileReject?.(error.file, error.message);
    }

    if (result.validFiles.length > 0) {
      onValueChange([...value, ...result.validFiles]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
    e.target.value = '';
  };

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  if (asChild && isValidElement(children)) {
    return (
      <>
        {cloneElement(children, {
          onClick: handleClick,
          ...props,
        } as HTMLAttributes<HTMLElement>)}
        <input
          accept={accept}
          className="sr-only"
          multiple={multiple}
          onChange={handleFileChange}
          ref={inputRef}
          type="file"
        />
      </>
    );
  }

  return (
    <>
      <button
        {...props}
        className="cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        type="button"
      >
        {children}
      </button>
      <input
        accept={accept}
        aria-label="Välj filer"
        className="sr-only"
        id={inputId}
        multiple={multiple}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </>
  );
}

type FileUploadListProps = HTMLAttributes<HTMLDivElement>;

export function FileUploadList({
  className,
  children,
  ...props
}: FileUploadListProps) {
  return (
    <div className={cn('w-full min-w-0 space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

type FileUploadItemContextValue = {
  file: File;
  onDelete: () => void;
};

const FileUploadItemContext = createContext<
  FileUploadItemContextValue | undefined
>(undefined);

function useFileUploadItem() {
  const context = useContext(FileUploadItemContext);
  if (!context) {
    throw new Error('useFileUploadItem must be used within FileUploadItem');
  }
  return context;
}

type FileUploadItemProps = HTMLAttributes<HTMLDivElement> & {
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
          'flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </FileUploadItemContext.Provider>
  );
}

type FileUploadItemPreviewProps = HTMLAttributes<HTMLDivElement>;

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
        className
      )}
      {...props}
    >
      <FileIcon className="size-5" />
    </div>
  );
}

type FileUploadItemMetadataProps = HTMLAttributes<HTMLDivElement>;

export function FileUploadItemMetadata({
  className,
  ...props
}: FileUploadItemMetadataProps) {
  const { file } = useFileUploadItem();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const truncateFileName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) {
      return name;
    }

    const extension = name.split('.').pop() || '';
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    const availableLength = maxLength - extension.length - 4;

    if (availableLength <= 0) {
      return `${name.slice(0, maxLength - 3)}...`;
    }

    return `${nameWithoutExt.slice(0, availableLength)}...${extension}`;
  };

  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
      <p className="wrap-break-word font-medium text-sm" title={file.name}>
        {truncateFileName(file.name)}
      </p>
      <p className="text-muted-foreground text-xs">
        {formatFileSize(file.size)}
      </p>
    </div>
  );
}

type FileUploadItemDeleteProps = HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children?: ReactNode;
};

export function FileUploadItemDelete({
  asChild,
  children,
  ...props
}: FileUploadItemDeleteProps) {
  const { onDelete } = useFileUploadItem();

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      onClick: onDelete,
      ...props,
    } as HTMLAttributes<HTMLElement>);
  }

  return (
    <button onClick={onDelete} type="button" {...props}>
      {children}
    </button>
  );
}
