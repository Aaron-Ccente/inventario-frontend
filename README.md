# Sistema de Inventario PNP

Sistema de gestión de inventario para la Policía Nacional del Perú (PNP) con frontend en React y backend en Node.js.

## Características

- ✅ Gestión de categorías de inventario
- ✅ Creación de categorías con validación de nombres únicos
- ✅ Dashboard moderno y responsive
- ✅ Tema claro/oscuro
- ✅ Autenticación de usuarios
- ✅ API RESTful

## Estructura del Proyecto

```
frontInventario/    # Frontend en React + Vite
├──public
├──src       
   ├──assets
   ├──components
   ├──config
   ├──contexts
   ├──hooks
   ├──styles

```

## Requisitos Previos

- npm o yarn

## Configuración del Frontend

1. **Navegar al directorio del frontend:**
   ```bash
   cd frontInventario
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

El frontend estará disponible en `http://localhost:5173`

## API Endpoints

### Categorías
- `GET /category` - Obtener todas las categorías
- `POST /category` - Crear nueva categoría
- `GET /category/:id` - Obtener categoría por ID
- `PUT /category/:id` - Actualizar categoría
- `DELETE /category/:id` - Eliminar categoría

### Usuarios
- `POST /user/register` - Registrar usuario
- `POST /user/login` - Iniciar sesión

### Artículos
- `GET /article` - Obtener todos los artículos
- `POST /article` - Crear nuevo artículo
- `GET /article/:id` - Obtener artículo por ID
- `PUT /article/:id` - Actualizar artículo
- `DELETE /article/:id` - Eliminar artículo

### Movimientos
- `POST /movement` - Crear nuevo movimiento de artículo
- `GET /movement/articulo/:id_articulo` - Obtener historial de movimientos de un artículo
- `GET /movement` - Obtener todos los movimientos del sistema

## Funcionalidades Implementadas

### Dashboard
- ✅ Cambio de título de "Categorías del Inventario" a "Categorías"
- ✅ Botón para crear nuevas categorías
- ✅ Modal para crear categorías con **selección de iconos**
- ✅ **30 iconos disponibles** para elegir al crear categorías
- ✅ **Funcionalidad completa de Editar y Eliminar** categorías con modales
- ✅ **Campo de descripción** para cada categoría
- ✅ **Conteo real de artículos** por categoría (no más ceros)
- ✅ **Eliminación en cascada** - elimina categoría y artículos relacionados
- ✅ Validación de nombres únicos en el backend
- ✅ Conexión con API del backend
- ✅ Carga dinámica de categorías desde la base de datos

### Gestión de Artículos
- ✅ Modal para crear artículos con campos completos
- ✅ **Modal completo para editar artículos** con todos los campos
- ✅ **Modal de confirmación para eliminar artículos**
- ✅ Campos: código, nombre, unidad, detalle, fecha_vencimiento, otros, stock
- ✅ **IDs únicos por categoría** - no globales
- ✅ Validación de códigos únicos por categoría en el backend
- ✅ Creación automática en tabla categoria_articulo
- ✅ **Eliminación en cascada** de artículos con transacciones
- ✅ Tabla actualizada con campos: código, nombre, unidad, detalle, stock
- ✅ Carga dinámica de artículos por categoría
- ✅ **Botones de acción funcionales** para editar y eliminar artículos
- ✅ **Conteo automático actualizado** en dashboard al crear/editar/eliminar artículos

### Sistema de Movimientos de Inventario
- ✅ **Registro de entradas y salidas** de artículos con validación automática
- ✅ **Control de stock en tiempo real** con verificación de disponibilidad
- ✅ **Cálculo automático de nuevo stock** después de cada movimiento
- ✅ **Campo de costo unitario obligatorio** para entradas (no para salidas)
- ✅ **Documentos de respaldo** (facturas, remitos, etc.) para auditoría
- ✅ **Detalles descriptivos** de cada movimiento (proveedor, motivo, etc.)
- ✅ **Historial completo de movimientos** por artículo con resumen estadístico
- ✅ **Descarga en PDF** del historial completo con formato oficial de la PNP (sin dependencias adicionales)
- ✅ **Transacciones seguras** con rollback automático en caso de errores
- ✅ **Validación de stock insuficiente** para salidas
- ✅ **Resumen visual del movimiento** antes de confirmar

### Backend
- ✅ Validación de nombres únicos para categorías
- ✅ Validación de códigos únicos para artículos
- ✅ Creación automática de relaciones categoria_articulo
- ✅ Manejo de errores HTTP apropiados
- ✅ CORS configurado para frontend
- ✅ Estructura de base de datos con tablas relacionadas

## Uso

1. **Crear Categoría:** Haz clic en el botón "+" junto al título "Categorías"
   - Escribe el nombre de la categoría
   - Selecciona un icono de los 30 disponibles
   - Agrega una descripción (opcional)
2. **Editar Categoría:** Haz clic en el icono de lápiz azul en la vista de categoría
   - Modifica nombre, icono y descripción
   - Confirma los cambios
3. **Eliminar Categoría:** Haz clic en el icono de papelera roja en la vista de categoría
   - **Eliminación en cascada automática** - elimina categoría y todos los artículos relacionados
   - Mensaje de advertencia si la categoría tiene artículos
   - Confirmación de la eliminación
4. **Navegar:** Haz clic en cualquier categoría para ver su contenido
5. **Crear Artículo:** En cualquier categoría, haz clic en "Agregar Artículo"
   - **Los códigos son únicos por categoría** (puedes usar "1" en Químicos y "1" en Equipos)
6. **Gestionar Artículos:** 
   - **Editar:** Haz clic en el icono de lápiz azul 🔵 (más grande y funcional) para modificar todos los campos del artículo con el mismo diseño visual que el modal de crear
   - **Eliminar:** Haz clic en el icono de papelera roja 🔴 (más grande y funcional) para eliminar el artículo con confirmación
   - **Conteo automático:** El número de artículos se actualiza automáticamente en el dashboard
   - **Iconos mejorados:** Los botones de acción son más grandes (w-6 h-6) y tienen tooltips informativos
   - **Registrar Movimiento:** Haz clic en el icono verde ➕ para registrar entradas o salidas del artículo
   - **Ver Historial:** Haz clic en el icono púrpura 📋 para ver el historial completo de movimientos
   - **Descargar PDF:** En el historial, usa el botón verde "Descargar PDF" para obtener un reporte oficial de la PNP
7. **Tema:** Usa el botón de cambio de tema en la esquina superior derecha

## Tecnologías Utilizadas

- **Frontend:** React, Vite, Tailwind CSS
- **Autenticación:** JWT (implementación básica)

## Notas de Desarrollo

- El frontend se conecta al backend en `http://localhost:8081`
- Las categorías se cargan dinámicamente desde la base de datos
- Los artículos se cargan dinámicamente por categoría
- Se incluyen categorías de ejemplo en la migración inicial
- El sistema valida nombres únicos antes de crear categorías
- El sistema valida códigos únicos antes de crear artículos
- Los artículos se crean automáticamente en la tabla categoria_articulo
- Interfaz responsive con tema claro/oscuro
- Modal para crear artículos con validación completa
- **Eliminación en cascada** con transacciones de base de datos para mantener integridad
- **Conteo real de artículos** por categoría usando JOINs optimizados