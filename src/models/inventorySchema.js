import mongoose from "mongoose";
// import InventoryCategory from "./categorySchema";
// import SubCategoryModel from "./subcategorySchema";
// import SubSubCategoryModel from "./subsubcategorySchema";
import VAT from "./vatSchema";
const inventorySchema = new mongoose.Schema({
    name:       {type: String, required: true, trim: true},
    active:     {type: Boolean, required: true, default: true, index: true,
        validate: {validator: (value) => [false, true].includes(value)}},

    // category: {
    //     type: mongoose.Schema.Types.ObjectId, ref: 'InventoryCategory', default: null, index: true},
    // subcategory: {type: mongoose.Schema.Types.ObjectId,default:null, index:true, ref:'subcategories'},
    // subsubcategory: {type:mongoose.Schema.Types.ObjectId, default:null, index:true, ref: 'subsubcategories'},
    // tags: {
    //     type: [mongoose.Schema.Types.ObjectId], ref: 'InventoryTag', default: [], index: true},
    vat: {
        type: mongoose.Schema.Types.ObjectId, ref: 'VAT', required: true, index: true},
    quantity:           {type: Number, required: true, default: 0},
    alert_quantity:     {type: Number, required: true, default: 0},
    weight_grams:       {type: Number, required: false, default: 0, min: 0},
    weight_kg:          {type: Number, required: false, default: 0, min: 0},
    cost_price: {type: Number, required: true},
    min_sale_price: {type: Number, required: true},
    default_sale_price: {type: Number, required: true},
    collection_price: {type: Number},
    barcode:{type:Number},
    cate_sequence_no:   {type: Number, trim:true},
    subcate_sequence_no:   {type: Number, trim:true},
    item_image:         {type: String},
    image_name: {
        type: [String],
        validate: {
            validator: function(value){
                return value.length <= 5
            },
            message: "No More then Five Images Please"
        }
    },
    favourite: {type: Boolean, default:false, 
        validate: {
            validator:function(value){
                return [true,false].includes(value);
            },
            message:'Favourite must be a boolean value'
        }
    },
    cuisine:  [{
        type:String,
        enum: {
            values: ['english','chinese','italian','indian'],
            message: "Please use valid values cuisine Only"
        }
    }],
    special_categories: [{
        type:String,
        enum: {
            values: ['trending_products','new_arrivals','top_selling','seasonal_promotions','special_offers'],
            message: "Please enter valid special categories only"
        }
    }],
    
},{
    collection: "inventory",
    versionKey:false,
});
inventorySchema.index({ name: 'text'});
const InventoryProduct = mongoose.models.inventory || mongoose.model('inventory', inventorySchema);

export default InventoryProduct;

