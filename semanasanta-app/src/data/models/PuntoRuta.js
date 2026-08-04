// <<abstract>> PuntoRuta: elemento que compone un Recorrido. PuntoDeInteres
// es su única especialización concreta por ahora.
export class PuntoRuta {
  constructor({ id, horaEnviada = null }) {
    if (new.target === PuntoRuta) {
      throw new Error('PuntoRuta es una clase abstracta: no se puede instanciar directamente.');
    }
    this.id = id;
    this.horaEnviada = horaEnviada;
  }
}
