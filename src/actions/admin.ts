'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'jakub.kroca@contsystem.cz';

export async function approveAccessRequest(requestId: string, email: string, password: string) {
    const cookieStore = await cookies();

    // 1. Verify current user is admin
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || user.email !== ADMIN_EMAIL) {
        return { error: 'Unauthorized: Only admin can perform this action.' };
    }

    // 2. Create the new user with Admin Client (Service Role)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY in .env settings.' };
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // Create User
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: email.split('@')[0],
        }
    });

    if (createError) {
        return { error: `Failed to create user: ${createError.message}` };
    }

    // 3. Mark request as processed
    const { error: updateError } = await adminClient
        .from('user_requests')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', requestId);

    if (updateError) {
        return { error: 'User created but failed to update request status.' };
    }

    return { success: true, userId: newUser.user.id };
}
