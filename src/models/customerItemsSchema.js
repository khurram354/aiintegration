import mongoose from "mongoose";
import CustomerModel from "./customerSchema";

const customerItemSchema = new mongoose.Schema({
    customer: {type:mongoose.Schema.Types.ObjectId, ref: 'customers', index:true },
    items: [{
        _id: { type: mongoose.Schema.Types.ObjectId },
        rate:{type:Number}}]
},
    {
        collection:"customerItems",
        versionKey:false,
    }
);
const CustomerItemModel = mongoose.models.customerItems || mongoose.model("customerItems", customerItemSchema)
export default CustomerItemModel