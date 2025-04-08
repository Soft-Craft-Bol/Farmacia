const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear un área
const crearArea = async (req, res) => {
  const { nombre } = req.body;

  try {
    const nuevaArea = await prisma.area.create({
      data: { nombre },
    });
    res.status(201).json(nuevaArea);
  } catch (error) {
    console.error("Error al crear área:", error);
    res.status(500).json({ error: "No se pudo crear el área" });
  }
};

// Obtener todas las áreas
const obtenerAreas = async (req, res) => {
  try {
    const areas = await prisma.area.findMany();
    res.json(areas);
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ error: "Error al obtener áreas" });
  }
};

// Obtener un área por ID
const obtenerAreaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const area = await prisma.area.findUnique({
      where: { id: parseInt(id) },
    });

    if (!area) {
      return res.status(404).json({ error: "Área no encontrada" });
    }

    res.json(area);
  } catch (error) {
    console.error("Error al buscar área:", error);
    res.status(500).json({ error: "Error al obtener el área" });
  }
};

// Actualizar un área
const actualizarArea = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const areaActualizada = await prisma.area.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });

    res.json(areaActualizada);
  } catch (error) {
    console.error("Error al actualizar área:", error);
    res.status(500).json({ error: "Error al actualizar el área" });
  }
};

// Eliminar un área
const eliminarArea = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.area.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Área eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar área:", error);
    res.status(500).json({ error: "Error al eliminar el área" });
  }
};


const crearAreasMultiples = async (req, res) => {
    const { areas } = req.body;
  
    if (!Array.isArray(areas)) {
      return res.status(400).json({ error: "El campo 'areas' debe ser un array." });
    }
  
    try {
      const nuevasAreas = await prisma.area.createMany({
        data: areas.map(nombre => ({ nombre })),
        skipDuplicates: true, // evita errores si ya existe un nombre único
      });
  
      res.status(201).json({
        message: "Áreas creadas correctamente",
        count: nuevasAreas.count
      });
    } catch (error) {
      console.error("Error al crear múltiples áreas:", error);
      res.status(500).json({ error: "No se pudieron insertar las áreas" });
    }
  };

  // Obtener todas las áreas asignadas a un usuario por su ID
const obtenerAreasPorUsuarioId = async (req, res) => {
  const { userId } = req.params;  // Obtén el userId desde los parámetros

  try {
    // Encuentra las áreas asociadas a este usuario a través de la tabla UserArea
    const areas = await prisma.userArea.findMany({
      where: {
        userId: parseInt(userId),  // Filtramos por el ID de usuario
      },
      include: {
        area: true,  // Incluimos las áreas asociadas
      },
    });

    if (areas.length === 0) {
      return res.status(404).json({ error: "El usuario no tiene áreas asignadas" });
    }

    // Responder con las áreas
    res.json(areas.map(userArea => userArea.area));  // Regresamos solo las áreas
  } catch (error) {
    console.error("Error al obtener áreas por usuario:", error);
    res.status(500).json({ error: "Error al obtener las áreas asignadas" });
  }
};


module.exports = {
  crearArea,
  obtenerAreasPorUsuarioId,
  obtenerAreas,
  obtenerAreaPorId,
  actualizarArea,
  eliminarArea,
  crearAreasMultiples
};


  