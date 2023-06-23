import mongoose from 'mongoose';
import {model as Worksheet} from './worksheet';

const Schema = mongoose.Schema;

const assessmentSchema = new Schema({
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'topic',
    required: true
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'level',
    required: true
  },
  mark: { type: Number, min: 0, max: 10, default: 0 }, // 1 - 10 number
  question: {
    type: String, 
    // unique: true, 
    required: true
  },
  description: {type: String, default: ''},
  imgUrl: {type: String, default: ''},
  videos: [ String ], // array of Url string
  youtubeUrl: {type: String, default: ''},
  isMCQ: { type: Boolean, default: false },
  MCQs: [
    {
      index: { type: Number, min: 0},
      text: { type: String, default: ''},
      isCorrect: { type: Boolean, default: false},
    }
  ],
  tags: [ String ], // array of string // # optional
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

const checkUsed = async function (id) {
  var worksheet = await Worksheet.findOne({assessments: {$all: [id]}}).exec();
  if(worksheet) {
    return true
  }
 
  return false
};  

export const model = mongoose.model('assessment', assessmentSchema);
export const paths = Object.keys(assessmentSchema.paths);
export const isUsed = checkUsed
