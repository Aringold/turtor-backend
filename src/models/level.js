import mongoose from 'mongoose';
const Topic = require('./topic').model;

const Schema = mongoose.Schema;

const levelScheman = new Schema({
  name: { type: String, required: true, unique: true }, // Beginner | Advanced | intermediate | something
  description: { type: String},  
  iconClassName: String, // optional
  imgUrl: { type: String },
});

const checkUsed = async function (id) {
  var topic = await Topic.findOne({levelId: id});

  if(topic) {
    return true
  }
 
  return false
};

export const model = mongoose.model('level', levelScheman);
export const paths = Object.keys(levelScheman.paths);
export const isUsed = checkUsed