import dbConnect from "@/lib/db";
import CounterModel from "@/models/counterSchema";

export const handleInvoiceCounter = async() => {
    try {
        await dbConnect()
        const counter = await CounterModel.findOneAndUpdate(
            {name: "invoice"},
            {$inc: {invoice_count: 1}},
            {returnDocument: "after", upsert: true}
        )
        const formatted = `INV-${String(counter.invoice_count).padStart(4,0)}`;
        return formatted
    } catch (error) {
        console.log("error", error)
    }
}