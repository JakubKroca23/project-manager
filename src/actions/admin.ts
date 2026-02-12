'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'jakub.kroca@contsystem.cz';

/**
 * Server action to approve a user's access request.
 * Creates a new user account using the Supabase Admin API and updates the request status.
 * 
 * @param requestId The ID of the pending request.
 * @param email User's email address.
 * @param password Initial password for the new user.
 * @returns Result object with success status or error message.
 */
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
                    }
                },
            },
        }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: 'Unauthorized: User not found.' };
    }

    // Check if user is admin in database
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin' && user.email !== ADMIN_EMAIL) {
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

    if (createError || !newUser?.user) {
        return { error: `Failed to create user: ${createError?.message || 'Unknown error'}` };
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

