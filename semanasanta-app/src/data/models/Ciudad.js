// Campos alineados con CiudadResponse del backend (ver backend/src/main/java/
// com/semanasanta/backend/dto/CiudadResponse.java) -- 2026-08-15: se quitaron
// numProcesiones/numCofrades/latitud/longitud, que existían en el mock/diseño
// de Figura original pero nunca se implementaron en el backend. Sin
// latitud/longitud, la preselección de ciudad por GPS más cercana
// (arranqueCiudadano.js) ya no es posible; queda pendiente si se recupera
// añadiendo esos campos al backend más adelante.
export class Ciudad {
  constructor({ id, nombre, comunidadAutonoma, descripcion = null }) {
    this.id = id;
    this.nombre = nombre;
    this.comunidadAutonoma = comunidadAutonoma;
    this.descripcion = descripcion;
  }
}
