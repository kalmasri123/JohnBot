import mongoose from "mongoose"

interface macro {
    name: string,
    link: string
}
const Macro: mongoose.Schema<macro> = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
})

module.exports = mongoose.model("Macro", Macro)