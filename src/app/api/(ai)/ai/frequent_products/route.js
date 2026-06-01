import dbConnect from "@/lib/db";
import InventoryProduct from "@/models/inventorySchema";
import { NextResponse } from "next/server";
import { handleError } from "@/utils/errorHandler";
import CustomerItemModel from "@/models/customerItemsSchema";
import AppCustFavProModel from "@/models/appCusFavProSchema";
import CustomerModel from "@/models/customerSchema";
import { verifyAIBearerToken } from "@/utils/aiauthmiddleware";

export async function GET(request) {
  try {
    verifyAIBearerToken(request);
    await dbConnect();
    const {searchParams} = new URL(request.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");
    if (!phone && !email) { return NextResponse.json({ success: false, message: 'phone or email required' }, { status: 400 }) }
    let customer;
    const normalizePhone = (phone) => {
        return String(phone).replace(/\D/g, '');
    };
    if (phone) {
        const normalizedPhone = normalizePhone(phone);
        customer = await CustomerModel.findOne({ mobile: phone }).lean();
    } else if (email) {
        customer = await CustomerModel.findOne({ email: email }).lean();
    }
    if (!customer) { return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
}
    const customerSpecific = await CustomerItemModel.findOne({ customer: customer._id }).lean();
    // const priceMap = {};
    const specificIds = [];
    if (customerSpecific?.items?.length) {
      for (const item of customerSpecific.items) {
        const pid = item._id.toString();
        // priceMap[pid] = item.rate;
        specificIds.push(pid);
      }
    }
    const favData = await AppCustFavProModel.findOne({ customerId: customer._id });
    const favIds = favData?.favProducts?.map((p) => p.productId.toString()) || [];
    const mergedProductIds = [...new Set([...specificIds, ...favIds])];

    if (mergedProductIds.length === 0) { return NextResponse.json({ success: true, data: [], });}
    const products = await InventoryProduct.find({ _id: { $in: mergedProductIds }, active: true, }).select("_id name").lean();
    // const finalProducts = products.map((product) => ({
    //   ...product,
    //   default_sale_price: priceMap[product._id.toString()] ?? product.default_sale_price,
    // }));
    const customerData = {_id: customer._id, customer_name: customer.customer_name }
    return NextResponse.json({
      success: true,
      customerData,
      productsData: products,
    });
  } catch (error) {
    if (error.message === 'Unauthorized: Invalid token') {
            return NextResponse.json(
                { success: false, message: 'Invalid or missing token' },
                { status: 401 }
            );
        }
    return handleError(error);
  }
}
