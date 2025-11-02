export function ShaStamp() {
  const SHA = import.meta.env.VITE_GIT_SHA;
  const SHA_URL = import.meta.env.VITE_GIT_SHA_URL;
  return (
    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
      {SHA && (
        <span>
          <a
            href={SHA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {SHA}
          </a>
        </span>
      )}
    </div>
  );
}
