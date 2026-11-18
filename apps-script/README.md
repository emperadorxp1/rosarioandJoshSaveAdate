# Confirmaciones en Google Sheets

1. Crea una hoja nueva en Google Sheets (por ejemplo "RSVP Boda R&J").
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `Code.gs`. Guarda.
3. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
4. Autoriza los permisos y copia la **URL de la aplicación web** (termina en `/exec`).
5. Pégala en `src/data/wedding.ts` → `rsvp.endpoint`.
6. Pon su número de WhatsApp (con 51 delante, solo dígitos) en `rsvp.whatsapp`.
7. Vuelve a publicar la web (`npm run build`).

Cada confirmación llega como una fila: fecha, invitado del link, pases, nombre, asiste, cantidad, alimentación, canción, team y mensaje.

Si cambian el código del script, hagan **Implementar → Administrar implementaciones → Editar → Nueva versión** para que la URL siga funcionando.
