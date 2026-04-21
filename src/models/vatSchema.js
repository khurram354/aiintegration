import mongoose from "mongoose";

const vatSchema = new mongoose.Schema({
   name: { type: String, required:true, trim:true},
   rate: {type: Number, required: true, min: 0, default:0},
   order: {type: Number, required:true, min:0, default: 0}  
}, {
    collection: "vat", 
    versionKey: false,
});

const VAT = mongoose.models.VAT || mongoose.model('VAT', vatSchema);

export default VAT;
