const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const auth = require("../middleware/auth");
const router = new express.Router();

// Sign-Up Student
router.post("/students", async (req, res) => {
  const student = new Student(req.body);

  try {
    await student.save();

    const token = await student.generateAuthToken();
    res.status(201).send({ student, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login Student
router.post("/students/login", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });

    if (!student) {
      throw new Error("Unable to Login");
    }

    const isMatch = await bcrypt.compare(req.body.password, student.password);
    if (!isMatch) {
      throw new Error("Unable to Login");
    }
    const token = await student.generateAuthToken();
    res.send({ student, token });
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

// Logout Student
router.post("/students/logout", auth, async (req, res) => {
  try {
    req.student.tokens = req.student.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.student.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Current LoggedIn Information
router.get("/students/me", auth, async (req, res) => {
  res.send(req.student);
});

// Update student details
router.patch("/students/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.student[update] = req.body[update]));
    await req.student.save();
    res.send(req.student);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete Student Account
router.delete("/students/me", auth, async (req, res) => {
  try {
    await req.student.remove();
    res.send(req.student);
  } catch (e) {
    res.status(500).send();
  }
});

//Select Favourite Teacher
router.patch("/students/fav/:teacherid", auth, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.params.teacherid });

    if (!req.student.favourites.includes(teacher._id)) {
      req.student.favourites.push(teacher._id);
      teacher.favCount++;
    } else {
      throw new Error("Already added to favourites");
    }

    await req.student.save();
    await teacher.save();
    res.send(req.student);
  } catch (e) {
    console.log(e);
    res.status(404).send(e);
  }
});

//Remove Favourite Teacher
router.patch("/students/defav/:teacherid", auth, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.params.teacherid,
    });

    if (!teacher) {
      res.status(404).send();
    }
    req.student.favourites.remove(req.params.teacherid);
    teacher.favCount--;

    await req.student.save();
    await teacher.save();
    res.send(req.student);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
