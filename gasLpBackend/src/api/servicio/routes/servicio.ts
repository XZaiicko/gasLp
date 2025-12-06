/**
 * servicio router
 */

import { factories } from "@strapi/strapi";

// export default factories.createCoreRouter('api::servicio.servicio');
export default {
  routes: [
    {
      method: "GET",
      path: "/servicios",
      handler: "servicio.find",
    },
    {
      method: "POST",
      path: "/servicios",
      handler: "servicio.create",
    },
    {
      method: "PUT",
      path: "/servicios/:id",
      handler: "servicio.update",
    },
    {
      method: "DELETE",
      path: "/servicios/:id",
      handler: "servicio.delete",
    },
    {
      method: "GET",
      path: "/servicios-by-ruta/:id",
      handler: "servicio.getServiciosByRuta",
    },
    {
      method: "GET",
      path: "/servicios/fecha",
      handler: "servicio.findByFecha",
    },
  ],
};
