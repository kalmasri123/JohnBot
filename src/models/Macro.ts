import mongoose, { Schema } from 'mongoose';
interface Macro {
    guildId: string;
    args: {};
    name: string;
    action: string;
}
const MacroSchema = new Schema<Macro>({
    guildId: { required: true, type: String },
    args: { type: Schema.Types.Mixed, default: {} },
    name: String,
    action: String,
},{ minimize: false });
export default mongoose.model('macro', MacroSchema);
