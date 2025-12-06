/**
 * servicio controller
 */

import { factories } from "@strapi/strapi";
import domicilio from "../../domicilio/controllers/domicilio";

export default factories.createCoreController("api::servicio.servicio", {
  async getServiciosByRuta(ctx) {
    try {
      const rutaDocumentId = ctx.params.id; // documentId de la ruta
      if (!rutaDocumentId) {
        return ctx.badRequest("Se requiere el documentId de la ruta");
      }

      // Buscar servicios asociados a la ruta
      const servicios = await strapi.db
        .query("api::servicio.servicio")
        .findMany({
          where: {
            ruta: {
              documentId: { $eq: rutaDocumentId },
            },
          },
          populate: [
            "domicilio",
            "estado_servicio",
            "tipo_servicio",
            "cliente",
            "ruta",
          ],
        });

      return { data: servicios };
    } catch (error) {
      console.error("Error en getServiciosByRuta:", error);
      return ctx.internalServerError("Error interno del servidor");
    }
  },

  // async getServiciosByRuta(ctx) {
  //   try {
  //     const rutaDocumentId = ctx.params.id; // documentId de la ruta
  //     if (!rutaDocumentId) {
  //       return ctx.badRequest("Se requiere el documentId de la ruta");
  //     }

  //     // Buscar servicios asociados a la ruta
  //     const servicios = await strapi.db
  //       .query("api::servicio.servicio")
  //       .findMany({
  //         where: {
  //           ruta: {
  //             documentId: { $eq: rutaDocumentId },
  //           },
  //         },
  //         populate: {
  //           cliente: true, // cliente directo del servicio
  //           domicilio: {
  //             populate: ["cliente"], // cliente desde domicilio
  //           },
  //           estado_servicio: true,
  //           tipo_servicio: true,
  //           ruta: {
  //             populate: {
  //               personal: {
  //                 populate: {
  //                   users_permissions_user: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });

  //     return { data: servicios };
  //   } catch (error) {
  //     console.error("Error en getServiciosByRuta:", error);
  //     return ctx.internalServerError("Error interno del servidor");
  //   }
  // },

  async find(ctx) {
    console.log("Datos de usuario: ", ctx.state.user);
    const user = ctx.state.user;
    if (user.role.type == "operador") {
      // modificar el ctx para agregar el filtro por usuario
      ctx.query = {
        // ...ctx.query, //mantener los filtros originales
        populate: {
          domicilio: true,
          estado_servicio: true,
          tipo_servicio: true,
          ruta: {
            populate: {
              personal: {
                populate: {
                  users_permissions_user: true,
                },
              },
            },
          },
        },
        filters: {
          ruta: {
            personal: {
              users_permissions_user: {
                id: {
                  $eq: user.id,
                },
              },
            },
          },
        },
      };
      const result = await super.find(ctx); // obtener datos originales
      return result; //obtener los datos
    } // }else{
    //     ctx.query = {
    //         populate:{
    //             domicilio:true,
    //             cliente:true,
    //             ruta:true,
    //         }
    //     }
    // }

    if (user.role.type == "administrador" || user.role.type == "callcenter") {
      const result = await super.find(ctx); // obtener datos originales
      return result; //obtener los datos
    }
  },

  // async update(ctx){
  //     const user = ctx.state.user;
  //     if(user.role.type == 'operador' ){
  //         console.log(ctx.request.body.data)
  //         ctx.request.body.data = {
  //             "estado_servicio":ctx.request.body.data.estado_servicio
  //         };
  //     }
  //     const result = await super.update(ctx)
  //     return result;
  // },

  // async update(ctx){
  //     const user = ctx.state.user;
  //     console.log("Usuario que intenta actualizar: ", user);

  //     if(user.role.type === 'operador'){
  //         const documentId = ctx.params.id;
  //         console.log("DocumentId recibido en update: ", documentId);
  //         console.log("Datos enviados en body ORIGINAL: ", ctx.request.body.data);

  //         const servicio = await strapi.db.query('api::servicio.servicio').findOne({
  //             where: { documentId },
  //             populate:{
  //                 ruta:{
  //                     populate:{
  //                         personal:{
  //                             populate:{
  //                                 users_permissions_user:true
  //                             }
  //                         }
  //                     }
  //                 }
  //             }
  //         });

  //         console.log("Servicio encontrado: ", servicio);

  //         if(!servicio){
  //             console.log(" Servicio no encontrado para documentId:", documentId);
  //             return ctx.notFound('Servicio no encontrado');
  //         }

  //         const pertenece = servicio.ruta.personal.users_permissions_user.id === user.id;
  //         console.log("Pertenece al operador?: ", pertenece);

  //         if(!pertenece){
  //             console.log(" El usuario no tiene permiso para modificar este servicio.");
  //             return ctx.unauthorized('No puedes actualizar este servicio');
  //         }

  //         ctx.request.body.data = {
  //             estado_servicio: ctx.request.body.data.estado_servicio
  //         };
  //         console.log("Body filtrado SOLO con estado_servicio: ", ctx.request.body.data);
  //     }

  //     console.log("Ejecutando super.update con datos finales...");
  //     const result = await super.update(ctx);
  //     console.log("Resultado de la actualización: ", result);
  //     return result;
  // }

  async update(ctx) {
    const user = ctx.state.user;
    const documentId = ctx.params.id;
    if (user.role.type == "operador") {
      //Trae el servicio que esta guardado en la base de datos
      const servicio = await strapi
        .documents("api::servicio.servicio")
        .findOne({
          documentId: documentId,
          filters: {
            ruta: {
              personal: {
                users_permissions_user: {
                  id: {
                    $eq: user.id,
                  },
                },
              },
            },
          },
        });
      console.log("Servicio a modificar", servicio);
      //Si el servicio no existe o no pertenece al usuario, retornar un error
      if (!servicio) {
        return ctx.unauthorized(
          `No tienes permiso para modificar este servicio`
        );
      }
      ctx.request.body.data = {
        ...ctx.request.body.data,
      };
    }
    const result = await super.update(ctx);
    return result;
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const documentId = ctx.params.id;

    if (user.role.type == "operador") {
      // Buscar el servicio y verificar si pertenece al usuario
      const servicio = await strapi
        .documents("api::servicio.servicio")
        .findOne({
          documentId: documentId,
          filters: {
            ruta: {
              personal: {
                users_permissions_user: {
                  id: {
                    $eq: user.id,
                  },
                },
              },
            },
          },
        });

      if (!servicio) {
        return ctx.unauthorized(
          "No tienes permiso para eliminar este servicio"
        );
      }
    }

    // Si pasa la validación, ejecuta el delete del core controller
    const result = await super.delete(ctx);
    console.log(
      `Servicio con documentId ${documentId} eliminado correctamente.`
    );
    return result;
  },

  // async findByFecha(ctx) {
  //   try {
  //     // Convertimos los query params a string explícitamente
  //     const inicio = String(ctx.query.inicio);
  //     const fin = ctx.query.fin ? String(ctx.query.fin) : inicio; // si no hay fin, usamos inicio

  //     if (!inicio) {
  //       return ctx.badRequest("Se requiere la fecha de inicio");
  //     }

  //     // Convertimos a Date
  //     const inicioDia = new Date(inicio);
  //     inicioDia.setHours(0, 0, 0, 0);

  //     const finDia = new Date(fin);
  //     finDia.setHours(23, 59, 59, 999);

  //     const servicios = await strapi.db
  //       .query("api::servicio.servicio")
  //       .findMany({
  //         where: {
  //           createdAt: {
  //             $gte: inicioDia,
  //             $lte: finDia,
  //           },
  //         },
  //         populate: ["domicilio", "ruta", "tipo_servicio", "estado_servicio"],
  //       });

  //     return servicios;
  //   } catch (error) {
  //     console.error("Error en findByFecha:", error);
  //     return ctx.internalServerError("Error interno del servidor");
  //   }
  // },
  async findByFecha(ctx) {
    try {
      console.log("======= FIND BY FECHA =======");

      // Convertimos los query params a string explícitamente
      const inicio = String(ctx.query.inicio);
      const fin = ctx.query.fin ? String(ctx.query.fin) : inicio;

      console.log("Query params recibidos:");
      console.log("inicio:", inicio);
      console.log("fin:", fin);

      if (!inicio) {
        return ctx.badRequest("Se requiere la fecha de inicio");
      }

      // --- Convertimos a Date local ---
      const inicioDia = new Date(inicio);
      inicioDia.setHours(0, 0, 0, 0);

      const finDia = new Date(fin);
      // Pasamos al día siguiente y usamos $lt para incluir todo el día final
      finDia.setDate(finDia.getDate() + 1);
      finDia.setHours(0, 0, 0, 0);

      console.log("=== Fechas interpretadas por el backend ===");
      console.log("InicioDia (local):", inicioDia.toString());
      console.log("FinDia (local, día siguiente):", finDia.toString());
      console.log("InicioDia (UTC enviado a DB):", inicioDia.toISOString());
      console.log("FinDia (UTC enviado a DB):", finDia.toISOString());

      // --- Consulta Strapi ---
      const servicios = await strapi.db
        .query("api::servicio.servicio")
        .findMany({
          where: {
            createdAt: {
              $gte: inicioDia,
              $lt: finDia, // < día siguiente
            },
          },
          populate: ["domicilio", "ruta", "tipo_servicio", "estado_servicio"],
        });

      console.log("Servicios encontrados:", servicios.length);

      return servicios;
    } catch (error) {
      console.error("Error en findByFecha:", error);
      return ctx.internalServerError("Error interno del servidor");
    }
  },
});
