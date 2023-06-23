import mongoose from 'mongoose';
import { model as AssignModel } from './assigned';

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types

const workSheetSchema = new Schema({
  name: {
    type: String,
    unique: true,
    // required: true
  },
  description: { type: String, default: '' },
  assessments: [{
    type: ObjectId,
    ref: 'assessment'
  }],
  createdBy: {
    type: ObjectId,
    ref: 'user',
    required: true
  },
  topicId: {
    type: ObjectId,
    ref: 'topic',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

const isUsed = async function (id) {
  var assignedTask = await AssignModel.findOne({worksheet: id});

  return assignedTask
}

export const model = mongoose.model('worksheet', workSheetSchema);
export const paths = Object.keys(workSheetSchema.paths);
export const isUsedWorkSheet = isUsed;