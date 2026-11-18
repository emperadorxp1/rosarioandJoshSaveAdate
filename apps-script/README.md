# Invitados y confirmaciones en Google Sheets

Un solo Google Sheet con tres hojas:

- **Invitados**: la lista oficial. Ustedes llenan *Nombre en el sobre*, *Pases* y *Teléfono*. El script completa *Código*, *Link* y *WhatsApp*, y cuando el invitado responde actualiza *Estado* (Pendiente / Confirmó / No asiste), *Confirmados* y *Respondió*.
- **Confirmaciones**: cada respuesta que llega desde la invitación, con todo el detalle (alimentación, canción, mensaje…).
- **Config**: URL de la invitación (B1), mensaje de WhatsApp (B2, con `{nombre}`, `{pases}` y `{link}`), código de país (B3) y un resumen con totales.

## Instalar o actualizar el script

1. En el Sheet: **Extensiones → Apps Script**. Reemplaza todo el contenido de `Código.gs` por `Code.gs` y guarda.
2. **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar.** Así la URL `/exec` sigue siendo la misma. Si es la primera vez: **Nueva implementación → Aplicación web**, ejecutar como **Yo**, acceso **Cualquier usuario**, y pega la URL en `src/data/wedding.ts` → `rsvp.endpoint`.
3. Recarga el Sheet. Aparece el menú **💌 Boda**. Corre **Preparar hoja** y autoriza los permisos.

## Uso

- Escribe cada invitado en **Invitados**. La fila se completa sola: código, link y botón «Enviar».
- **💌 Boda → Enviar invitaciones** abre un panel con los pendientes. «Enviar por WhatsApp» abre el chat con el mensaje listo y marca *Enviado*. En el celular (app de Sheets), usa el enlace «Enviar» de la columna WhatsApp y marca la casilla a mano.
- Teléfonos de 9 dígitos se envían con el código de país de Config (51).
- **Cambio de dominio**: escribe la URL nueva en Config B1 y corre **💌 Boda → Generar / actualizar links**. Los códigos no cambian.
- No cambies los códigos de invitados ya enviados: con ellos se marca su respuesta.
