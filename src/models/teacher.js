const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    mobile: {
      type: Number,
      validate(value) {
        if (value < 999999999) {
          throw new Error("Enter a valid phone number");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error(`Password (${value}) contains the word password`);
        }
      },
    },

    favCount: {
      type: Number,
      default: 0,
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

teacherSchema.methods.toJSON = function () {
  const teacher = this;
  const teacherObject = teacher.toObject();

  delete teacherObject.password;
  delete teacherObject.tokens;

  return teacherObject;
};

teacherSchema.methods.generateAuthToken = async function () {
  const teacher = this;
  const token = jwt.sign(
    { _id: teacher._id.toString() },
    process.env.JWT_SECRET
  );

  teacher.tokens = teacher.tokens.concat({ token });
  await teacher.save();

  return token;
};

teacherSchema.statics.findByCredentials = async (email, password) => {
  const teacher = await teacher.findOne({ email });
  if (!teacher) {
    throw new Error("Unable to Login");
  }

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) {
    throw new Error("Unable to Login");
  }

  return teacher;
};

teacherSchema.pre("save", async function (next) {
  const teacher = this;

  if (teacher.isModified("password")) {
    teacher.password = await bcrypt.hash(teacher.password, 8);
  }

  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
