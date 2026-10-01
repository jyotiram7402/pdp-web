"use client";

import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-danger/10 text-danger">
        <AlertIcon size={24} />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Please try again. If the problem continues, reload the page.</p>
      <Button className="mt-8" size="lg" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
