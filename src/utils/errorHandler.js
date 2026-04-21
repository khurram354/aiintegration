import { NextResponse } from "next/server";

export function handleError(error, message = "Network Error"){
    console.log("Error", error || "");
    return NextResponse.json({
        success:false,
        message: message,
    });
}