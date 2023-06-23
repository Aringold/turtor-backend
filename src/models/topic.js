import mongoose from 'mongoose';
const Assessment = require('./assessment').model;
const Lesson = require('./lesson').model;
const WorkSheet = require('./worksheet').model;

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types

const topicSchema = new Schema({
  name: {
    type: String,
    required: true 
  },
  description: { type: String, default: '' },
  levelId: { type: ObjectId, ref: 'level'},
  categoryId: { type: ObjectId, ref: 'category'},
  type: {
    type: String,
    required: true,
    enum: ['LESSON', 'ASSESSMENT']
  },
  createdBy: {
    type: ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});


const checkUsed = async function (id) {

  // check assessment
  var assessment = await Assessment.findOne({topic: id});

  if(assessment) {
    return true
  }
  if(!assessment) {
    var lesson = await Lesson.findOne({topic: id});

    if(lesson) {
      return true
    }
    
    var worksheet = await WorkSheet.find({topicId: id});
    if(worksheet) {
      return true
    }
  }

  return false
};


export const model = mongoose.model('topic', topicSchema);
export const paths = Object.keys(topicSchema.paths);
export const TopicType = {
  LESSON: "LESSON",
  ASSESSMENT: "ASSESSMENT"
}
export const isUsed = checkUsed