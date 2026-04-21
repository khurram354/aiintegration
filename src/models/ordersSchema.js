import mongoose from "mongoose";
const ordersSchema = new mongoose.Schema({
    invoice_date: { type: Date},
    ot_date: { type: Date},
    customer: {type: String, trime: true},
    items: [{
        _id: {type: String, trim:true},
        name: {type: String, trim: true},
        barcode: {type: Number},
        quantity: {type: Number},
        rate: {type: Number},
        cost_price: {type: Number},
        vat: {type: String},
        tax: {type: Number},
        weight_grams: {type: Number},
        weight_kg:{type: Number}
    }],
    total_no_vat: { type: Number},
    vat_total: { type: Number},
    total_incl_vat: { type: Number},
    profit: {type: Number},
    order_number: {type: String, trim:true},
    order_status: {type: String, default: "confirmed"},
    paymentStatus: {type: String, default: "pending"},
    paymentIntentId: {type: String},
    deliveryNote: {type: String},
}, {
    collection: "orders",
    versionKey: false,
});
ordersSchema.index({order_number: 1});
ordersSchema.index({customer: 1});
ordersSchema.index({invoice_date: 1});
ordersSchema.index({order_status: 1});
const OrdersModel = mongoose.models.orders || mongoose.model('orders', ordersSchema);
export default OrdersModel;
