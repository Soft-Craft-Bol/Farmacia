# **Sistema de Gestión Integral de Mantenimiento (SGIM)**  
**Versión 1.0**  

---

## **📌 Descripción General**  
El **Sistema de Gestión Integral de Mantenimiento (SGIM)** es una plataforma modular diseñada para optimizar la planificación, ejecución y seguimiento de actividades de mantenimiento en entornos industriales, laboratorios o instalaciones técnicas.  

Combina:  
✅ **Gestión de equipos** (inventario, mantenimientos preventivos/correctivos)  
✅ **Gestión de trabajos** (órdenes de trabajo, asignación de técnicos)  
✅ **Gestión de usuarios** (roles, permisos, áreas de responsabilidad)  
✅ **Planificación inteligente** (calendario, Kanban, cronogramas)  
✅ **Predicción de fechas de mantenimiento** (ajuste automático basado en eventos no planificados)  

---

## **🎯 Objetivos**  
1. **Automatizar** el registro y seguimiento de mantenimientos.  
2. **Optimizar** la asignación de recursos (técnicos, equipos, repuestos).  
3. **Predecir** fechas de mantenimiento basado en datos históricos.  
4. **Centralizar** toda la información en una única plataforma.  
5. **Generar informes** para análisis de costos y eficiencia.  

---

## **📋 Alcance del Sistema**  

### **1️⃣ Módulo de Gestión de Equipos**  
- Registro de equipos (datos técnicos, ubicación, proveedores).  
- Control de mantenimientos (preventivos, correctivos, predictivos).  
- Documentación asociada (manuales, imágenes, certificados).  
- **Cálculo de próxima fecha de mantenimiento**:  
  - Si un mantenimiento se realiza antes/después de lo programado, el sistema recalcula automáticamente la siguiente fecha basándose en:  
    - Intervalo definido (ej: cada 180 días).  
    - Horas de uso acumuladas.  
    - Historial de fallos.  

### **2️⃣ Módulo de Gestión de Trabajos**  
- Creación y seguimiento de órdenes de trabajo.  
- **Kanban visual** (Pendiente → En Progreso → Finalizado).  
- Asignación de técnicos y priorización.  
- Registro de tiempo y materiales utilizados.  

### **3️⃣ Módulo de Usuarios y Permisos**  
- Autenticación y autorización (JWT).  
- Roles personalizados (Administrador, Técnico, Supervisor).  
- Gestión de áreas (ej: "Laboratorio A", "Taller B").  

### **4️⃣ Módulo de Planificación (Calendario/Cronograma)**  
- Vista mensual/semanal de mantenimientos programados.  
- Alertas por email (recordatorios de fechas críticas).  
- Sincronización con Google Calendar/Outlook.  

### **5️⃣ Dashboard Analítico**  
- Gráficos de:  
  - Mantenimientos realizados vs. pendientes.  
  - Tiempo promedio de reparación.  
  - Costos por equipo/área.  

---

## **⚙️ Tecnologías Utilizadas**  
- **Backend**: Node.js + Express + Prisma (PostgreSQL).  
- **Frontend**: React.js + Vite.js.  
- **Autenticación**: JWT + Bcrypt.  
- **Planificación**: FullCalendar.js (para el módulo de calendario).  
- **Comunicación entre módulos**: API REST + RabbitMQ (para eventos asíncronos).  



## **📄 Conclusión**  
El **SGIM** es una solución **todo-en-uno** para empresas que necesitan:  
✔ **Reducir tiempos de inactividad** de equipos.  
✔ **Mejorar la trazabilidad** de mantenimientos.  
✔ **Tomar decisiones basadas en datos**.  

**🔗 ¿Preguntas?** Contacta al equipo de desarrollo.  

--- 

