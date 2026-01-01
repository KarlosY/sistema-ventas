# Sistema de Ventas

Sistema de ventas profesional construido con Next.js, TypeScript y MySQL. La aplicación sigue principios de arquitectura limpia para separar las preocupaciones del dominio, la aplicación y la infraestructura.

## Tecnologías Utilizadas

- **Framework:** [Next.js](https://nextjs.org) 14+
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org)
- **Base de Datos:** MySQL 8.0+
- **Autenticación:** JWT (JSON Web Tokens) con bcrypt
- **Estilos:** [Tailwind CSS](https://tailwindcss.com)
- **Arquitectura:** Limpia (Dominio, Aplicación, Infraestructura)
- **Librerías:** jose (Edge-compatible JWT), mysql2, recharts, react-day-picker

## Instalación y Configuración

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/KarlosY/sistema-ventas.git
cd sistema-ventas
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar la Base de Datos MySQL

1.  Instala MySQL 8.0+ en tu sistema o usa un servidor MySQL existente.
2.  Abre MySQL Workbench o tu cliente MySQL preferido.
3.  Ejecuta el script de base de datos completo ubicado en `db_ventas_web_professional.sql` en la raíz del proyecto.

    Este script creará:
    - Base de datos `db_ventas_web`
    - Tablas: `categories`, `products`, `sales`, `sale_details`, `users`, `profiles`, `customers`, `suppliers`
    - Triggers para auditoría automática
    - Datos de ejemplo para pruebas
    - Usuario administrador por defecto:
      - Email: `admin@sistema.com`
      - Password: `admin123`



### 4. Configurar las Variables de Entorno

1.  Crea un archivo `.env.local` en la raíz del proyecto.
2.  Copia el contenido de `.env.example` y ajusta los valores según tu configuración:

    ```env
    # Base de datos MySQL
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=tu_password_aqui
    DB_NAME=db_ventas_web

    # Autenticación JWT
    JWT_SECRET=cambia_este_secreto_por_uno_super_seguro_en_produccion
    JWT_EXPIRES_IN=7d

    # Configuración
    NODE_ENV=development
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

    **Importante:** Cambia `JWT_SECRET` por un valor único y seguro en producción.

### 5. Ejecutar la Aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en funcionamiento.

## Funcionalidades Implementadas

- **Autenticación y Seguridad:**
  - Sistema de login con JWT y cookies httpOnly
  - Encriptación de contraseñas con bcrypt
  - Middleware de protección de rutas
  - Control de acceso basado en roles (Administrador/Vendedor)
  - Bloqueo de cuenta por intentos fallidos
  
- **Gestión de Productos y Categorías:**
  - CRUD completo de productos con paginación y búsqueda
  - Gestión de categorías con creación dinámica
  - Control de inventario y stock
  - Validación de datos en tiempo real
  
- **Registro de Ventas:**
  - Carrito de compras interactivo
  - Filtrado de productos por categoría
  - Descuento automático de stock
  - Validación de stock disponible
  - Registro de detalles de venta
  
- **Reportes y Análisis:**
  - Dashboard con resumen de ventas (día/mes)
  - Historial completo de ventas con filtros por fecha
  - Gráficos de tendencias de ventas
  - Top productos más vendidos
  - Exportación de datos a CSV
  - Paginación de resultados
  
- **UI/UX Profesional:**
  - Diseño responsive con Tailwind CSS
  - Notificaciones toast no intrusivas
  - Indicadores de carga
  - Estados vacíos mejorados
  - Navegación intuitiva
  - Formato de moneda en Soles Peruanos (S/)

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

© 2025 Karlos Berrios - Ykar.NET
