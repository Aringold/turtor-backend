import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const lessonSchema = new Schema({
  name: { type: String,  unique: true, required: true },
  imgUrl: { type: String, required: true},
  voiceUrl: { type: String, default: ''}, // optional
  youtubeUrl: { type: String, default: ''},
  videos: [ String ],
  learnkeys: [ String ],
  description: { type: Schema.Types.String, default: '' }, // html text
  level: { type: Schema.Types.ObjectId, ref: 'level'}, // id of level
  topic: { type: Schema.Types.ObjectId, ref: 'topic'}, // 
  tags: [ String ], // array of string // # optional
  isTopLesson: {type: Boolean, default: false }, // optional
  watchedBy: [
    {
      type: Schema.Types.ObjectId, 
      ref: 'user'
    }
  ],
  status: {  // pending 0 | accepted 1 | denied 2 |
    type: Number,
    enum: [0, 1, 2] // it mean  enum
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

export const model = mongoose.model('lesson', lessonSchema);
export const paths = Object.keys(lessonSchema.paths);
export const Status = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  denied: 'DENIED',
}