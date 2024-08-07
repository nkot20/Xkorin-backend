const { FirebaseScrypt } = require('firebase-scrypt');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { Schema } = require('mongoose');
const Roles = require('../config/role');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },

  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiration: {
    type: Date,
  },

  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: true,
  },
  otp: {
    type: String,
    default: 0,
  },
  gender: {
    type: String,
  },
  mobile_no: {
    type: String,
    required: false,
  },
  country_code: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  // roles: { type: Schema.Types.ObjectId, ref: 'Roles' },
  user_address: {
    type: String,
  },

  role: {
    type: [Number],

  },
  isValided: {
    type: Boolean,
    default: false
  },
  alreadyLogin: {
    type: Boolean,
    default: false
  },
  validationToken: {
    type: String
  },
  validationExpirationToken: {
    type: Date
  },
}, { timestamps: true });

// Hash the password before saving
UserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (error, hash) => {
      if (err) return next(error);
      user.password = hash;
      next();
    });
  });
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    // remove these props when object is serialized
    // eslint-disable-next-line no-param-reassign
    delete ret.password;
  },
});

// Compare password method
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  if (this.salt) {
    const scrypt = new FirebaseScrypt({
      memCost: 14,
      rounds: 8,
      saltSeparator: 'Bw==',
      signerKey: 'TKUrF+SiLe7i36FhSgfCVKctD2xpErCun43DwBsKafUmTwW7AfuvQS99kqJSESZTOD3ND85hnNByuGkuBqadqg==',
    });

    scrypt.verify(candidatePassword, this.salt, this.password)
      .then((isValid) => {
        if (isValid) {
          console.log('Valid !');
          callback(null, true);
        } else {
          callback(null, false);
        }
      })
      .catch((err) => {
        console.error('Error in SCRYPT verification:', err);
        callback(err);
      });
  } else {
    // Bcrypt comparison for other users
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  }
};

UserSchema.plugin(aggregatePaginate);

const user = mongoose.model('users', UserSchema);
module.exports = user;
