import { Day, PrismaClient, UserSex } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Delete in dependency order to avoid FK constraint errors
  console.log("Deleting existing data...");
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.teacherClass.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.class.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.admin.deleteMany();
  console.log("Finished deleting data.");

  // ADMIN
  const adminData = [
    { username: "admin1" },
    { username: "admin2" },
  ];
  await prisma.admin.createMany({ data: adminData });
  console.log(`Created ${adminData.length} admins.`);

  // GRADE
  const gradeData = [];
  for (let i = 1; i <= 6; i++) {
    gradeData.push({ level: i });
  }
  await prisma.grade.createMany({ data: gradeData });
  const createdGrades = await prisma.grade.findMany();
  console.log(`Created ${createdGrades.length} grades.`);

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];
  await prisma.subject.createMany({ data: subjectData });
  const createdSubjects = await prisma.subject.findMany();
  console.log(`Created ${createdSubjects.length} subjects.`);

  // TEACHER
  const createdTeachers = [];
  const currentYear = new Date().getFullYear();
  for (let i = 1; i <= 15; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(currentYear - 30, 0, 1),
      },
    });
    createdTeachers.push(teacher);
  }
  console.log(`Created ${createdTeachers.length} teachers.`);

  // CLASS (and assign supervisor)
  const createdClasses = [];
  for (let i = 0; i < 6; i++) {
    const grade = createdGrades[i];
    const supervisor = createdTeachers[i]; // Assign first 6 teachers as supervisors
    const newClass = await prisma.class.create({
      data: {
        name: `${grade.level}A`,
        gradeId: grade.id,
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        supervisorId: supervisor.id,
      },
    });
    createdClasses.push(newClass);
  }
  console.log(`Created ${createdClasses.length} classes.`);

  // Teacher-Subject and Teacher-Class Relationships
  const teacherSubjectsData = [];
  const teacherClassesData = [];
  for (let i = 0; i < createdTeachers.length; i++) {
    teacherSubjectsData.push({
      teacherId: createdTeachers[i].id,
      subjectId: createdSubjects[i % createdSubjects.length].id,
    });
    teacherClassesData.push({
      teacherId: createdTeachers[i].id,
      classId: createdClasses[i % createdClasses.length].id,
    });
  }
  await prisma.teacherSubject.createMany({ data: teacherSubjectsData });
  await prisma.teacherClass.createMany({ data: teacherClassesData });
  console.log(`Created Teacher-Subject and Teacher-Class relationships.`);

  // PARENT
  const createdParents = [];
  for (let i = 1; i <= 25; i++) {
    const parent = await prisma.parent.create({
      data: {
        username: `parent${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@example.com`,
        phone: `987-654-00${i.toString().padStart(2, '0')}`,
        address: `Address${i}`,
      },
    });
    createdParents.push(parent);
  }
  console.log(`Created ${createdParents.length} parents.`);

  // STUDENT
  const createdStudents = [];
  for (let i = 1; i <= 50; i++) {
    const parent = createdParents[(i - 1) % createdParents.length];
    const classToAssign = createdClasses[(i - 1) % createdClasses.length];
    const student = await prisma.student.create({
      data: {
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: parent.id,
        gradeId: classToAssign.gradeId,
        classId: classToAssign.id,
        birthday: new Date(currentYear - 10, 0, 1),
      },
    });
    createdStudents.push(student);
  }
  console.log(`Created ${createdStudents.length} students.`);
  
  // LESSON
  const createdLessons = [];
  const dayValues = Object.values(Day) as Day[];
  for (let i = 0; i < 30; i++) {
      const lesson = await prisma.lesson.create({
          data: {
              name: `Lesson ${i + 1}`,
              day: dayValues[i % dayValues.length],
              startTime: new Date(2025, 8, i + 1, 9, 0, 0), // Example: Sept 2025 at 9am
              endTime: new Date(2025, 8, i + 1, 10, 0, 0), // Example: Sept 2025 at 10am
              subjectId: createdSubjects[i % createdSubjects.length].id,
              classId: createdClasses[i % createdClasses.length].id,
              teacherId: createdTeachers[i % createdTeachers.length].id,
          }
      });
      createdLessons.push(lesson);
  }
  console.log(`Created ${createdLessons.length} lessons.`);

  // EXAMS & ASSIGNMENTS
  const createdExams = [];
  const createdAssignments = [];
  for (let i = 0; i < 10; i++) {
      const lesson = createdLessons[i];
      const exam = await prisma.exam.create({
          data: {
              title: `Exam ${i + 1}`,
              startTime: new Date(2025, 9, i + 1, 10, 0, 0),
              endTime: new Date(2025, 9, i + 1, 11, 0, 0),
              lessonId: lesson.id,
          }
      });
      createdExams.push(exam);

      const assignment = await prisma.assignment.create({
          data: {
              title: `Assignment ${i + 1}`,
              startDate: new Date(2025, 9, i + 1, 11, 0, 0),
              dueDate: new Date(2025, 9, i + 8, 11, 0, 0), // Due one week later
              lessonId: lesson.id,
          }
      });
      createdAssignments.push(assignment);
  }
  console.log(`Created ${createdExams.length} exams and ${createdAssignments.length} assignments.`);

  // RESULTS
  for (let i = 0; i < 20; i++) {
      const student = createdStudents[i % createdStudents.length];
      if (i < 10) { // Create 10 exam results
          const exam = createdExams[i % createdExams.length];
          await prisma.result.create({
              data: {
                  score: Math.floor(Math.random() * 41) + 60, // Score between 60 and 100
                  studentId: student.id,
                  examId: exam.id,
              }
          });
      } else { // Create 10 assignment results
          const assignment = createdAssignments[i % createdAssignments.length];
           await prisma.result.create({
              data: {
                  score: Math.floor(Math.random() * 41) + 60,
                  studentId: student.id,
                  assignmentId: assignment.id,
              }
          });
      }
  }
  console.log(`Created 20 results.`);

  // ATTENDANCE
  for (const lesson of createdLessons) {
      for(const student of createdStudents) {
          // Only create attendance if the student is in the lesson's class
          if (student.classId === lesson.classId) {
              await prisma.attendance.create({
                  data: {
                      date: lesson.startTime,
                      present: Math.random() > 0.1, // 90% chance of being present
                      studentId: student.id,
                      lessonId: lesson.id,
                  }
              });
          }
      }
  }
  console.log(`Created attendance records.`);
  
  // EVENTS and ANNOUNCEMENTS
  for (const aClass of createdClasses) {
      await prisma.event.create({
          data: {
              title: `Parent-Teacher Meeting for Class ${aClass.name}`,
              description: "Discuss student progress.",
              startTime: new Date(2025, 10, 1, 17, 0, 0),
              endTime: new Date(2025, 10, 1, 19, 0, 0),
              classId: aClass.id,
          }
      });
      await prisma.announcement.create({
          data: {
              title: `Welcome to the new semester!`,
              description: `Important dates for class ${aClass.name} will be posted here.`,
              date: new Date(),
              classId: aClass.id,
          }
      });
  }
  console.log(`Created events and announcements for each class.`);


  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });