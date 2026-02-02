"use client";

import { useActionState } from "react";
import { signup } from "@/app/auth/actions";
import Link from "next/link";
import { SubmitButton } from "@/components/auth/submit-button";

export default function SignupPage() {
    const [state, formAction] = useActionState(signup, null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Registrace nového účtu
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Již máte účet?{" "}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/90 underline underline-offset-4">
                            Přihlaste se
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="fullName" className="sr-only">
                                Celé jméno
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder="Celé jméno"
                            />
                        </div>
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
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-foreground bg-background ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder="Heslo (min. 6 znaků)"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-sm text-destructive font-medium text-center">
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div className="text-sm text-green-600 font-medium text-center">
                            {state.message}
                        </div>
                    )}

                    <div>
                        <SubmitButton text="Vytvořit účet" loadingText="Registrace..." />
                    </div>
                </form>
            </div>
        </div>
    );
}
