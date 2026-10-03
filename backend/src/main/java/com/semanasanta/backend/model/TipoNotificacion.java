package com.semanasanta.backend.model;

// Tabla C.10 del Apéndice C, ampliada: valores posibles de notificaciones.tipo.
// Sustituye a TipoAlerta -- decisión del 2026-08-20: ya no hay dos jerarquías
// (Aviso/Alerta) con un enum solo para una de las dos, sino un único tipo con
// un enum único. Se quitaron CORTE_CALLE/METEOROLOGIA/SEGURIDAD (no se usaban
// para nada distinto en la UI -el color de la tarjeta ya se decide solo por
// Prioridad, ver Alerta.js del cliente antes de esta refactorización-; el
// detalle de "qué ha pasado" va en Notificacion.mensaje como texto libre, no
// hace falta una categoría propia). INICIO/FIN los genera el propio sistema
// al cambiar el estado de una procesión a EN_CURSO/FINALIZADO desde su
// formulario (ver ProcesionService.actualizar -> NotificacionService.
// crearAutomatica), nunca la Junta a mano -- NotificacionService.crear() los
// rechaza explícitamente. ACTUALIZACION (2026-09-30, mockup "Procesión
// Actualizada" -> "Crear Notificación"): aviso opcional tras editar una
// procesión (historia, recorrido, pasos...), sin ser incidencia ni horario.
//
// Título de la notificación (2026-10-03, opción "B" que eligió Elena para la
// tarjeta de Inicio): Notificacion.titulo guarda SOLO el nombre de la
// procesión/evento; "qué ha pasado" sale de aquí (etiqueta). La app pinta
// los dos por separado y el push los junta ("Cancelación: <nombre>").
public enum TipoNotificacion {
    INICIO("Ha comenzado"),
    FIN("Ha finalizado"),
    INCIDENCIA("Incidencia"),
    CAMBIO_HORARIO("Cambio de horario"),
    CANCELACION("Cancelación"),
    ACTUALIZACION("Actualización");

    private final String etiqueta;

    TipoNotificacion(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
