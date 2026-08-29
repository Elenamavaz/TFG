// Campos alineados con CiudadResponse del backend -- 2026-08-16: "descripcion"
// pasó a llamarse "historia" (mismo nombre que Cofradia/Paso/Evento para lo
// mismo) y se añadieron provincia/patrimonio/activa para el panel de
// Administrador (mockup del 2026-08-16). "numCofradiasEstimado" se añadió
// ese mismo día y se quitó también ese mismo día (V25 luego V28): el número
// real de cofradías ya se ve en vivo contando GET /cofradias?ciudadId=, un
// campo aparte solo podía quedar desactualizado. latitud/longitud recuperadas
// el 2026-08-23 (ver arranqueCiudadano.js/geo.js): pueden venir a null, una
// ciudad creada sin coordenadas simplemente no entra en "ciudad más cercana".
export class Ciudad {
  constructor({
    id,
    nombre,
    comunidadAutonoma,
    provincia = null,
    historia = null,
    patrimonio = null,
    activa = true,
    latitud = null,
    longitud = null,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.comunidadAutonoma = comunidadAutonoma;
    this.provincia = provincia;
    this.historia = historia;
    this.patrimonio = patrimonio;
    this.activa = activa;
    this.latitud = latitud;
    this.longitud = longitud;
  }
}
