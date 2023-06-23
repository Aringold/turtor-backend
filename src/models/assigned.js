import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types

const assignedSchema = new Schema({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  worksheet: {
    type: ObjectId,
    ref: 'worksheet',
    required: true
  },
  answers: [{
    assessment: {
      type: ObjectId,
      ref: 'assessment',
      required: true
    },
    isMCQ: {
      type: Boolean,
      default: false,
    },
    selectedIndex: { // for mcq
      type: Number,
    },
    mark: { // for text and voice || and mark
      type: Number,
      default: 0,
    },
    textAnswer: {
      type: String,
    },
    voiceUrl: {
      type: String,
    },
    isCorrect: {
      type: Boolean,
    }
  }],
  assignedTo: {
    type: ObjectId,
    ref: 'user',
    required: true
  },
  readBy: [ // optional
    {
      user:{
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      readedAt: {
        type: Date,
      },
    }
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  new: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

export const model = mongoose.model('assigned', assignedSchema);
export const paths = Object.keys(assignedSchema.paths);