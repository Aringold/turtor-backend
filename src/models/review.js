import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  reviewId: { type: Schema.Types.ObjectId, required: true }, // id of  lesson | user
  description: { type: String, default: ''},
  stars: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  type: {
    type: String,
    enum: ['LESSON', 'USER'],
    required: true
  }, // lesson | assement | user |  // site # optional
  createdBy: { type: Schema.Types.ObjectId, ref: 'user'},
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

export const model = mongoose.model('review', reviewSchema);
export const paths = Object.keys(reviewSchema.paths);
export const ReviewTypes = {
  LESSON: 'LESSON', 
  ASSESSMENT: 'ASSESSMENT', 
  USER: 'USER',
}