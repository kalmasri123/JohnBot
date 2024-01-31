const mg = require("mongoose")

const Macro = mg.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
})

module.exports = mg.model("Macro", Macro)