import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <main
      className="mx-auto w-full max-w-2xl px-4 py-16 text-center"
      id="main-content"
    >
      <h1 className="font-extrabold font-heading text-4xl text-amber-600">
        404
      </h1>
      <p className="mt-4 text-muted-foreground">
        Sidan du söker kunde inte hittas.
      </p>
      <Link
        className="mt-6 inline-block text-teal-500 underline underline-offset-4"
        to="/"
      >
        Tillbaka till startsidan
      </Link>
    </main>
  );
}
