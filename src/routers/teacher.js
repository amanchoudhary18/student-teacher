const express = require("express");
const Teacher = require("../models/teacher");
const bcrypt = require("bcryptjs");
const authTeacher = require("../middleware/authTeacher");
const router = new express.Router();

router.post("/teachers", async (req, res) => {
  const teacher = new Teacher(req.body);

  try {
    await teacher.save();

    const token = await teacher.generateAuthToken();
    res.status(201).send({ teacher, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/teachers/login", async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.body.email });

    if (!teacher) {
      throw new Error("Unable to Login");
    }

    const isMatch = await bcrypt.compare(req.body.password, teacher.password);
    if (!isMatch) {
      throw new Error("Unable to Login");
    }
    const token = await teacher.generateAuthToken();
    res.send({ teacher, token });
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

router.post("/teachers/logout", authTeacher, async (req, res) => {
  try {
    req.teacher.tokens = req.teacher.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.teacher.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/teachers/me", authTeacher, async (req, res) => {
  res.send(req.teacher);
});

router.delete("/teachers/me", authTeacher, async (req, res) => {
  try {
    await req.teacher.remove();
    res.send(req.teacher);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/teachers/mostfav", async (req, res) => {
  Teacher.aggregate([{ $sort: { favCount: -1 } }])
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((error) => {
      res.json({
        message: "An error occured!",
      });
    });
});

module.exports = router;
