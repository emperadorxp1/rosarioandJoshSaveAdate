# rosarioandJoshSaveAdate

Invitación (save the date) de la boda de Rosario y Joshua. Astro estático.

## Local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
```

## Vercel

1. En Vercel: **Add New → Project** e importar este repositorio.
2. Vercel detecta Astro solo: build `npm run build`, salida `dist`. No hace falta configurar nada.
3. Cada `git push` a `main` publica de nuevo.
4. Con dominio propio, añadir la variable `SITE_URL` (por ejemplo `https://rosarioyjoshua.com`) para que la vista previa de WhatsApp use ese dominio.

## Confirmaciones (RSVP)

Ver `apps-script/README.md`: la URL de Google Apps Script y el WhatsApp van en `src/data/wedding.ts` (`rsvp.endpoint`, `rsvp.whatsapp`).
