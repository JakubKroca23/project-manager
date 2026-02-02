"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import Link from "next/link";
import { SubmitButton } from "@/components/auth/submit-button";

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Přihlášení do portálu
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Nebo{" "}
                        <Link href="/signup" className="font-medium text-primary hover:text-primary/90 underline underline-offset-4">
                            se zaregistrujte
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder="Emailová adresa"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Heslo
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder="Heslo"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-sm text-destructive font-medium text-center">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <SubmitButton text="Přihlásit se" loadingText="Přihlašování..." />
                    </div>
                </form>
            </div>
        </div>
    );
}
