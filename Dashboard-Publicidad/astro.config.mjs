// @ts-check
import { defineConfig } from 'astro/config';
  
export default defineConfig({
  vite: {
    server: {
      host: "0.0.0.0", // Permite conexiones desde cualquier IP en la red local
      port: 4321, // Puerto por defecto de Astro (puedes cambiarlo)
      strictPort: true, // Evita que Vite cambie el puerto si está ocupado
    },
  },
  devToolbar: {
    enabled: false
  },
});
