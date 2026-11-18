import { defineConfig } from 'astro/config';

// `site` da URLs absolutas a la vista previa de WhatsApp (og:image).
// En Vercel se toma sola del dominio de producción; con dominio propio,
// definan SITE_URL en Vercel (Settings → Environment Variables).
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export default defineConfig({
  output: 'static',
  site,
});
