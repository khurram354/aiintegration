import { NextResponse } from "next/server";
export function handleSuccess (data, key = 'data', message = 'Request successful'){
    const response = {
        success:true,
        message:message,
    }
    if (data !== null) {
        response[key] = data;
    }
    return NextResponse.json(response);
}