// src/components/auth.js

(function () {
  const rutasProtegidas = [
    "/",
    "/pautas",
    "/campana",
    "/modelo",
    "/wallet",
    "/presupuesto",
    "/publicidades",
    "/dashboard",
  ];

  const estaProtegida = rutasProtegidas.some((ruta) =>
    window.location.pathname.startsWith(ruta)
  );

  if (!estaProtegida) return;

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
  }
})();
