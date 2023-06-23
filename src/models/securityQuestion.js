import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const roleSchema = new Schema({
  question: { type: String, required: true, unique: true },
},{
  timestamps: {
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt', 
  }
});

export default mongoose.model('securityQuestions', roleSchema); // 