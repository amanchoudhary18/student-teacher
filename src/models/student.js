const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("./teacher.js");
const studentSchema = new mongoose.Schema(
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

    favourites: [
      {
        type: String,
      },
    ],

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

studentSchema.methods.toJSON = function () {
  const student = this;
  const studentObject = student.toObject();

  delete studentObject.password;
  delete studentObject.tokens;

  return studentObject;
};

studentSchema.methods.generateAuthToken = async function () {
  const student = this;
  const token = jwt.sign(
    { _id: student._id.toString() },
    process.env.JWT_SECRET
  );

  student.tokens = student.tokens.concat({ token });
  await student.save();

  return token;
};

studentSchema.statics.findByCredentials = async (email, password) => {
  const student = await student.findOne({ email });
  console.log(student);
  if (!student) {
    throw new Error("Unable to Login");
  }

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    throw new Error("Unable to Login");
  }

  return student;
};

//Hash the plain text password
studentSchema.pre("save", async function (next) {
  const student = this;

  if (student.isModified("password")) {
    student.password = await bcrypt.hash(student.password, 8);
  }

  next();
});

// MongoDB Aggregation

const student = mongoose.model("student", studentSchema);

module.exports = student;
