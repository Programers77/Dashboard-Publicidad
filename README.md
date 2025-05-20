
# 🚀 ADS Application

Una aplicación web moderna para la gestión de ADS, construida con [Astro](https://astro.build/), autenticación segura con [Clerk](https://clerk.dev/) y comunicación eficiente con un backend centralizado.

## 🧩 Tecnologías principales

- 🌌 **[Astro](https://astro.build/)** – Framework moderno para construir sitios rápidos y optimizados.
- 🔐 **[Clerk](https://clerk.dev/)** – Autenticación y gestión de usuarios sin complicaciones.
- 🔗 **API Backend** – Conexión a un backend para obtener, enviar y procesar datos de manera segura y eficiente.

## 📦 Estructura del proyecto


## 🔐 Autenticación con Clerk

La aplicación usa Clerk para gestionar:

- Registro e inicio de sesión de usuarios
- Sesiones seguras
- Protección de rutas
- Acceso a datos del usuario actual desde frontend y middleware

> Clerk está integrado a través de sus SDKs para Astro y se configura fácilmente con las claves del proyecto desde el archivo `.env`.

## 🌐 Comunicación con el Backend

Las peticiones al backend se realizan utilizando `fetch`, centralizadas en utilidades dentro de `src/lib/api.ts`. Estas funciones permiten:

- Obtener datos protegidos usando el token de Clerk
- Enviar formularios o datos de manera segura
- Manejar errores y respuestas de forma estandarizada

Ejemplo básico de consumo:

```ts
import { fetchWithAuth } from '../lib/api';

const data = await fetchWithAuth('/api/ads', {
  method: 'GET'
});
