import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
   name: { type: String, trim:true},
   invoice_count: {type: Number, min: 0, default:0},
}, {
    collection: "counter", 
    versionKey: false,
});

const CounterModel = mongoose.models.counter || mongoose.model('counter', counterSchema);

export default CounterModel;
