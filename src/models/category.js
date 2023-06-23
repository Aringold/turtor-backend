import mongoose from 'mongoose';
const Topic = require('./topic').model;

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, unique: true , required: true }, // title
  iconClassName: String, // optional
  imgUrl: { type: String },
  description: { type: String, default: ""}, // optional
  slug: { type: String }, // optional
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'category'
  }],
  isParent: { // optional
    type: Boolean,
    default: true
  }
});

const checkUsed = async function (id) {
  var topic = await Topic.findOne({categoryId: id});

  if(topic) {
    return true
  }
 
  return false
};


export const model = mongoose.model('category', categorySchema);
export const paths = Object.keys(categorySchema.paths);
export const isUsedData = checkUsed