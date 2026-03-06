"use server"

import { createListener } from "@/lib/listeners-store"

export async function createListenerAction(formData: any) {
    try {
        await createListener({
            ...formData,
            provider: "credentials",
        })
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}
