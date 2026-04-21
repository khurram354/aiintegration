import dbConnect from "@/lib/db";
import InventoryProduct from "@/models/inventorySchema";
import { NextResponse } from "next/server";
import { handleError } from "@/utils/errorHandler";
import CustomerItemModel from "@/models/customerItemsSchema";
import CustomerModel from "@/models/customerSchema";
import { verifyAIBearerToken } from "@/utils/aiauthmiddleware";

// const setCustomerSpecificPrices = async (phone, email, products) => {
//     let customer;
//     const normalizePhone = (phone) => {
//         return String(phone).replace(/\D/g, '');
//     };
//     if (phone) {
//         const normalizedPhone = normalizePhone(phone);
//         customer = await CustomerModel.findOne({ mobile: normalizedPhone }).lean();
//     } else if (email) {
//         customer = await CustomerModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
//     }
//     if (!customer) return products;
//     const customerSpecificProducts = await CustomerItemModel.findOne({ customer: customer._id }).lean();
//     if (!customerSpecificProducts || !customerSpecificProducts.items?.length) return products;
//     const customerItemsMap = {};
//     for (const item of customerSpecificProducts.items) {
//         customerItemsMap[item._id.toString()] = item.rate
//     };
//     const updateProductPriceData = products.map((product) => {
//         const customRate = customerItemsMap[product._id.toString()];
//         if (customRate !== undefined) {
//             return {
//                 ...product,
//                 default_sale_price: customRate
//             }
//         }
//         return product
//     });
//     return updateProductPriceData;
// }

export async function GET(request) {
    try {
        verifyAIBearerToken(request);
        await dbConnect();
        // const { searchParams } = new URL(request.url);
        // const phone = searchParams.get("phone");
        // const email = searchParams.get("email");
        // if (!phone && !email) { return NextResponse.json({ success: false, message: 'phone or email required' }, { status: 400 }) }
        const products = await InventoryProduct.find({ active: true }).select("_id name").lean();
        // const data = await setCustomerSpecificPrices(phone, email, products);
        return NextResponse.json({
            success: true,
            count: products.length,
            data:products,
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
