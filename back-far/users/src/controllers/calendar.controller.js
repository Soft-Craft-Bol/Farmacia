const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");

exports.getCaledar = async (req, res) => {
    try {
      const Calendar = await prisma.calendar.findMany({
        include: { tecnico: true },
      });
      res.json(calendars);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener calendars" });
    }
};

exports.createCalendar = async (req, res) => {
    try {
      const { equipo, tipo, fecha, tecnicoId, correo, importante } = req.body;
  
      const nuevoCalendar = await prisma.calendar.create({
        data: { equipo, tipo, fecha, tecnicoId, correo, importante },
      });
  
      res.status(201).json(nuevoCalendar);
    } catch (error) {
      res.status(500).json({ error: "Error al crear calendar" });
    }
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tu_correo@gmail.com",
      pass: "tu_contraseña",
    },
});

exports.sendReminderEmails = async (req, res) => {
    try {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + 1); 
  
      const calendar = await prisma.mantenimiento.findMany({
        where: { fecha: { gte: hoy } },
      });
  
      calendar.forEach(async (mant) => {
        const mailOptions = {
          from: "tu_correo@gmail.com",
          to: mant.correo,
          subject: `🔔 Recordatorio de Mantenimiento: ${mant.equipo}`,
          text: `Hola, recuerda que el mantenimiento de ${mant.equipo} está programado para el ${mant.fecha}.`,
        };
  
        await transporter.sendMail(mailOptions);
      });
  
      res.json({ message: "Correos enviados correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al enviar recordatorios" });
    }
};

