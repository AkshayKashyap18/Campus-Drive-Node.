// src/models.js
/**
 * Sequelize models for Campus Drive Prototype
 * - College
 * - Student
 * - Event
 * - Registration
 * - Feedback
 *
 * Database: SQLite (for prototype), easily portable to Postgres/MySQL later
 */

const { Sequelize, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// -----------------------------
// Database initialization
// -----------------------------
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "db.sqlite"),
  logging: false, // disable SQL logs for cleaner output
});

// UUID generator helper
const genUUID = () => uuidv4();

// -----------------------------
// Models
// -----------------------------

// College
const College = sequelize.define(
  "College",
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: genUUID },
    name: { type: DataTypes.STRING, allowNull: false },
    domain: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

// Student
const Student = sequelize.define(
  "Student",
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: genUUID },
    studentRoll: { type: DataTypes.STRING, allowNull: false },
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    collegeId: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["studentRoll", "collegeId"] }],
  }
);

// Event
const Event = sequelize.define(
  "Event",
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: genUUID },
    collegeId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    type: DataTypes.STRING, // workshop/fest/seminar/etc
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    location: DataTypes.STRING,
    state: {
      type: DataTypes.STRING,
      defaultValue: "draft",
      validate: {
        isIn: [["draft", "published", "cancelled", "completed"]],
      },
    },
    eventCode: DataTypes.STRING,
  },
  { timestamps: true }
);

// Registration
const Registration = sequelize.define(
  "Registration",
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: genUUID },
    eventId: { type: DataTypes.STRING, allowNull: false },
    studentId: { type: DataTypes.STRING, allowNull: false },
    collegeId: { type: DataTypes.STRING, allowNull: false },
    registeredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    attendanceStatus: {
      type: DataTypes.STRING,
      defaultValue: "registered",
      validate: {
        isIn: [["registered", "present", "absent", "late"]],
      },
    },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["eventId", "studentId"] }],
  }
);

// Feedback
const Feedback = sequelize.define(
  "Feedback",
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: genUUID },
    eventId: { type: DataTypes.STRING, allowNull: false },
    studentId: { type: DataTypes.STRING, allowNull: false },
    collegeId: { type: DataTypes.STRING, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }, // 1–5 stars
    },
    comments: DataTypes.TEXT,
  },
  { timestamps: true }
);

// -----------------------------
// Associations
// -----------------------------
College.hasMany(Student, { foreignKey: "collegeId", onDelete: "CASCADE" });
Student.belongsTo(College, { foreignKey: "collegeId" });

College.hasMany(Event, { foreignKey: "collegeId", onDelete: "CASCADE" });
Event.belongsTo(College, { foreignKey: "collegeId" });

College.hasMany(Registration, { foreignKey: "collegeId", onDelete: "CASCADE" });
Registration.belongsTo(College, { foreignKey: "collegeId" });

College.hasMany(Feedback, { foreignKey: "collegeId", onDelete: "CASCADE" });
Feedback.belongsTo(College, { foreignKey: "collegeId" });

Student.hasMany(Registration, { foreignKey: "studentId", onDelete: "CASCADE" });
Registration.belongsTo(Student, { foreignKey: "studentId" });

Event.hasMany(Registration, { foreignKey: "eventId", onDelete: "CASCADE" });
Registration.belongsTo(Event, { foreignKey: "eventId" });

Student.hasMany(Feedback, { foreignKey: "studentId", onDelete: "CASCADE" });
Feedback.belongsTo(Student, { foreignKey: "studentId" });

Event.hasMany(Feedback, { foreignKey: "eventId", onDelete: "CASCADE" });
Feedback.belongsTo(Event, { foreignKey: "eventId" });

// -----------------------------
// Exports
// -----------------------------
module.exports = {
  sequelize,
  College,
  Student,
  Event,
  Registration,
  Feedback,
};
