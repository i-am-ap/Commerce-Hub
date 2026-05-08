import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="text-center">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">This page took the scenic route and never came back.</p>
        <Link className={`mt-6 inline-block ${buttonVariants({ variant: "primary" })}`} to="/">
          Back to home
        </Link>
      </Card>
    </div>
  );
}
