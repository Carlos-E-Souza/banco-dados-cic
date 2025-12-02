'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught an error:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-neutral-50">
        <main className="mx-6 flex max-w-xl flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-3xl font-semibold">Algo inesperado aconteceu</h1>
          <p className="text-sm text-neutral-200">
            Lamentamos o transtorno. Você pode tentar novamente ou voltar à página inicial enquanto resolvemos o problema.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full border border-lime-500 px-5 py-2 text-sm font-medium text-lime-400 transition-colors hover:bg-lime-500 hover:text-neutral-900"
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:text-neutral-50"
            >
              Página inicial
            </Link>
          </div>
          {error?.digest && (
            <p className="rounded-full border border-neutral-800 px-4 py-1 text-xs text-neutral-400">
              Código do erro: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
