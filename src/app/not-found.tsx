import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <SearchIcon size={24} />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The part or page may have moved. Search the catalog or browse all products.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/catalog" className={buttonVariants({ size: "lg" })}>
          Browse products <ArrowRightIcon size={17} />
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Go home
        </Link>
      </div>
    </Container>
  );
}
