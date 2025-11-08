import { GitBranch } from 'lucide-react';
import { GIT_SHA, GIT_SHA_URL } from '@/config';

export function ShaStamp() {
  const SHA = GIT_SHA;
  const SHA_URL = GIT_SHA_URL;
  return (
    <div className="text-center text-xs text-muted-foreground mt-4">
      {SHA && (
        <span>
          <a
            href={SHA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1"
          >
            <GitBranch className="w-3 h-3" />
            {SHA}
          </a>
        </span>
      )}
    </div>
  );
}
