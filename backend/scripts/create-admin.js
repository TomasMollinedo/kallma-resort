import bcrypt from "bcryptjs";
import { pool } from "../src/config/database.js";

/**
 * Script para crear un usuario Administrador inicial
 * Uso: node scripts/create-admin.js
 */

const createAdminUser = async () => {
  const client = await pool.connect();

  try {
    console.log("🚀 Iniciando creación de usuario Administrador...\n");

    await client.query("BEGIN");

    // Datos del administrador
    const adminData = {
      email: "admin@kallmaresort.com",
      password: "Admin123!",
      nombre: "Administrador del Sistema",
      telefono: "+54 9 11 0000-0000",
      dni: "00000000",
    };

    // Verificar si ya existe un admin con ese email
    const existingAdmin = await client.query(
      "SELECT id_usuario, email FROM usuario WHERE email = $1",
      [adminData.email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("⚠️  Ya existe un usuario con el email:", adminData.email);
      console.log("   ID:", existingAdmin.rows[0].id_usuario);
      await client.query("ROLLBACK");
      client.release();
      process.exit(0);
    }

    // Obtener el ID del rol "Administrador"
    const roleResult = await client.query(
      "SELECT id_rol_usuario FROM rol_usuario WHERE nom_rol = $1",
      ["Administrador"]
    );

    if (roleResult.rows.length === 0) {
      console.error("❌ Error: No se encontró el rol 'Administrador' en la base de datos.");
      console.error("   Asegúrate de que la tabla rol_usuario esté poblada correctamente.");
      await client.query("ROLLBACK");
      client.release();
      process.exit(1);
    }

    const adminRolId = roleResult.rows[0].id_rol_usuario;

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insertar el usuario administrador
    const insertResult = await client.query(
      `INSERT INTO usuario 
       (email, password, nombre, telefono, dni, id_rol_usuario, esta_activo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
       RETURNING id_usuario, email, nombre, telefono, dni`,
      [
        adminData.email.toLowerCase(),
        hashedPassword,
        adminData.nombre,
        adminData.telefono,
        adminData.dni,
        adminRolId,
      ]
    );

    await client.query("COMMIT");
    client.release();

    const newAdmin = insertResult.rows[0];

    console.log("✅ Usuario Administrador creado exitosamente!\n");
    console.log("📋 Detalles del usuario:");
    console.log("   ID:       ", newAdmin.id_usuario);
    console.log("   Email:    ", newAdmin.email);
    console.log("   Nombre:   ", newAdmin.nombre);
    console.log("   Teléfono: ", newAdmin.telefono);
    console.log("   DNI:      ", newAdmin.dni);
    console.log("   Rol:       Administrador");
    console.log("   Activo:    true\n");
    console.log("🔑 Credenciales de acceso:");
    console.log("   Email:    ", adminData.email);
    console.log("   Password: ", adminData.password);
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!\n");

    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    console.error("❌ Error al crear usuario administrador:", error.message);
    process.exit(1);
  }
};

// Ejecutar el script
createAdminUser();
