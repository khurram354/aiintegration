import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import { handleError } from "@/utils/errorHandler";
import CustomerModel from "@/models/customerSchema";
import { verifyAIBearerToken } from "@/utils/aiauthmiddleware";

export async function GET(request) {
    try {
        verifyAIBearerToken(request);
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        const email = searchParams.get("email");
        if (!phone && !email) { return NextResponse.json({ success: false, message: 'phone or email required' }, { status: 400 }) }
        const query = { $or: []};
        if (phone) query.$or.push({mobile: phone});
        if (email) query.$or.push({email: email});
        const customer = await CustomerModel.findOne({ active: true, ...query }).select("_id email mobile customer_name").lean();
        if (!customer) {
            return NextResponse.json(
                { success: false, message: "Customer not found" },
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
