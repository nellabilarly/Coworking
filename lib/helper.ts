"use server"

import { cookies } from "next/headers"

export async function setCookie(
    label: string, value: string) {
    (await cookies()).set(label,value,{
        httpOnly:true,
        maxAge: 60 * 60* 24,
        path: "/",
        sameSite: "lax",
    })
}

export async function setRoleCookie(value: string) {
    (await cookies()).set("role", value, {
        httpOnly: false,
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax",
    });
}

export async function getCookie(label: string) {
    return (await cookies()).get(label)?.value
}

export async function removeCookie(label:string) {
(await cookies()).delete(label)
}

export async function parseResponseMessage( msg: string | {[key:string]: string | undefined}){
 return typeof msg === "string" ? msg : Object.values(msg).join(", ")
}

