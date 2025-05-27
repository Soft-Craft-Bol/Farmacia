// equipos.test.js
const { obtenerEquipos } = require('./controllers/equipo.controller'); // Ajusta ruta
const prisma = require('./config/prisma');

prisma.equipo = {
  findMany: jest.fn()
};

describe('obtenerEquipos', () => {
  it('debe retornar una lista de equipos y código 200', async () => {
    const mockEquipos = [
      { id: 1, etiquetaActivo: 'EQ-001', componentes: [] },
      { id: 2, etiquetaActivo: 'EQ-002', componentes: [] },
    ];

    prisma.equipo.findMany.mockResolvedValue(mockEquipos);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await obtenerEquipos(req, res);

    expect(prisma.equipo.findMany).toHaveBeenCalledWith({
      include: { componentes: true }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockEquipos);
  });

  it('debe manejar errores y retornar status 500', async () => {
    prisma.equipo.findMany.mockRejectedValue(new Error('Error de prueba'));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await obtenerEquipos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error de prueba' });
  });
});
