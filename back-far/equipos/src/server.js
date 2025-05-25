const express = require('express');
const path = require('path');
const app = require('./app'); 
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// ✅ Servir archivos estáticos desde `uploads/`
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Archivos estáticos servidos desde: ${path.join(__dirname, '../uploads')}`);
});
