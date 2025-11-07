import { useForm } from '@tanstack/react-form';
import { Upload, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock API function for form submission
async function submitApplication(data: {
  name: string;
  email: string;
  phone: string;
  files: File[];
}) {
  // Post the application data to the server
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);

  // Append all files
  for (const file of data.files) {
    formData.append('files', file);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Det gick inte att skicka ansökan');
  }

  return { success: true };
}

// Validation schema
const applicationSchema = z.object({
  name: z.string().min(2, 'Namnet måste vara minst 2 tecken'),
  email: z.email('Ogiltig e-postadress'),
  phone: z
    .string()
    .min(10, 'Telefonnummer måste vara minst 10 tecken')
    .regex(/^[0-9+\s-()]+$/, 'Ogiltigt telefonnummerformat'),
});

function FieldError({ errors }: { errors: (string | undefined)[] }) {
  const errorMessages = errors.filter(
    (error): error is string => error !== undefined,
  );
  if (errorMessages.length === 0) return null;
  return (
    <p className="text-destructive text-sm font-medium" role="alert">
      {errorMessages[0]}
    </p>
  );
}

export function ApplicationModal() {
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      files: [] as File[],
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate required fields
        if (value.files.length === 0) {
          toast.error(
            'Vänligen ladda upp minst en fil (CV eller personligt brev)',
          );
          return;
        }

        const result = await submitApplication(value);

        if (result.success) {
          toast.success('Ansökan skickad!');
          form.reset();
          setOpen(false);
        }
      } catch (error) {
        toast.error('Kunde inte skicka ansökan. Försök igen.');
        console.error('Submission error:', error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Ansök om tjänsten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ansök om tjänsten</DialogTitle>
          <DialogDescription>
            Fyll i formuläret nedan för att skicka din ansökan. Vi går igenom
            din ansökan och återkommer så snart som möjligt.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 "
        >
          {/* Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = applicationSchema.shape.name.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Namn <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Anna Andersson"
                  aria-invalid={!field.state.meta.isValid}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = applicationSchema.shape.email.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  E-postadress <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="anna@example.com"
                  aria-invalid={!field.state.meta.isValid}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* Phone Field */}
          <form.Field
            name="phone"
            validators={{
              onChange: ({ value }) => {
                const result = applicationSchema.shape.phone.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Telefonnummer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="070-123 45 67"
                  aria-invalid={!field.state.meta.isValid}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* File Upload */}
          <form.Field
            name="files"
            validators={{
              onChange: ({ value }) => {
                if (value.length === 0) {
                  return 'Vänligen ladda upp minst en fil';
                }
                if (value.length > 5) {
                  return 'Du kan ladda upp max 5 filer';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label>
                  Ladda upp filer <span className="text-destructive">*</span>
                </Label>
                <FileUpload
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024}
                  onFileReject={(_, message) => {
                    toast.error(message);
                  }}
                  multiple
                >
                  <FileUploadDropzone>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center rounded-full border p-2.5">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">
                        Dra och släpp filer här
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Eller klicka för att bläddra (max 5 filer)
                      </p>
                    </div>
                    <FileUploadTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-fit"
                      >
                        Välj filer
                      </Button>
                    </FileUploadTrigger>
                  </FileUploadDropzone>
                  {field.state.value.length > 0 && (
                    <FileUploadList>
                      {field.state.value.map((file, index) => (
                        <FileUploadItem
                          key={`${file.name}-${index}`}
                          value={file}
                        >
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata />
                          <FileUploadItemDelete asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7"
                            >
                              <X className="size-4" />
                              <span className="sr-only">Ta bort</span>
                            </Button>
                          </FileUploadItemDelete>
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                  )}
                </FileUpload>
                <p className="text-muted-foreground text-xs">
                  Ladda upp ditt CV och personligt brev. Godkända format: PDF,
                  DOC, DOCX (Max 5MB per fil, upp till 5 filer)
                </p>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? 'Skickar...' : 'Skicka ansökan'}
                  </Button>
                </>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
