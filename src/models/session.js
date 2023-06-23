// login history
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  
  ip: { type: String },
}, {
  timestamps: {
    createdAt: 'loginedAt',
    updatedAt: 'lastloginDate'
  }
});

export default mongoose.model('session', sessionSchema);