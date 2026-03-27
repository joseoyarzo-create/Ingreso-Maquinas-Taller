# Aplicación de Servicio Técnico - COMERCIAL SOTAVENTO LTDA.

Esta aplicación ha sido desarrollada para la gestión eficiente de ingresos, reparaciones y entregas en el taller de maquinaria.

## 🚀 Cómo Iniciar la Aplicación

1.  **Instalar dependencias**:
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    npm install
    ```

2.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

3.  **Abrir en el navegador**:
    Vite te dará una URL (ej: `http://localhost:5173`). Ábrela para empezar a usar el sistema.

## 🛠️ Configuración de Producción (Firebase)

Para que los datos sean persistentes en la nube y se sincronicen entre múltiples computadoras:

1.  Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2.  Habilita **Cloud Firestore**.
3.  Ve a "Project Settings" y registra una aplicación Web.
4.  Copia tus credenciales en el archivo `src/firebase.js`.
5.  En `src/hooks/useOrders.js`, cambia la línea `const isFirebaseEnabled = false;` a `true;`.

## 🌍 Despliegue en la Web (Vercel)

Para tener tu aplicación accesible desde cualquier lugar (celular, tablet, otra PC):

1.  **Subir a GitHub**: Sube este código a un repositorio en tu cuenta de GitHub.
2.  **Conectar con Vercel**:
    - Ve a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
    - Haz clic en **"Add New"** > **"Project"**.
    - Importa el repositorio que acabas de subir.
    - Vercel detectará automáticamente que es un proyecto **Vite**.
    - Haz clic en **"Deploy"**.
3.  **Configurar Dominio**: Una vez desplegado, Vercel te dará una dirección `.vercel.app` gratuita.

> **Nota**: Asegúrate de configurar las variables de entorno de Firebase en el panel de Vercel si decides usar la base de datos en la nube.

## 📄 Características Principales

*   **ID Automático**: ST-0001, ST-0002, etc.
*   **Gestión de Estados**: INGRESADO, EN REVISIÓN, EN REPARACIÓN, ESPERANDO REPUESTO, LISTO, AVISADO, ENTREGADO.
*   **Botón de Llamado**: Marca automáticamente como AVISADO y guarda la fecha.
*   **Generación de PDF**: Formato exacto 80mm x 297mm (tipo ticket térmico) con logo y datos del negocio.
*   **Buscador Inteligente**: Busca por ID, Cliente o Equipo al instante.
*   **Dashboard Visual**: Tarjetas de resumen para control rápido de flujo de trabajo.

## 🏢 Datos de la Empresa Configurados

*   **Nombre**: COMERCIAL SOTAVENTO LTDA.
*   **Área**: Servicio Técnico
*   **Dirección**: Ancud, Calle Pudeto 351, Chile

---
Desarrollado para uso real en taller profesional.
