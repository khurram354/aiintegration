// import dbConnect from "@/lib/db";
// import OrdersModel from "@/models/ordersSchema";
// import { handleError } from "@/utils/errorHandler";
// import { handleSuccess } from "@/utils/handleSuccess";
// import { handleInvoiceCounter } from "@/utils/invoiceCountHandler";
// import InventoryModel from "@/models/inventorySchema";
// import CustomerModel from "@/models/customerSchema";
// import CustomerItemModel from "@/models/customerItemsSchema";

// const getFirstAvailableDeliveryDate = (deliveryDays) => {
//     const today = new Date();
//     const todayDay = today.getDay();
//     const sortedDays = [...deliveryDays].sort((a, b) => a - b);
//     let nextDay = sortedDays.find(day => day > todayDay);
//     let daysToAdd;
//     if (nextDay !== undefined) { daysToAdd = nextDay - todayDay }
//     else {
//         nextDay = sortedDays[0];
//         daysToAdd = (7 - todayDay) + nextDay;
//     }
//     const nextDate = new Date();
//     nextDate.setDate(today.getDate() + daysToAdd);
//     return nextDate;
// }

// const setCustomerSpecificPrices = async (customer, products) => {
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
//                 rate: customRate
//             }
//         }
//         return product
//     });
//     return updateProductPriceData;
// }

// export async function POST(request) {
//     try {
//         await dbConnect();
//         const { orderPayload } = await request.json();
//         if (!orderPayload) { return handleError(null, 'missing req order data') };
//         const { email, phone } = orderPayload.customer || {};
//         const deliveryNote = orderPayload.deliveryNote;
//         if (!email && !phone) { return handleError(null, "email or phone required"); }
//         let customer;
//         const normalizePhone = (phone) => String(phone).replace(/\D/g, '');
//         if (phone) {
//             const normalizedPhone = normalizePhone(phone);
//             customer = await CustomerModel.findOne({ mobile: normalizedPhone }).lean();
//         } else if (email) {
//             customer = await CustomerModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
//         }
//         if (!customer) { return handleError(null, "Customer not found"); }
//         const deliveryDays = customer.delivery_days;
//         if (!customer.delivery_days || !customer.delivery_days.length) {
//             return handleError(null, "Customer has no delivery days configured");
//         }
//         const invoice_date = getFirstAvailableDeliveryDate(deliveryDays);
//         const invoice_count = await handleInvoiceCounter();

//         let items_detail = await Promise.all(orderPayload.items.map(async (pro) => {
//             let proData = await InventoryModel.findById(pro.productId).populate('vat');
//             if (!proData) {
//                 console.log(`Product not found: ${pro.number}`);
//                 return null;
//             }

//             return {
//                 _id: pro.productId,
//                 name: proData.name,
//                 barcode: proData.barcode,
//                 quantity: pro.quantity,
//                 rate: proData.default_sale_price,
//                 cost_price: proData.cost_price,
//                 vat: String(proData.vat._id),
//                 tax: proData.vat.rate,
//                 weight_grams: proData.weight_grams,
//                 weight_kg: proData.weight_kg || 1
//             }
//         }));

//         let filteredProducts = items_detail.filter(item => item !== null);
//         const productWithCustomerSpecificPrices = await setCustomerSpecificPrices(customer, filteredProducts);
//         let totalNoVat = 0;
//         let vatTotal = 0;
//         let totalCost = 0;
//         productWithCustomerSpecificPrices.forEach(item => {
//             totalNoVat += item.rate * item.quantity;
//             vatTotal += (item.tax / 100) * item.rate * item.quantity;
//             totalCost += item.cost_price * item.quantity;

//         })
//         orderPayload.items = productWithCustomerSpecificPrices;
//         orderPayload.order_number = invoice_count;
//         orderPayload.customer = String(customer._id);
//         orderPayload.order_status = "confirmed";
//         orderPayload.ot_date = new Date().toISOString();
//         orderPayload.invoice_date = invoice_date.toISOString();
//         orderPayload.deliveryNote = deliveryNote;
//         orderPayload.total_no_vat = Number(totalNoVat).toFixed(2);
//         orderPayload.vat_total = Number(vatTotal).toFixed(2);
//         orderPayload.total_incl_vat = Number(totalNoVat + vatTotal).toFixed(2);
//         orderPayload.profit = Number(totalNoVat - totalCost).toFixed(2);
//         const resp = await OrdersModel.create(orderPayload);
//         if (!resp) { return handleError(null, "network error") }
//         return handleSuccess(null, null, "order created successfully")
//     } catch (error) { return handleError(error) }
// }



import dbConnect from "@/lib/db";
import OrdersModel from "@/models/ordersSchema";
import InventoryModel from "@/models/inventorySchema";
import CustomerModel from "@/models/customerSchema";
import CustomerItemModel from "@/models/customerItemsSchema";
import { handleError } from "@/utils/errorHandler";
import { handleSuccess } from "@/utils/handleSuccess";
import { handleInvoiceCounter } from "@/utils/invoiceCountHandler";
import { verifyAIBearerToken } from "@/utils/aiauthmiddleware";
import { NextResponse } from "next/server";

const getFirstAvailableDeliveryDate = (deliveryDays) => {
    const today = new Date();
    const todayDay = today.getDay();
    const sortedDays = [...deliveryDays].sort((a, b) => a - b);
    let nextDay = sortedDays.find(day => day > todayDay);
    let daysToAdd;
    if (nextDay !== undefined) {
        daysToAdd = nextDay - todayDay;
    } else {
        nextDay = sortedDays[0];
        daysToAdd = (7 - todayDay) + nextDay;
    }
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate;
};

export async function POST(request) {
    try {
        verifyAIBearerToken(request)
        await dbConnect();
        const { orderPayload } = await request.json();
        if (!orderPayload || !orderPayload.items?.length) {
            return handleError(null, "missing order data");
        }
        const { email, phone } = orderPayload.customer || {};
        const deliveryNote = orderPayload.deliveryNote;
        if (!email && !phone) {
            return handleError(null, "email or phone required");
        }
        let customer;
        const normalizePhone = (phone) => String(phone).replace(/\D/g, '');
        if (phone) {
            customer = await CustomerModel.findOne({
                mobile: normalizePhone(phone)
            }).lean();
        } else {
            customer = await CustomerModel.findOne({
                email: { $regex: new RegExp(`^${email}$`, "i") }
            }).lean();
        }
        if (!customer) {
            return handleError(null, "Customer not found");
        }
        if (!customer.delivery_days?.length) {
            return handleError(null, "Customer has no delivery days configured");
        }
        const invoice_date = getFirstAvailableDeliveryDate(customer.delivery_days);
        const invoice_count = await handleInvoiceCounter();
        const customerItems = await CustomerItemModel.findOne({
            customer: customer._id
        }).lean();
        const priceMap = {};

        if (customerItems?.items?.length) {
            for (const item of customerItems.items) {
                priceMap[item._id.toString()] = item.rate;
            }
        }
        const productIds = orderPayload.items.map(i => i.productId);

        const products = await InventoryModel.find({
            _id: { $in: productIds }
        }).populate("vat").lean();

        const productMap = {};
        products.forEach(p => {
            productMap[p._id.toString()] = p;
        });
        let totalNoVat = 0;
        let vatTotal = 0;
        let totalCost = 0;
        const items = orderPayload.items
            .map(item => {
                const proData = productMap[item.productId];
                if (!proData) return null;

                const finalRate =
                    priceMap[item.productId] ?? proData.default_sale_price;
                const quantity = item.quantity;
                totalNoVat += finalRate * quantity;
                vatTotal += (proData.vat.rate / 100) * finalRate * quantity;
                totalCost += proData.cost_price * quantity;
                return {
                    _id: item.productId,
                    name: proData.name,
                    barcode: proData.barcode,
                    quantity,
                    rate: finalRate,
                    cost_price: proData.cost_price,
                    vat: String(proData.vat._id),
                    tax: proData.vat.rate,
                    weight_grams: proData.weight_grams,
                    weight_kg: proData.weight_kg || 1
                };
            })
            .filter(Boolean);
        const order = {
            items,
            order_number: invoice_count,
            customer: customer._id,
            order_status: "confirmed",
            ot_date: new Date().toISOString(),
            invoice_date: invoice_date.toISOString(),
            deliveryNote,
            total_no_vat: totalNoVat.toFixed(2),
            vat_total: vatTotal.toFixed(2),
            total_incl_vat: (totalNoVat + vatTotal).toFixed(2),
            profit: (totalNoVat - totalCost).toFixed(2)
        };
        const resp = await OrdersModel.create(order);
        if (!resp) {
            return handleError(null, "network error");
        }
        return handleSuccess(null, null, "order created successfully");
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