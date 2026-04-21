import mongoose from "mongoose";
const appCusFavProSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref:'customers', index:true},
    favProducts: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref:"inventory"},
    }],
}, {
    collection: "appcustomerfavproduct",
    versionKey: false,
});
const AppCustFavProModel = mongoose.models.appcustomerfavproduct || mongoose.model('appcustomerfavproduct', appCusFavProSchema);
export default AppCustFavProModel;
