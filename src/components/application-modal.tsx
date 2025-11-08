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
import {
  API_ENDPOINTS,
  FILE_UPLOAD,
  FORM_VALIDATION,
  SUCCESS_MESSAGES,
  VALIDATION_MESSAGES,
} from '@/config';

async function submitApplication(data: {
  name: string;
  email: string;
  phone: string;
  files: File[];
}) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);

  for (const file of data.files) {
    formData.append('files', file);
  }

  const response = await fetch(API_ENDPOINTS.UPLOAD, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(VALIDATION_MESSAGES.SUBMISSION_FAILED);
  }

  return { success: true };
}

const applicationSchema = z.object({
  name: z
    .string()
    .min(
      FORM_VALIDATION.NAME.MIN_LENGTH,
      VALIDATION_MESSAGES.NAME_TOO_SHORT(FORM_VALIDATION.NAME.MIN_LENGTH),
    ),
  email: z.email(VALIDATION_MESSAGES.INVALID_EMAIL),
  phone: z
    .string()
    .min(
      FORM_VALIDATION.PHONE.MIN_LENGTH,
      VALIDATION_MESSAGES.PHONE_TOO_SHORT(FORM_VALIDATION.PHONE.MIN_LENGTH),
    )
    .regex(
      FORM_VALIDATION.PHONE.PATTERN,
      VALIDATION_MESSAGES.INVALID_PHONE_FORMAT,
    ),
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
        if (value.files.length === 0) {
          toast.error(VALIDATION_MESSAGES.UPLOAD_REQUIRED);
          return;
        }

        const result = await submitApplication(value);

        if (result.success) {
          toast.success(SUCCESS_MESSAGES.APPLICATION_SUBMITTED);
          form.reset();
          setOpen(false);
        }
      } catch (error) {
        toast.error(VALIDATION_MESSAGES.SUBMISSION_ERROR);
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

          <form.Field
            name="files"
            validators={{
              onChange: ({ value }) => {
                if (value.length === 0) {
                  return VALIDATION_MESSAGES.NO_FILES;
                }
                if (value.length > FILE_UPLOAD.MAX_FILES) {
                  return VALIDATION_MESSAGES.TOO_MANY_FILES(
                    FILE_UPLOAD.MAX_FILES,
                  );
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
                  accept={`${FILE_UPLOAD.ALLOWED_EXTENSIONS},${FILE_UPLOAD.ALLOWED_MIME_TYPES.join(',')}`}
                  maxFiles={FILE_UPLOAD.MAX_FILES}
                  maxSize={FILE_UPLOAD.MAX_FILE_SIZE}
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
                        Eller klicka för att bläddra (max{' '}
                        {FILE_UPLOAD.MAX_FILES} filer)
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
                  Ladda upp ditt CV och personligt brev. Godkända format:{' '}
                  {FILE_UPLOAD.ALLOWED_TYPES_DESCRIPTION} (Max{' '}
                  {FILE_UPLOAD.MAX_FILE_SIZE_DISPLAY} per fil, upp till{' '}
                  {FILE_UPLOAD.MAX_FILES} filer)
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
