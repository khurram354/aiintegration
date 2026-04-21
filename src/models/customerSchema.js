import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    email: {type:String, required:true, trim:true, unique:true},
    password: {type:String, trim:true, select:false},
    active: {type: Boolean, trim: true,},
    customer_name: {type:String, trim:true},
    mobile: {type:String, trim: true},
    city: {type:String, trim: true},
    status: {type: Boolean, default: false},
    zones:{type: [mongoose.Schema.Types.ObjectId], default: []},
    fcmtoken:{type:String},
    delivery_days:{type: [Number], default: []},
},{
    collection: 'customers',
    versionKey:false,
});
const CustomerModel = mongoose.models.customers || mongoose.model("customers", customerSchema)
export default CustomerModel;