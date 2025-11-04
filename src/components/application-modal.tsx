import { useForm } from '@tanstack/react-form';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock API function for form submission
async function submitApplication(data: {
  name: string;
  email: string;
  phone: string;
  resume: File | null;
  coverLetter: File | null;
}) {
  // Post the application data to the server
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  if (data.resume) formData.append('resume', data.resume);
  if (data.coverLetter) formData.append('coverLetter', data.coverLetter);

  const response = await fetch('https://joina-api.crip.workers.dev/upload', {
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
      resume: null as File | null,
      coverLetter: null as File | null,
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate required fields
        if (!value.resume) {
          toast.error('Vänligen ladda upp ditt CV');
          return;
        }
        if (!value.coverLetter) {
          toast.error('Vänligen ladda upp ditt personliga brev');
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

          {/* Resume Upload */}
          <form.Field name="resume">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  CV <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2 min-w-0">
                  <label
                    htmlFor={field.name}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    Välj fil
                  </label>
                  <span className="text-muted-foreground text-sm truncate min-w-0">
                    {field.state.value
                      ? (field.state.value as File).name
                      : 'Ingen fil vald'}
                  </span>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.handleChange(file);
                  }}
                />
                <p className="text-muted-foreground text-xs">
                  Godkända format: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            )}
          </form.Field>

          {/* Cover Letter Upload */}
          <form.Field name="coverLetter">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Personligt brev <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2 min-w-0">
                  <label
                    htmlFor={field.name}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    Välj fil
                  </label>
                  <span className="text-muted-foreground text-sm truncate min-w-0">
                    {field.state.value
                      ? (field.state.value as File).name
                      : 'Ingen fil vald'}
                  </span>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.handleChange(file);
                  }}
                />
                <p className="text-muted-foreground text-xs">
                  Godkända format: PDF, DOC, DOCX (Max 5MB)
                </p>
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
