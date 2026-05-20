import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import { handleError } from "@/utils/errorHandler";
import CustomerModel from "@/models/customerSchema";
import { verifyAIBearerToken } from "@/utils/aiauthmiddleware";

export async function GET(request) {
    try {
        verifyAIBearerToken(request);
        await dbConnect();
        const customer = await CustomerModel.find().select("_id email mobile customer_name").lean();
        if (!customer) {
            return NextResponse.json(
                { success: false, message: "Customers not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            data:customer,
        });

    } catch (error) { 
        if (error.message === 'Unauthorized: Invalid token') {
            return NextResponse.json(
                { success: false, message: 'Invalid or missing token' },
                { status: 401 }
            );
        }
        handleError(error) }
}
