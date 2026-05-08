import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const isDomainUser = email.endsWith("@iu.edu.eg");

      let user = await prisma.user.findUnique({
        where: { email },
        include: { employee: true, student: true },
      });

      if (!user && isDomainUser) {
        // Auto-register if domain matches
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "ADMIN",
          },
          include: { employee: true, student: true },
        });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Bypass password check for the specific domain if requested, 
      // otherwise standard check
      if (!isDomainUser) {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          details: user.employee || user.student,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await prisma.department.findMany({
        include: { dean: true, _count: { select: { employees: true, students: true } } },
      });
      res.json(departments);
    } catch (error: any) {
      console.error("Fetch departments error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/departments", async (req, res) => {
    const { name, deanId } = req.body;
    try {
      const dept = await prisma.department.create({
        data: { name, deanId: deanId ? parseInt(deanId) : null },
      });
      res.json(dept);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Students
  app.get("/api/students", async (req, res) => {
    try {
      const students = await prisma.student.findMany({
        include: { department: true },
      });
      res.json(students);
    } catch (error: any) {
      console.error("Fetch students error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      console.log("[POST] Creating student with data:", req.body);
      const { departmentId, ...rest } = req.body;
      const student = await prisma.student.create({
        data: {
          ...rest,
          birthDate: new Date(rest.birthDate),
          departmentId: departmentId ? parseInt(departmentId) : null,
        },
      });
      res.json(student);
    } catch (error: any) {
      console.error("[POST] Create student error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Employees
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await prisma.employee.findMany({
        include: { department: true },
      });
      res.json(employees);
    } catch (error: any) {
      console.error("Fetch employees error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const { departmentId, ...rest } = req.body;
      const employee = await prisma.employee.create({
        data: {
          ...rest,
          salary: parseFloat(rest.salary),
          departmentId: departmentId ? parseInt(departmentId) : null,
          hireDate: rest.hireDate ? new Date(rest.hireDate) : new Date(),
        },
      });
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await prisma.course.findMany({ include: { department: true } });
      res.json(courses);
    } catch (error: any) {
      console.error("Fetch courses error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const { departmentId, ...rest } = req.body;
      const course = await prisma.course.create({
        data: {
          ...rest,
          creditHours: parseInt(rest.creditHours),
          departmentId: departmentId ? parseInt(departmentId) : null,
        },
      });
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rooms
  app.get("/api/rooms", async (req, res) => {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  });

  // Semesters
  app.get("/api/semesters", async (req, res) => {
    const semesters = await prisma.semester.findMany();
    res.json(semesters);
  });

  app.post("/api/semesters", async (req, res) => {
    try {
      const semester = await prisma.semester.create({ data: req.body });
      res.json(semester);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Enrollments
  app.get("/api/enrollments", async (req, res) => {
    const enrollments = await prisma.enrollment.findMany({
      include: { student: true, schedule: { include: { course: true } } },
    });
    res.json(enrollments);
  });

  app.post("/api/enrollments", async (req, res) => {
    try {
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: parseInt(req.body.studentId),
          scheduleId: parseInt(req.body.scheduleId),
          status: req.body.status || "ACTIVE",
        },
      });
      res.json(enrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    try {
      const { scheduleId, date } = req.query;
      const where: any = {};
      if (scheduleId) where.enrollment = { scheduleId: parseInt(scheduleId as string) };
      if (date) {
        const startOfDay = new Date(date as string);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date as string);
        endOfDay.setHours(23, 59, 59, 999);
        where.date = { gte: startOfDay, lte: endOfDay };
      }

      const attendance = await prisma.attendance.findMany({
        include: { enrollment: { include: { student: true } } },
        where,
      });
      res.json(attendance);
    } catch (error: any) {
      console.error("Fetch attendance error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const { records } = req.body; // Array of { enrollmentId, status, date }
      const results = await prisma.$transaction(
        records.map((record: any) =>
          prisma.attendance.upsert({
            where: {
              // Note: We don't have a unique constraint on date+enrollmentId in schema, 
              // but we should probably handle it or use a separate ID if provided.
              // For now, assume creation if no ID, or logic to find existing.
              id: record.id || -1,
            },
            update: {
              status: record.status,
              date: new Date(record.date),
            },
            create: {
              enrollmentId: parseInt(record.enrollmentId),
              status: record.status,
              date: new Date(record.date),
            },
          })
        )
      );
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Fees
  app.get("/api/fees", async (req, res) => {
    try {
      const fees = await prisma.fee.findMany({
        include: { student: true, semester: true },
      });
      res.json(fees);
    } catch (error: any) {
      console.error("Fetch fees error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fees", async (req, res) => {
    try {
      const fee = await prisma.fee.create({
        data: {
          ...req.body,
          amount: parseFloat(req.body.amount),
          paidAmount: parseFloat(req.body.paidAmount || 0),
          dueDate: new Date(req.body.dueDate),
          studentId: parseInt(req.body.studentId),
          semesterId: parseInt(req.body.semesterId),
        },
      });
      res.json(fee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/fees/:id", async (req, res) => {
    try {
      const fee = await prisma.fee.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...req.body,
          amount: parseFloat(req.body.amount),
          paidAmount: parseFloat(req.body.paidAmount),
          dueDate: new Date(req.body.dueDate),
        },
      });
      res.json(fee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/fees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid fee ID" });
      console.log(`Deleting fee: ${id}`);
      await prisma.fee.delete({ where: { id } });
      res.json({ message: "Fee deleted" });
    } catch (error: any) {
      console.error("Delete fee error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Scholarships
  app.get("/api/scholarships", async (req, res) => {
    try {
      const scholarships = await prisma.scholarship.findMany({
        include: { student: true },
      });
      res.json(scholarships);
    } catch (error: any) {
      console.error("Fetch scholarships error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scholarships", async (req, res) => {
    try {
      const scholarship = await prisma.scholarship.create({
        data: {
          ...req.body,
          amount: parseFloat(req.body.amount),
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          studentId: parseInt(req.body.studentId),
        },
      });
      res.json(scholarship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/scholarships/:id", async (req, res) => {
    try {
      const scholarship = await prisma.scholarship.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...req.body,
          amount: parseFloat(req.body.amount),
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
        },
      });
      res.json(scholarship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/scholarships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid scholarship ID" });
      console.log(`Deleting scholarship: ${id}`);
      await prisma.scholarship.delete({ where: { id } });
      res.json({ message: "Scholarship deleted" });
    } catch (error: any) {
      console.error("Delete scholarship error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Delete Routes
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid student ID" });

      const student = await prisma.student.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!student) return res.status(404).json({ message: "Student not found" });

      if (student.userId) {
        // Deleting the user will cascade to the student record due to onDelete: Cascade in schema
        await prisma.user.delete({ where: { id: student.userId } });
      } else {
        // Fallback for students without associated users
        await prisma.student.delete({ where: { id } });
      }

      res.json({ message: "Student deleted" });
    } catch (error: any) {
      console.error("Delete student error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid employee ID" });

      const employee = await prisma.employee.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!employee) return res.status(404).json({ message: "Employee not found" });

      if (employee.userId) {
        // Deleting the user will cascade to the employee record
        await prisma.user.delete({ where: { id: employee.userId } });
      } else {
        await prisma.employee.delete({ where: { id } });
      }

      res.json({ message: "Employee deleted" });
    } catch (error: any) {
      console.error("Delete employee error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Deleting course ${id}`);
      await prisma.course.delete({ where: { id } });
      res.json({ message: "Course deleted" });
    } catch (error: any) {
      console.error("Delete course error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Deleting department ${id}`);
      await prisma.department.delete({ where: { id } });
      res.json({ message: "Department deleted" });
    } catch (error: any) {
      console.error("Delete department error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Deleting schedule slot ${id}`);
      await prisma.schedule.delete({ where: { id } });
      res.json({ message: "Schedule slot deleted" });
    } catch (error: any) {
      console.error("Delete schedule error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Update Routes
  app.put("/api/students/:id", async (req, res) => {
    try {
      const { departmentId, ...rest } = req.body;
      const student = await prisma.student.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...rest,
          birthDate: new Date(rest.birthDate),
          departmentId: departmentId ? parseInt(departmentId) : null,
        },
      });
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const { departmentId, ...rest } = req.body;
      const employee = await prisma.employee.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...rest,
          salary: parseFloat(rest.salary),
          departmentId: departmentId ? parseInt(departmentId) : null,
        },
      });
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const { departmentId, ...rest } = req.body;
      const course = await prisma.course.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...rest,
          creditHours: parseInt(rest.creditHours),
          departmentId: departmentId ? parseInt(departmentId) : null,
        },
      });
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const { name, deanId } = req.body;
      const dept = await prisma.department.update({
        where: { id: parseInt(req.params.id) },
        data: { name, deanId: deanId ? parseInt(deanId) : null },
      });
      res.json(dept);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Schedules
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await prisma.schedule.findMany({
        include: { 
          course: { include: { department: true } }, 
          teacher: { include: { department: true } }, 
          room: true, 
          semester: true 
        },
      });
      res.json(schedules);
    } catch (error: any) {
      console.error("Fetch schedules error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      // Basic conflict check
      const { roomId, employeeId, dayOfWeek, startTime, endTime, semesterId } = req.body;
      
      const conflict = await prisma.schedule.findFirst({
        where: {
          semesterId: parseInt(semesterId),
          dayOfWeek,
          OR: [
            { roomId: parseInt(roomId) },
            { employeeId: parseInt(employeeId) }
          ],
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } }
          ]
        }
      });

      if (conflict) {
        return res.status(400).json({ message: "Room or Teacher already scheduled for this time" });
      }

      const schedule = await prisma.schedule.create({
        data: {
          ...req.body,
          courseId: parseInt(req.body.courseId),
          employeeId: parseInt(req.body.employeeId),
          roomId: parseInt(req.body.roomId),
          semesterId: parseInt(req.body.semesterId),
        },
      });
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const [students, employees, departmentsCount, courses, schedules, fees, departmentsDetails] = await Promise.all([
        prisma.student.count(),
        prisma.employee.count(),
        prisma.department.count(),
        prisma.course.count(),
        prisma.schedule.count({ where: { semester: { endDate: { gte: new Date() } } } }),
        prisma.fee.aggregate({ _sum: { paidAmount: true, amount: true } }),
        prisma.department.findMany({
          include: {
            _count: {
              select: { students: true, employees: true }
            }
          }
        })
      ]);

      res.json({
        totalStudents: students,
        totalEmployees: employees,
        totalDepartments: departmentsCount,
        totalCourses: courses,
        activeCourses: schedules,
        totalRevenue: fees._sum.paidAmount || 0,
        totalOutstanding: (fees._sum.amount || 0) - (fees._sum.paidAmount || 0),
        departments: departmentsDetails
      });
    } catch (error: any) {
      console.error("Fetch stats error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // For any request that doesn't match an API route or a static file, serve index.html
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        res.status(404).json({ message: "API route not found" });
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
