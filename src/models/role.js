import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  // id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true},
})
export const model = mongoose.model('role', roleSchema);
export const Roles = {
  admin: "5fbee2782536a34bcc53c651",
  tutor: "5fbee287f63ef22be4432b44",
  user: "5fbee28ee5be073ac0ef0d83"
}
