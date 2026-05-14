import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const commonPassword = await bcrypt.hash('password123', 10);

  console.log('Starting seed with user provided data...');

  // 1. Departments
  const departmentsData = [
    { name: 'Computer Science' },
    { name: 'Engineering' },
    { name: 'Physical Therapy' },
    { name: 'Business' },
    { name: 'Art' },
    { name: 'Nurse' }
  ];

  const deptMap: Record<string, any> = {};
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: { name: dept.name },
    });
    deptMap[dept.name] = d;
  }

  // 2. Semesters
  const semestersData = [
    { name: 'Fall 2024', startDate: new Date('2025-09-01'), endDate: new Date('2025-12-31') },
    { name: 'Spring 2025', startDate: new Date('2026-02-01'), endDate: new Date('2026-05-31') },
    { name: 'Summer 2025', startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31') }
  ];

  const semMap: Record<string, any> = {};
  for (const sem of semestersData) {
    const s = await prisma.semester.upsert({
      where: { name: sem.name },
      update: {},
      create: sem,
    });
    semMap[sem.name] = s;
  }

  // 3. Rooms
  const roomsData = [
    { roomNumber: 'A0.1', building: 'Computer Science', capacity: 150, roomType: 'LECTURE' },
    { roomNumber: 'A1.1', building: 'Computer Science', capacity: 150, roomType: 'LECTURE' },
    { roomNumber: 'A2.1', building: 'Computer Science', capacity: 150, roomType: 'LECTURE' },
    { roomNumber: 'B0.1', building: 'Computer Science', capacity: 25, roomType: 'LAB' },
    { roomNumber: 'B0.2', building: 'Computer Science', capacity: 25, roomType: 'LAB' },
    { roomNumber: 'B1.1', building: 'Computer Science', capacity: 25, roomType: 'LAB' },
    { roomNumber: 'B1.2', building: 'Computer Science', capacity: 25, roomType: 'LAB' },
    { roomNumber: 'B2.1', building: 'Computer Science', capacity: 25, roomType: 'LAB' },
    { roomNumber: 'B2.2', building: 'Computer Science', capacity: 25, roomType: 'LAB' },
    { roomNumber: 'C1.1', building: 'Computer Science', capacity: 25, roomType: 'SECTION' },
    { roomNumber: 'C2.1', building: 'Computer Science', capacity: 25, roomType: 'SECTION' },
    { roomNumber: 'C3.1', building: 'Computer Science', capacity: 25, roomType: 'SECTION' },
    { roomNumber: 'C3.2', building: 'Computer Science', capacity: 25, roomType: 'SECTION' },
    { roomNumber: 'B3.1', building: 'Computer Science', capacity: 25, roomType: 'ELECTRONICS LAB' }
  ];

  const roomMap: Record<string, any> = {};
  for (const room of roomsData) {
    const r = await prisma.room.upsert({
      where: { roomNumber: room.roomNumber },
      update: {},
      create: {
        roomNumber: room.roomNumber,
        building: room.building,
        capacity: room.capacity,
        roomType: room.roomType.toUpperCase()
      },
    });
    roomMap[room.roomNumber] = r;
  }

  // 4. Employees & Users
  const employeesData = [
    { first: 'Abdullah', last: 'Hossam Siam', email: 'ahjjkljksarfim414@gmail.com', phone: '0155415450', job: 'Professor', staff: 'ACADEMIC', dept: 'Computer Science', salary: 13500, role: 'TEACHER' },
    { first: 'Ahmed', last: 'Hassan', email: 'ahmed.hassan@uni.edu', phone: '0101234567', job: 'Professor', staff: 'ACADEMIC', dept: 'Business', salary: 15000, role: 'TEACHER' },
    { first: 'Sara', last: 'Ali', email: 'sara.ali@uni.edu', phone: '0112345678', job: 'Assistant Professor', staff: 'ACADEMIC', dept: 'Art', salary: 12000, role: 'TEACHER' },
    { first: 'Mohamed', last: 'Kamal', email: 'mohamed.kamal@uni.edu', phone: '0123456789', job: 'Lecturer', staff: 'ACADEMIC', dept: 'Nurse', salary: 10000, role: 'TEACHER' },
    { first: 'Nour', last: 'Ibrahim', email: 'nour.ibrahim@uni.edu', phone: '0134567890', job: 'Professor', staff: 'ACADEMIC', dept: 'Physical Therapy', salary: 15000, role: 'TEACHER' },
    { first: 'Omar', last: 'Samir', email: 'omar.samir@uni.edu', phone: '0145678901', job: 'Dean', staff: 'ACADEMIC', dept: 'Computer Science', salary: 20000, role: 'DEAN' },
    { first: 'Mona', last: 'Fathy', email: 'mona.fathy@uni.edu', phone: '0156789012', job: 'Dean', staff: 'ACADEMIC', dept: 'Engineering', salary: 20000, role: 'DEAN' },
    { first: 'Khaled', last: 'Mostafa', email: 'khaled.mostafa@uni.edu', phone: '0167890123', job: 'HR Manager', staff: 'NON-ACADEMIC', dept: null, salary: 8100, role: 'ADMIN' },
    { first: 'Hana', last: 'Youssef', email: 'hana.youssef@uni.edu', phone: '0178901234', job: 'Security', staff: 'NON-ACADEMIC', dept: null, salary: 4100, role: 'ADMIN' }
  ];

  const empMap: Record<string, any> = {};
  for (const emp of employeesData) {
    const userRole = emp.role;
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: { role: userRole },
      create: {
        email: emp.email,
        password: commonPassword,
        role: userRole
      }
    });

    const e = await prisma.employee.upsert({
      where: { email: emp.email },
      update: {
        firstName: emp.first,
        lastName: emp.last,
        departmentId: emp.dept ? deptMap[emp.dept].id : null,
        staffType: emp.staff,
        salary: emp.salary,
        userId: user.id
      },
      create: {
        firstName: emp.first,
        lastName: emp.last,
        email: emp.email,
        phone: emp.phone,
        jobTitle: emp.job,
        staffType: emp.staff,
        salary: emp.salary,
        departmentId: emp.dept ? deptMap[emp.dept].id : null,
        userId: user.id
      }
    });
    empMap[emp.email] = e;
  }

  // Assign Deans
  await prisma.department.update({ where: { name: 'Computer Science' }, data: { deanId: empMap['omar.samir@uni.edu'].id } });
  await prisma.department.update({ where: { name: 'Engineering' }, data: { deanId: empMap['mona.fathy@uni.edu'].id } });

  // 5. Students
  const studentsData = [
    { first: 'Abdullah', last: 'Hossam Siam', email: 'abdullahhossam414@gmail.com', birth: '2006-04-14', enroll: '2024-07-15', dept: 'Computer Science', gpa: 2.39 },
    { first: 'Ali', last: 'Mohamed', email: 'ali.mohamed@uni.edu', birth: '2002-05-10', enroll: '2022-09-01', dept: 'Computer Science', gpa: 3.50 },
    { first: 'Nada', last: 'Ahmed', email: 'nada.ahmed@uni.edu', birth: '2003-01-15', enroll: '2022-09-01', dept: 'Engineering', gpa: 3.20 },
    { first: 'Omar', last: 'Khaled', email: 'omar.khaled@uni.edu', birth: '2001-11-20', enroll: '2021-09-01', dept: 'Physical Therapy', gpa: 2.90 },
    { first: 'Laila', last: 'Hassan', email: 'laila.hassan@uni.edu', birth: '2002-07-08', enroll: '2022-09-01', dept: 'Business', gpa: 3.75 },
    { first: 'Youssef', last: 'Ali', email: 'youssef.ali@uni.edu', birth: '2003-03-25', enroll: '2023-09-01', dept: 'Art', gpa: 3.10 },
    { first: 'Mariam', last: 'Samir', email: 'mariam.samir@uni.edu', birth: '2002-09-14', enroll: '2022-09-01', dept: 'Computer Science', gpa: 3.60 },
    { first: 'Karim', last: 'Ibrahim', email: 'karim.ibrahim@uni.edu', birth: '2001-06-30', enroll: '2021-09-01', dept: 'Engineering', gpa: 2.80 },
    { first: 'Dina', last: 'Mostafa', email: 'dina.mostafa@uni.edu', birth: '2003-12-05', enroll: '2023-09-01', dept: 'Physical Therapy', gpa: 3.90 },
    { first: 'Tamer', last: 'Youssef', email: 'tamer.youssef@uni.edu', birth: '2002-02-18', enroll: '2022-09-01', dept: 'Business', gpa: 3.40 },
    { first: 'Salma', last: 'Fathy', email: 'salma.fathy@uni.edu', birth: '2003-08-22', enroll: '2023-09-01', dept: 'Nurse', gpa: 3.55 }
  ];

  const studMap: Record<string, any> = {};
  for (const s of studentsData) {
    const userRole = 'STUDENT';
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { role: userRole },
      create: {
        email: s.email,
        password: commonPassword,
        role: userRole
      }
    });

    const student = await prisma.student.upsert({
      where: { email: s.email },
      update: {
        firstName: s.first,
        lastName: s.last,
        gpa: s.gpa,
        departmentId: deptMap[s.dept].id,
        userId: user.id
      },
      create: {
        firstName: s.first,
        lastName: s.last,
        email: s.email,
        birthDate: new Date(s.birth),
        enrollmentDate: new Date(s.enroll),
        gpa: s.gpa,
        departmentId: deptMap[s.dept].id,
        userId: user.id
      }
    });
    studMap[s.email] = student;
  }

  // 6. Courses
  const coursesData = [
    { name: 'Database Systems', hours: 3, dept: 'Computer Science' },
    { name: 'Data Structures', hours: 3, dept: 'Computer Science' },
    { name: 'Operating Systems', hours: 3, dept: 'Computer Science' },
    { name: 'Circuit Analysis', hours: 3, dept: 'Engineering' },
    { name: 'Thermodynamics', hours: 3, dept: 'Engineering' },
    { name: 'Human Anatomy', hours: 3, dept: 'Physical Therapy' },
    { name: 'Physical Rehabilitation', hours: 3, dept: 'Physical Therapy' },
    { name: 'Financial Accounting', hours: 3, dept: 'Business' },
    { name: 'Marketing Principles', hours: 3, dept: 'Business' },
    { name: 'Drawing Fundamentals', hours: 3, dept: 'Art' },
    { name: 'Nursing Ethics', hours: 3, dept: 'Nurse' }
  ];

  const courseMap: Record<string, any> = {};
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { id: coursesData.indexOf(c) + 1 }, // Fallback to avoid duplicates if name exists
      create: {
        name: c.name,
        creditHours: c.hours,
        departmentId: deptMap[c.dept].id
      },
      update: {}
    });
    courseMap[c.name] = course;
  }

  // 7. Schedule
  const scheduleData = [
    { course: 'Database Systems', emp: 'ahjjkljksarfim414@gmail.com', room: 'A0.1', sem: 'Fall 2024', day: 'Sunday', start: '08:00', end: '10:00' },
    { course: 'Data Structures', emp: 'ahjjkljksarfim414@gmail.com', room: 'A0.1', sem: 'Fall 2024', day: 'Monday', start: '10:00', end: '12:00' },
    { course: 'Operating Systems', emp: 'ahmed.hassan@uni.edu', room: 'A1.1', sem: 'Fall 2024', day: 'Tuesday', start: '08:00', end: '10:00' },
    { course: 'Circuit Analysis', emp: 'sara.ali@uni.edu', room: 'A2.1', sem: 'Fall 2024', day: 'Wednesday', start: '10:00', end: '12:00' },
    { course: 'Thermodynamics', emp: 'mohamed.kamal@uni.edu', room: 'B0.1', sem: 'Spring 2025', day: 'Thursday', start: '08:00', end: '10:00' },
    { course: 'Human Anatomy', emp: 'nour.ibrahim@uni.edu', room: 'B0.2', sem: 'Spring 2025', day: 'Sunday', start: '12:00', end: '14:00' },
    { course: 'Physical Rehabilitation', emp: 'nour.ibrahim@uni.edu', room: 'B1.1', sem: 'Spring 2025', day: 'Monday', start: '08:00', end: '10:00' },
    { course: 'Financial Accounting', emp: 'ahmed.hassan@uni.edu', room: 'B1.2', sem: 'Summer 2025', day: 'Tuesday', start: '10:00', end: '12:00' },
    { course: 'Marketing Principles', emp: 'sara.ali@uni.edu', room: 'B2.1', sem: 'Summer 2025', day: 'Wednesday', start: '08:00', end: '10:00' },
    { course: 'Drawing Fundamentals', emp: 'omar.samir@uni.edu', room: 'B2.2', sem: 'Fall 2024', day: 'Thursday', start: '10:00', end: '12:00' },
    { course: 'Nursing Ethics', emp: 'mona.fathy@uni.edu', room: 'C1.1', sem: 'Spring 2025', day: 'Sunday', start: '08:00', end: '10:00' }
  ];

  const schList: any[] = [];
  for (const s of scheduleData) {
    const sch = await prisma.schedule.create({
      data: {
        courseId: courseMap[s.course].id,
        employeeId: empMap[s.emp].id,
        roomId: roomMap[s.room].id,
        semesterId: semMap[s.sem].id,
        dayOfWeek: s.day.toUpperCase(),
        startTime: s.start,
        endTime: s.end
      }
    });
    schList.push(sch);
  }

  // 8. Enrollments
  const enrollmentsData = [
    { stud: 'abdullahhossam414@gmail.com', schIdx: 0, grade: 85, status: 'ACTIVE' },
    { stud: 'abdullahhossam414@gmail.com', schIdx: 1, grade: 90, status: 'ACTIVE' },
    { stud: 'ali.mohamed@uni.edu', schIdx: 0, grade: 78, status: 'ACTIVE' },
    { stud: 'ali.mohamed@uni.edu', schIdx: 2, grade: 88, status: 'ACTIVE' },
    { stud: 'nada.ahmed@uni.edu', schIdx: 3, grade: 72, status: 'ACTIVE' },
    { stud: 'omar.khaled@uni.edu', schIdx: 4, grade: 95, status: 'ACTIVE' },
    { stud: 'laila.hassan@uni.edu', schIdx: 5, grade: 65, status: 'ACTIVE' },
    { stud: 'youssef.ali@uni.edu', schIdx: 6, grade: 80, status: 'ACTIVE' },
    { stud: 'mariam.samir@uni.edu', schIdx: 7, grade: 70, status: 'COMPLETED' },
    { stud: 'karim.ibrahim@uni.edu', schIdx: 8, grade: 92, status: 'COMPLETED' },
    { stud: 'dina.mostafa@uni.edu', schIdx: 9, grade: 55, status: 'DROPPED' },
    { stud: 'tamer.youssef@uni.edu', schIdx: 10, grade: 88, status: 'ACTIVE' },
    { stud: 'salma.fathy@uni.edu', schIdx: 0, grade: 76, status: 'ACTIVE' }
  ];

  const enrMap: Record<number, any> = {};
  for (let i = 0; i < enrollmentsData.length; i++) {
    const en = enrollmentsData[i];
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: studMap[en.stud].id,
        scheduleId: schList[en.schIdx].id,
        grade: en.grade,
        status: en.status
      }
    });
    enrMap[i] = enrollment;
  }

  // 9. Exams
  const examData = [
    { schIdx: 0, date: '2025-12-10', start: '09:00', room: 'A0.1', type: 'MIDTERM' },
    { schIdx: 0, date: '2026-01-10', start: '09:00', room: 'A0.1', type: 'FINAL' }
  ];
  for (const ex of examData) {
    await prisma.exam.create({
      data: {
        scheduleId: schList[ex.schIdx].id,
        examDate: new Date(ex.date),
        startTime: ex.start,
        roomId: roomMap[ex.room].id,
        examType: ex.type
      }
    });
  }

  // 10. Fees
  const feesData = [
    { stud: 'abdullahhossam414@gmail.com', sem: 'Fall 2024', amount: 15000, paid: 15000, due: '2025-10-01', status: 'PAID' },
    { stud: 'ali.mohamed@uni.edu', sem: 'Fall 2024', amount: 15000, paid: 10000, due: '2025-10-01', status: 'PARTIAL' },
    { stud: 'nada.ahmed@uni.edu', sem: 'Fall 2024', amount: 15000, paid: 0, due: '2025-10-01', status: 'UNPAID' }
  ];
  for (const f of feesData) {
    await prisma.fee.create({
      data: {
        studentId: studMap[f.stud].id,
        semesterId: semMap[f.sem].id,
        amount: f.amount,
        paidAmount: f.paid,
        dueDate: new Date(f.due),
        status: f.status
      }
    });
  }

  // 11. Scholarships
  const scholarshipsData = [
    { stud: 'abdullahhossam414@gmail.com', name: 'Excellence Scholarship', amount: 5000, start: '2024-09-01', end: '2025-06-30' }
  ];
  for (const s of scholarshipsData) {
    await prisma.scholarship.create({
      data: {
        studentId: studMap[s.stud].id,
        name: s.name,
        amount: s.amount,
        startDate: new Date(s.start),
        endDate: new Date(s.end)
      }
    });
  }

  // 12. Attendance
  const attendanceData = [
    { enrIdx: 0, date: '2025-09-05', status: 'PRESENT' },
    { enrIdx: 0, date: '2025-09-12', status: 'PRESENT' },
    { enrIdx: 0, date: '2025-09-19', status: 'ABSENT' }
  ];
  for (const a of attendanceData) {
    await prisma.attendance.create({
      data: {
        enrollmentId: enrMap[a.enrIdx].id,
        date: new Date(a.date),
        status: a.status
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
