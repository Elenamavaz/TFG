# Simulador de procesión

Simula una procesión en curso para probar el seguimiento en tiempo real sin salir a la calle con varios móviles. Hace lo mismo que la app del cofrade:
1. Entra con un código de acceso.
2. Envía pings de ubicación por **N cofrades virtuales** repartidos a lo largo del cortejo, de la cabeza a la cola.
3. Los cofrades avanzan por el recorrido real de la procesión (el GPX importado).

Requisitos que permite probar:

| Requisito | Qué se comprueba |
|---|---|
| RF-24 | Los pings de los cofrades se aceptan mientras la procesión está *En curso* y el Mapa en Vivo muestra la estela avanzando. |
| RF-25 | Las ubicaciones erróneas (saltos de GPS lejos del recorrido) se descartan: el resumen muestra *erróneos guardados: 0*. |
| Estados | Con `--iniciar`/`--finalizar`, los ciudadanos reciben "Ha comenzado" / "Ha finalizado". Al finalizar, el backend deja de aceptar pings (410). |

## Requisitos previos

- **Node 18 o superior**, sin instalar nada más.
- El backend arrancado (por defecto `http://localhost:8080`).
- Una procesión **con recorrido importado** (GPX) y un **código de acceso de cofrade** de una cofradía que participe en ella (en la app: *Junta → Cofradías → Códigos de acceso*).

## Uso

Desde la raíz del repositorio:

```bash
# Ver la ayuda con todas las opciones
node herramientas/simulador-procesion/simular-procesion.mjs --ayuda

# Ver las procesiones de una ciudad, su estado y si tienen recorrido
node herramientas/simulador-procesion/simular-procesion.mjs --listar --ciudad 1

# Simular la procesión 3, que ya está "En curso" (cambiada a mano desde la app)
node herramientas/simulador-procesion/simular-procesion.mjs --procesion 3 --codigo AB12CD34

# Lo mismo, pero que el propio simulador la ponga En curso y la finalice al acabar
node herramientas/simulador-procesion/simular-procesion.mjs --procesion 3 --codigo AB12CD34 \
  --iniciar --finalizar --junta-email junta@ejemplo.es --junta-password 'Clave.123'

# Contra el servidor desplegado en vez del local
node herramientas/simulador-procesion/simular-procesion.mjs --api http://virtual.lab.inf.uva.es:20102 --procesion 3 --codigo AB12CD34
```

Mientras se ejecuta, abre la app en el móvil → **Mapa en Vivo** (o Inicio → *En curso ahora*). En cada ronda la consola muestra cuántos pings se han guardado y cuántos se han descartado, y la estela que calcula el backend:

```
17:30:27 ronda   3 · ✔ 5 guardados · ✖ 1 descartados · [██████████████··········] cola 12.0% · cabeza 29.3% · 15 activos
```

Al terminar (la cola llega al final del recorrido, o Ctrl+C) se imprime un resumen.

## Opciones de la simulación

| Opción | Por defecto | Qué hace |
|---|---|---|
| `--cofrades <n>` | 5 | Cofrades virtuales compartiendo ubicación. |
| `--longitud <m>` | 250 | Metros entre la cabeza y la cola del cortejo. |
| `--velocidad <km/h>` | 1.5 | Velocidad de la procesión (una real va a 1–2 km/h). |
| `--acelerar <x>` | 10 | Factor de tiempo: con 10, un recorrido de 3 km tarda unos 12 minutos en lugar de 2 horas. |
| `--intervalo <s>` | 10 | Segundos reales entre rondas de pings. Debe ser menor de 60, que es la ventana con la que el backend calcula la posición actual. |
| `--ruido <m>` | 5 | Error típico del GPS. |
| `--erroneos <0-1>` | 0.05 | Proporción de pings erróneos (saltos de 150–550 m, siempre a más de 100 m de cualquier tramo). |
| `--desde <0-1>` | 0 | Dónde empieza la cabeza; por ejemplo, 0.5 para empezar a mitad de recorrido. |

## Escenarios de prueba sugeridos

1. **Seguimiento normal:** `--cofrades 5 --acelerar 10`. La estela avanza en el mapa sin saltos y la cola va por detrás de la cabeza.
2. **Ubicaciones erróneas (RF-25):** `--erroneos 0.3`. En el resumen, *erróneos guardados* debe ser **0**, y el mapa no debe dar saltos.
3. **Procesión que sale y vuelve al templo** (recorrido circular): al empezar, la estela **no** debe aparecer completa (bug 7 de `bugs.md`).
4. **Varias procesiones a la vez:** lanza dos simuladores, en dos terminales, con procesiones distintas de la misma ciudad. En Inicio y en el mapa deben verse las dos (bug 18).
5. **Fin de la procesión:** `--finalizar`, o finalízala a mano desde la app con el simulador en marcha. El simulador debe parar con *"El backend ha dejado de aceptar pings (410)"*.
6. **Código revocado:** con el simulador en marcha, revoca el código desde la app. Debe parar con un 403 y el motivo (bug 10).

## Notas

- Todos los cofrades virtuales comparten el mismo JWT. Es correcto: el backend no guarda quién envía cada ping, solo comprueba que el código sea de una cofradía participante.
- `--iniciar` y `--finalizar` cambian el estado con la API de la Junta (`PUT /procesiones/{id}`, reenviando la procesión tal cual). Eso envía notificaciones push reales a los ciudadanos de esa ciudad.
- Los pings quedan guardados como histórico de la procesión. Además, la estela guarda el máximo avance alcanzado (nunca retrocede): si repites la simulación con la **misma** procesión, la estela seguirá donde la dejaste. Para empezar de cero, elimina la procesión y vuelve a crearla, o usa otra.
