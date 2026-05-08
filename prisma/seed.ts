import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      password,
      role: 'ADMIN',
    },
  });

  // 2. Create Departments
  const departments = [
    { name: 'CS' },
    { name: 'Engineering' },
    { name: 'Nursing' },
    { name: 'Art' },
    { name: 'Business' },
    { name: 'Physical Therapy' }
  ];

  const createdDepts = [];
  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: { name: dept.name },
    });
    createdDepts.push(d);
  }

  const deptMap = Object.fromEntries(createdDepts.map(d => [d.name, d]));

  // 3. Create Employees
  const employeesData = [
    { firstName: 'Abdullah', lastName: 'Hossam Siam', email: 'abdullah@iu.edu.eg', dept: 'CS', title: 'Professor' },
    { firstName: 'Nada', lastName: 'Ebrahim', email: 'nada@iu.edu.eg', dept: 'Engineering', title: 'Assistant Professor' },
    { firstName: 'Rawan', lastName: 'Tamer', email: 'rawan@iu.edu.eg', dept: 'Nursing', title: 'Lecturer' },
    { firstName: 'Menna', lastName: 'Ahmed', email: 'menna@iu.edu.eg', dept: 'CS', title: 'Dean' }
  ];

  for (const emp of employeesData) {
    const deptId = deptMap[emp.dept]?.id;
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        departmentId: deptId,
        staffType: 'TEACHER',
        jobTitle: emp.title
      },
      create: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: '123456789',
        jobTitle: emp.title,
        staffType: 'TEACHER',
        salary: 10000,
        departmentId: deptId,
      },
    });
  }

  // 4. Create Rooms
  await prisma.room.upsert({
    where: { roomNumber: 'A1.1' },
    update: {},
    create: { roomNumber: 'A1.1', building: 'Building A', capacity: 30, roomType: 'CLASSROOM' }
  });
  await prisma.room.upsert({
    where: { roomNumber: 'A1.2' },
    update: {},
    create: { roomNumber: 'A1.2', building: 'Building A', capacity: 25, roomType: 'LAB' }
  });
  
  const roomA11 = await prisma.room.findUnique({ where: { roomNumber: 'A1.1' } });
  const abdullah = await prisma.employee.findFirst({ where: { firstName: 'Abdullah' } });

  // 5. Create Courses
  let cs101 = await prisma.course.findFirst({ where: { name: 'Introduction to Programming' } });
  if (!cs101) {
    cs101 = await prisma.course.create({
      data: {
        name: 'Introduction to Programming',
        creditHours: 3,
        departmentId: deptMap['CS'].id,
      },
    });
  } else {
    await prisma.course.update({
      where: { id: cs101.id },
      data: { departmentId: deptMap['CS'].id }
    });
  }

  let eng101 = await prisma.course.findFirst({ where: { name: 'Engineering Physics' } });
  if (!eng101) {
    eng101 = await prisma.course.create({
      data: {
        name: 'Engineering Physics',
        creditHours: 4,
        departmentId: deptMap['Engineering'].id,
      },
    });
  } else {
    await prisma.course.update({
      where: { id: eng101.id },
      data: { departmentId: deptMap['Engineering'].id }
    });
  }

  // 6. Create Semesters
  const fall2025 = await prisma.semester.upsert({
    where: { name: 'Fall 2025' },
    update: {},
    create: {
      name: 'Fall 2025',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-20'),
    },
  });

  // 7. Create Schedule
  const scheduleCount = await prisma.schedule.count();
  if (scheduleCount === 0) {
    await prisma.schedule.create({
      data: {
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '11:00',
        courseId: cs101.id,
        employeeId: abdullah!.id,
        roomId: roomA11!.id,
        semesterId: fall2025.id,
      },
    });
  }

  // 8. Create Students
  const aliceEmail = 'alice@student.edu';
  await prisma.student.upsert({
    where: { email: aliceEmail },
    update: { departmentId: deptMap['CS'].id },
    create: {
      firstName: 'Alice',
      lastName: 'Winston',
      email: aliceEmail,
      birthDate: new Date('2003-05-15'),
      gpa: 3.8,
      departmentId: deptMap['CS'].id,
    },
  });

  const alice = await prisma.student.findUnique({ where: { email: aliceEmail } });
  const firstSchedule = await prisma.schedule.findFirst();

  // 9. Enroll Student
  if (alice && firstSchedule) {
    const enrollmentCount = await prisma.enrollment.count({ where: { studentId: alice.id } });
    if (enrollmentCount === 0) {
      await prisma.enrollment.create({
        data: {
          studentId: alice.id,
          scheduleId: firstSchedule.id,
          status: 'ACTIVE',
        },
      });
    }

    // 10. Fees
    const feeCount = await prisma.fee.count({ where: { studentId: alice.id } });
    if (feeCount === 0) {
      await prisma.fee.create({
        data: {
          amount: 5000,
          paidAmount: 2000,
          dueDate: new Date('2025-10-01'),
          status: 'PARTIAL',
          studentId: alice.id,
          semesterId: fall2025.id,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
