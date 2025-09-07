// src/seed.js
//
// Usage: npm run seed

const {
  sequelize,
  College,
  Event,
  Student,
  Registration,
  Feedback,
} = require("./models");

async function seed() {
  try {
    // Reset DB
    await sequelize.sync({ force: true });

    // 1) College
    const college = await College.create({
      id: "C001",
      name: "Reva University",
      domain: "reva.edu",
    });

    // 2) Events
    const e1 = await Event.create({
      id: "E001",
      collegeId: college.id,
      title: "AI Workshop",
      type: "workshop",
      state: "published",
    });

    const e2 = await Event.create({
      id: "E002",
      collegeId: college.id,
      title: "Tech Fest",
      type: "fest",
      state: "published",
    });

    // 3) 20 Students (S001..S020) including Kavana as S005
    const studentsData = [
      {
        id: "S001",
        studentRoll: "R001",
        name: "Akshay",
        email: "akshay@example.com",
      },
      {
        id: "S002",
        studentRoll: "R002",
        name: "Priya",
        email: "priya@example.com",
      },
      {
        id: "S003",
        studentRoll: "R003",
        name: "Ravi",
        email: "ravi@example.com",
      },
      {
        id: "S004",
        studentRoll: "R004",
        name: "Ananya",
        email: "ananya@example.com",
      },
      {
        id: "S005",
        studentRoll: "R005",
        name: "Kavana",
        email: "kavana@example.com",
      }, // Kavana
      {
        id: "S006",
        studentRoll: "R006",
        name: "Manoj",
        email: "manoj@example.com",
      },
      {
        id: "S007",
        studentRoll: "R007",
        name: "Sneha",
        email: "sneha@example.com",
      },
      {
        id: "S008",
        studentRoll: "R008",
        name: "Rahul",
        email: "rahul@example.com",
      },
      {
        id: "S009",
        studentRoll: "R009",
        name: "Divya",
        email: "divya@example.com",
      },
      {
        id: "S010",
        studentRoll: "R010",
        name: "Arjun",
        email: "arjun@example.com",
      },
      {
        id: "S011",
        studentRoll: "R011",
        name: "Meera",
        email: "meera@example.com",
      },
      {
        id: "S012",
        studentRoll: "R012",
        name: "Varun",
        email: "varun@example.com",
      },
      {
        id: "S013",
        studentRoll: "R013",
        name: "Snehal",
        email: "snehal@example.com",
      },
      {
        id: "S014",
        studentRoll: "R014",
        name: "Pooja",
        email: "pooja@example.com",
      },
      {
        id: "S015",
        studentRoll: "R015",
        name: "Deepak",
        email: "deepak@example.com",
      },
      {
        id: "S016",
        studentRoll: "R016",
        name: "Harsha",
        email: "harsha@example.com",
      },
      {
        id: "S017",
        studentRoll: "R017",
        name: "Nandini",
        email: "nandini@example.com",
      },
      {
        id: "S018",
        studentRoll: "R018",
        name: "Sanjay",
        email: "sanjay@example.com",
      },
      {
        id: "S019",
        studentRoll: "R019",
        name: "Aishwarya",
        email: "aishwarya@example.com",
      },
      {
        id: "S020",
        studentRoll: "R020",
        name: "Kiran",
        email: "kiran@example.com",
      },
    ];

    const students = await Student.bulkCreate(
      studentsData.map((s) => ({ ...s, collegeId: college.id }))
    );

    // 4) Registrations
    // Register most students to E001 (AI Workshop), some to E002 (Tech Fest),
    // and vary attendance statuses to produce realistic report numbers.
    const regs = [];
    // Register first 14 students to AI Workshop, with mixed attendance
    const statusCycle = ["present", "present", "absent", "registered", "late"];
    for (let i = 0; i < 14; i++) {
      regs.push({
        eventId: e1.id,
        studentId: students[i].id,
        collegeId: college.id,
        attendanceStatus: statusCycle[i % statusCycle.length],
      });
    }
    // Register students S001..S010 to Tech Fest with different statuses
    for (let i = 0; i < 10; i++) {
      regs.push({
        eventId: e2.id,
        studentId: students[i].id,
        collegeId: college.id,
        attendanceStatus:
          i % 3 === 0 ? "present" : i % 3 === 1 ? "registered" : "late",
      });
    }
    // Ensure Kavana (S005) is registered & present for both events
    regs.push({
      eventId: e1.id,
      studentId: students[4].id,
      collegeId: college.id,
      attendanceStatus: "present",
    });
    regs.push({
      eventId: e2.id,
      studentId: students[4].id,
      collegeId: college.id,
      attendanceStatus: "present",
    });

    // Bulk create registrations (handle duplicates by catching errors if any)
    for (const r of regs) {
      // Using try/catch to continue if a duplicate unique constraint occurs
      try {
        await Registration.create(r);
      } catch (err) {
        // ignore duplicates for idempotent seeding
      }
    }

    // 5) Feedback entries (some students give ratings)
    const feedbacksData = [
      {
        eventId: e1.id,
        studentId: students[0].id,
        collegeId: college.id,
        rating: 5,
        comments: "Excellent workshop!",
      },
      {
        eventId: e1.id,
        studentId: students[1].id,
        collegeId: college.id,
        rating: 4,
        comments: "Very useful.",
      },
      {
        eventId: e2.id,
        studentId: students[4].id,
        collegeId: college.id,
        rating: 3,
        comments: "Good, could be better.",
      }, // Kavana feedback
      {
        eventId: e2.id,
        studentId: students[9].id,
        collegeId: college.id,
        rating: 4,
        comments: "Fun fest.",
      },
    ];

    await Feedback.bulkCreate(feedbacksData);

    console.log(
      "✅ Seed completed: 1 college, 2 events, 20 students (including Kavana), registrations & feedback."
    );
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
