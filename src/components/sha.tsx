import { GitBranch } from 'lucide-react';
import { GIT_SHA, GIT_SHA_URL } from '@/config';

export function ShaStamp() {
  const SHA = GIT_SHA;
  const SHA_URL = GIT_SHA_URL;
  return (
    <div className="mt-4 text-center text-muted-foreground text-xs">
      {SHA && (
        <span>
          <a
            className="inline-flex items-center gap-1 hover:underline"
            href={SHA_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitBranch className="h-3 w-3" />
            {SHA}
          </a>
        </span>
      )}
    </div>
  );
}
