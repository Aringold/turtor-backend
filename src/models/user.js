import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
const Role = require('./role').model;
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  email: { type: String, lowercase: true, unique: true },
  password: { type: String, required: true },
  auth: {
    token: String,
    used: Boolean, // email verify
    expires: Date,
  },
  resetPassword: {
    token: String,
    used: Boolean,
    expires: Date,
  },
  // tutor app
  gender: { 
    type: String,
    default: '',
    enum: ['MALE', 'FEMALE', '']
  }, // MALE / FEMALE
  identificationNumber: { type: String, default: '' },
  contactNumber: { type: Number, default: 0 },
  address: { // optional
    country: {
      type: String,
      default: ''
    },
    content: { // city or town 
      type: [ String ], // array of string  # length is 2
    },
    zipOrPostalCode: {
      type: String,
      default: ''
    }
  },
  parentName:       { type: String, default: '' },
  level:            {type: Schema.Types.ObjectId, ref: 'level'},
  avatar:           {type: String, default: 'public\\assets\\imgs\\avatar\\user-avatar.jpg'},
  tutors:           [{type: Schema.Types.ObjectId, ref: 'user'}], // ids of tutors(user collection)
  CA_or_SA_score:   { type: String, default: '' },
  refCode:          { type: String, default: '' }, // referal code
  SecQuestionId:    {type: Schema.Types.ObjectId, ref: 'securityanswer'},
  SecQestionAnswer: { type: String, required: true},
  aboutMeTitle:     { type: String, default: '' },
  aboutMe:          { type: String, default: '' },
  role:             { type: Schema.Types.ObjectId, ref: 'role', required: true }, // role id
  
  status: { 
    type: Number,
    default: 0,
    enum: [0, 1, 2]
  }, // pending 0 | accepted 1 | denied 2 |
  deleted: { type: Boolean, default: false},

}, { 
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
});


userSchema.pre('save', function (next) {
  const user = this;

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      user.password = hash;
      user.auth = { token: salt, used: 0, expires: tomorrow };
      next();
    });
  });
});

userSchema.pre('findOne', async function(next) {
  this.populate('role');
  next();
})

userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return callback(err); }

    callback(null, isMatch);
  });
};

userSchema.index({'$**': 'text'});

export const model = mongoose.model('user', userSchema);
export const paths = Object.keys(userSchema.paths);
export const UserStatus = {
  PENDING    : 'PENDING',
  ACCEPTED  : 'ACCEPTED',
  DENIED    : 'DENIED',
};
export const getStatusValue = (type) => {
  switch (type) {
    case UserStatus.ACCEPTED:
      return 1;
    case UserStatus.DENIED:
      return 2;
    case UserStatus.PENDING:
      return 0;
    default:
      break;
  }
}