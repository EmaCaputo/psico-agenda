# PsicoAgenda - Gestión de Pacientes, Agenda y Pagos 🧠📋

Aplicación móvil local (PWA) diseñada especialmente para consultorios de psicología. Permite gestionar la agenda de turnos, historiales clínicos confidenciales, control de cobros y saldos de pacientes, con funcionamiento **100% offline**, sin costos mensuales y con total resguardo del secreto profesional.

---

## 🌟 Características Principales

### 1. 📅 Agenda & Turnos
- **Vista interactiva**: Vista diaria y tira semanal con indicador de sesiones.
- **Turnos fijos recurrentes**: Permite programar turnos que se repiten automáticamente cada semana (1, 2 o 3 meses).
- **Control de asistencia**: Estados en 1 toque (*Programada*, *Realizada*, *Cancelada por paciente*, *Cancelada por profesional*, *Ausente sin aviso*).
- **Recordatorios por WhatsApp en 1 clic**: Redacta el mensaje personalizado automáticamente y abre WhatsApp directo con el número del paciente.

### 2. 👥 Ficha Clínica de Pacientes
- Datos administrativos y de contacto: Nombre, teléfono, correo, DNI, obra social/prepaga y n° de afiliado.
- **Contacto de urgencia**: Fundamental para protocolos en salud mental.
- **Notas evolutivas / Historia clínica**: Registro de intervenciones y notas confidenciales por sesión.
- Estado de cuenta automático por paciente (sesiones debidas vs. pagadas).

### 3. 💳 Control de Cobros & Finanzas
- **Semáforo de cobros**: Notificación visual de pacientes con saldo pendiente y cuántas sesiones deben.
- **Registro rápido de pagos**: Efectivo, Transferencia bancaria, Obra Social o Tarjeta, con notas de comprobante.
- **Métricas del mes**: Total facturado, total cobrado y sesiones completadas en el mes en curso.
- **Recordatorio de cobro por WhatsApp**: Mensaje pre-redactado cordial para solicitar transferencia.
- **Exportación a Excel (CSV)**: Exporta el libro de cobros o la lista completa de pacientes en 1 clic.

### 4. 🔒 Privacidad & Copias de Respaldo
- **Almacenamiento 100% local**: Todos los datos se guardan en la memoria local del dispositivo (IndexedDB). No se envían a servidores de terceros, garantizando el secreto profesional.
- **Protección por código PIN**: Bloqueo de 4 dígitos opcional al abrir la app.
- **Respaldo descargable (.json)**: Descarga una copia de seguridad completa para guardar en iCloud / Archivos / Google Drive.
- **Restauración en 1 paso**: Permite migrar o recuperar todos los datos al cambiar de teléfono.

---

## 🚀 Cómo poner en marcha el proyecto

1. Abrir una terminal en la carpeta del proyecto:
   ```bash
   cd C:\Users\ecapu\psico-agenda
   ```

2. Iniciar el servidor local:
   ```bash
   npm run dev
   ```

3. La consola te mostrará una dirección local y una de red (por ejemplo `http://192.168.1.45:5173`).

---

## 📱 Cómo instalar en el iPhone de tu esposa (PWA)

1. Con el iPhone conectado a la **misma red Wi-Fi** que tu computadora, abre el navegador **Safari** en el teléfono.
2. Ingresa la dirección IP que te mostró la terminal (ej: `http://192.168.1.45:5173`).
3. En la barra inferior de Safari, toca el botón **Compartir** (el ícono del cuadrado con una flecha apuntando hacia arriba).
4. Desplázate hacia abajo y selecciona **"Agregar a pantalla de inicio"** (ícono de `+`).
5. Pulsa **"Agregar"** en la esquina superior derecha.

¡Listo! La aplicación aparecerá con su propio ícono en la pantalla de inicio del iPhone. Se abre a pantalla completa (sin barras de Safari) y **funciona incluso si se desconecta del Wi-Fi o viaja en modo avión**.

---

## 🌐 Opción de acceso permanente (Deploy gratuito en la nube)

Si quieres que ella pueda acceder a la aplicación desde cualquier lugar (incluso por datos móviles en la calle o consultorio sin depender de que tu computadora esté encendida), puedes subirla gratuitamente a **Vercel** o **Netlify**:

1. Sube este proyecto a un repositorio privado en GitHub.
2. En [vercel.com](https://vercel.com) conecta tu repositorio de GitHub.
3. Se generará un enlace HTTPS propio (ej: `psico-agenda-sofia.vercel.app`).
4. Ella entra a ese enlace desde Safari en su iPhone y sigue el mismo paso de **"Agregar a pantalla de inicio"**.
5. Los datos seguirán guardándose 100% en el teléfono de ella de forma local y privada.
