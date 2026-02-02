import { logout } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/submit-button";

export default function PendingApproval() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
                    <div className="flex flex-col space-y-1.5 p-6 pt-0">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">Čekání na schválení</h3>
                    </div>

                    <p className="text-muted-foreground mb-6">
                        Váš účet byl úspěšně vytvořen, ale musí být schválen administrátorem, než budete moci pokračovat.
                        <br /><br />
                        Prosím, vyčkejte na potvrzení.
                    </p>

                    <form action={logout}>
                        <SubmitButton text="Zpět na přihlášení" loadingText="Odhlašování..." className="w-full" />
                    </form>
                </div>
            </div>
        </div>
    );
}
