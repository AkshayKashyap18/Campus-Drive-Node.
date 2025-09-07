// src/routes.js
const express = require("express");
const router = express.Router();
const { Op, QueryTypes } = require("sequelize");
const {
  College,
  Student,
  Event,
  Registration,
  Feedback,
  sequelize,
} = require("./models");

//
// ----------------- Event APIs -----------------
//

// Create event
router.post("/events", async (req, res) => {
  try {
    const { collegeId, title, ...rest } = req.body;
    if (!collegeId || !title) {
      return res.status(400).json({ error: "collegeId and title required" });
    }
    const event = await Event.create({ collegeId, title, ...rest });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List events (with filters)
router.get("/events", async (req, res) => {
  try {
    const where = {};
    if (req.query.collegeId) where.collegeId = req.query.collegeId;
    if (req.query.state) where.state = req.query.state;
    if (req.query.type) where.type = req.query.type;

    const events = await Event.findAll({
      where,
      order: [["startTime", "ASC"]],
    });
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hard delete an event
router.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.destroy();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete (cancel event)
router.post("/events/:id/cancel", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    event.state = "cancelled";
    await event.save();
    res.json({ message: "Event cancelled", event });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//
// ----------------- Registration APIs -----------------
//

// Register student (auto-create student if needed)
router.post("/register", async (req, res) => {
  try {
    const { eventId, studentRoll, name, email, collegeId } = req.body;
    if (!eventId || !studentRoll || !collegeId) {
      return res
        .status(400)
        .json({ error: "eventId, studentRoll, collegeId required" });
    }

    // check event is published
    const event = await Event.findByPk(eventId);
    if (!event || event.state !== "published") {
      return res
        .status(400)
        .json({ error: "Event not found or not published" });
    }

    // create/find student
    let student = await Student.findOne({ where: { studentRoll, collegeId } });
    if (!student) {
      student = await Student.create({ studentRoll, name, email, collegeId });
    }

    // create registration
    const reg = await Registration.create({
      eventId,
      studentId: student.id,
      collegeId,
    });

    res.status(201).json(reg);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Already registered" });
    }
    res.status(400).json({ error: err.message });
  }
});

//
// ----------------- Attendance APIs -----------------
//

router.post("/attendance", async (req, res) => {
  try {
    const { eventId, studentRoll, collegeId, status } = req.body;
    if (!eventId || !studentRoll || !collegeId || !status) {
      return res
        .status(400)
        .json({ error: "eventId, studentRoll, collegeId, status required" });
    }

    const student = await Student.findOne({
      where: { studentRoll, collegeId },
    });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const reg = await Registration.findOne({
      where: { eventId, studentId: student.id },
    });
    if (!reg) return res.status(404).json({ error: "Registration not found" });

    reg.attendanceStatus = status;
    await reg.save();
    res.json(reg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//
// ----------------- Feedback APIs -----------------
//

router.post("/feedback", async (req, res) => {
  try {
    const { eventId, studentRoll, collegeId, rating, comments } = req.body;
    if (!eventId || !studentRoll || !collegeId || rating === undefined) {
      return res.status(400).json({
        error: "eventId, studentRoll, collegeId, rating required",
      });
    }

    const student = await Student.findOne({
      where: { studentRoll, collegeId },
    });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const fb = await Feedback.create({
      eventId,
      studentId: student.id,
      collegeId,
      rating,
      comments,
    });

    res.status(201).json(fb);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//
// ----------------- Reporting APIs -----------------
//

// Event popularity
router.get("/reports/event-popularity", async (req, res) => {
  const { collegeId } = req.query;
  const replacements = { collegeId: collegeId || null };
  const whereCollege = collegeId ? "WHERE r.collegeId = :collegeId" : "";
  const sql = `
    SELECT r.eventId, e.title, COUNT(r.id) AS registrations
    FROM Registrations r
    JOIN Events e ON r.eventId = e.id
    ${whereCollege}
    GROUP BY r.eventId
    ORDER BY registrations DESC;
  `;
  const rows = await sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT,
  });
  res.json(rows);
});

// Attendance percentage
router.get("/reports/attendance-percent", async (req, res) => {
  const { collegeId, eventId } = req.query;
  const where = [];
  const replacements = {};
  if (collegeId) {
    where.push("r.collegeId = :collegeId");
    replacements.collegeId = collegeId;
  }
  if (eventId) {
    where.push("r.eventId = :eventId");
    replacements.eventId = eventId;
  }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const sql = `
    SELECT r.eventId,
      COUNT(r.id) AS totalRegistered,
      SUM(CASE WHEN r.attendanceStatus = 'present' THEN 1 ELSE 0 END) AS presentCount
    FROM Registrations r
    ${whereSql}
    GROUP BY r.eventId;
  `;
  const rows = await sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT,
  });

  for (const r of rows) {
    const e = await Event.findByPk(r.eventId);
    r.title = e ? e.title : null;
    r.attendancePercent = r.totalRegistered
      ? Math.round((r.presentCount / r.totalRegistered) * 10000) / 100
      : 0;
  }
  res.json(rows);
});

// Average feedback
router.get("/reports/avg-feedback", async (req, res) => {
  const { collegeId } = req.query;
  const whereSql = collegeId ? "WHERE f.collegeId = :collegeId" : "";
  const sql = `
    SELECT f.eventId, AVG(f.rating) as avgRating, COUNT(f.id) as feedbackCount
    FROM Feedbacks f
    ${whereSql}
    GROUP BY f.eventId;
  `;
  const rows = await sequelize.query(sql, {
    replacements: { collegeId },
    type: QueryTypes.SELECT,
  });

  for (const r of rows) {
    const e = await Event.findByPk(r.eventId);
    r.title = e ? e.title : null;
    r.avgRating = Math.round(r.avgRating * 100) / 100;
  }
  res.json(rows);
});

// Student participation
router.get("/reports/student-participation", async (req, res) => {
  const { collegeId } = req.query;
  const where = collegeId ? "WHERE r.collegeId = :collegeId" : "";
  const sql = `
    SELECT r.studentId,
      COUNT(r.id) AS eventsRegistered,
      SUM(CASE WHEN r.attendanceStatus = 'present' THEN 1 ELSE 0 END) AS eventsAttended
    FROM Registrations r
    ${where}
    GROUP BY r.studentId
    ORDER BY eventsAttended DESC;
  `;
  const rows = await sequelize.query(sql, {
    replacements: { collegeId },
    type: QueryTypes.SELECT,
  });

  for (const r of rows) {
    const s = await Student.findByPk(r.studentId);
    r.studentRoll = s ? s.studentRoll : null;
    r.name = s ? s.name : null;
  }
  res.json(rows);
});

// Top active students
router.get("/reports/top-active-students", async (req, res) => {
  const { collegeId } = req.query;
  const where = collegeId ? "WHERE r.collegeId = :collegeId" : "";
  const sql = `
    SELECT r.studentId,
      SUM(CASE WHEN r.attendanceStatus = 'present' THEN 1 ELSE 0 END) AS attended
    FROM Registrations r
    ${where}
    GROUP BY r.studentId
    ORDER BY attended DESC
    LIMIT 3;
  `;
  const rows = await sequelize.query(sql, {
    replacements: { collegeId },
    type: QueryTypes.SELECT,
  });

  for (const r of rows) {
    const s = await Student.findByPk(r.studentId);
    r.studentRoll = s ? s.studentRoll : null;
    r.name = s ? s.name : null;
  }
  res.json(rows);
});

module.exports = router;
