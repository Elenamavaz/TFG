ejecutar memorio: pdflatex proyecto
bibtex proyecto
pdflatex proyecto
pdflatex proyecto

ejecutar react:
abrir el de andoid studio ejecuatr el proyecto y luego 
Después inicia Metro:

npm start

el back : ./mvnw spring-boot:run

miras el back en el enlace : http://localhost:8080/swagger-ui.html

script para popblar la base de datos

cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"



.\mvnw spring-boot:run
Esas dos variables solo viven en esa ventana de PowerShell mientras esté abierta — ciérrala y desaparecen, no quedan guardadas en ningún sitio. Si luego quieres levantarlo otra vez sin mandar correos de verdad, basta con abrir una terminal nueva sin esas variables y volver a .\mvnw spring-boot:run.

Avísame cuando lo tengas arriba y seguimos probando lo de crear un Miembro.

ssh -p 20101 usuario@virtual.lab.inf.uva.es
Ver si está funcionando	systemctl status semanasanta
Ver el log en directo	sudo journalctl -u semanasanta -f
Pararlo	sudo systemctl stop semanasanta
Arrancarlo	sudo systemctl start semanasanta
Reiniciarlo (tras cambiar backend.env)	sudo systemctl restart semanasanta
Actualizar a la última versión de GitHub	cd ~/TFG && git pull && cd backend && ./mvnw package -DskipTests && sudo systemctl restart semanasanta


actualizar git 
cd ~/TFG && git pull && cd backend && ./mvnw package -DskipTests && sudo systemctl restart semanasanta


cd C:\Users\elena\dev\TFG\semanasanta-app
eas build -p android --profile preview

npx expo start --tunnel

cd C:\Users\elena\dev\TFG
node herramientas/simulador-procesion/prueba-hoy.mjs --junta-email elena.martinez@estudiantes.uva.es --junta-password 'ElenaCofradia_1' --codigo 148647D5


fin de compilacion PS C:\Users\elena\dev\TFG> node herramientas/simulador-procesion/prueba-hoy.mjs --junta-email elena.martinez@estudiantes.uva.es --junta-password 'ElenaCofradia_1' --codigo 148647D5

Procesión   Procesion de prueba (id 44, Valladolid)
Recorrido   0.80 km en 38 puntos
Código      válido para una cofradía de la procesión
Horario     hoy de 18:15 a 18:25 · estado PROGRAMADO

Abre la app (ciudadano en esa ciudad) → Mapa en Vivo. Al empezar debería llegar el aviso "Ha comenzado".
18:15:03 esperando la salida (ya es la hora, esperando al backend)...      
18:15:06 ▶ Procesión EN CURSO.
Simulación  6 cofrades a 1.5 km/h × 5.1 → el cortejo termina antes de las 18:25


Procesión   Procesion de prueba (id 44)
Recorrido   0.80 km en 38 puntos
Cortejo     6 cofrades en 200 m · 1.5 km/h × 5.1
Pings       cada 10 s · ruido GPS ~5 m · 5.0% erróneos
Duración    ~7.8 min reales · Ctrl+C para parar
Mapa        abre la app → Mapa en Vivo

18:15:06 ronda   1 · ✔ 6 guardados · ✖ 0 descartados · [█·······································] cola 0.0% · cabeza 0.3% · 6 activos
18:15:17 ronda   2 · ✔ 5 guardados · ✖ 1 descartados · [█·······································] cola 0.0% · cabeza 3.7% · 11 activos
18:15:27 ronda   3 · ✔ 6 guardados · ✖ 0 descartados · [███·····································] cola 0.0% · cabeza 6.9% · 17 activos
18:15:38 ronda   4 · ✔ 6 guardados · ✖ 0 descartados · [████····································] cola 0.0% · cabeza 8.8% · 23 activos
18:15:48 ronda   5 · ✔ 6 guardados · ✖ 0 descartados · [████····································] cola 0.0% · cabeza 10.4% · 29 activos
18:15:59 ronda   6 · ✔ 6 guardados · ✖ 0 descartados · [██████··································] cola 0.0% · cabeza 14.3% · 35 activos
18:16:09 ronda   7 · ✔ 6 guardados · ✖ 0 descartados · [███████·································] cola 0.0% · cabeza 16.8% · 35 activos
18:16:19 ronda   8 · ✔ 6 guardados · ✖ 0 descartados · [████████································] cola 0.0% · cabeza 19.5% · 36 activos
18:16:29 ronda   9 · ✔ 6 guardados · ✖ 0 descartados · [█████████·······························] cola 0.0% · cabeza 22.2% · 36 activos
18:16:40 ronda  10 · ✔ 6 guardados · ✖ 0 descartados · [██████████······························] cola 0.0% · cabeza 25.5% · 36 activos
18:16:50 ronda  11 · ✔ 6 guardados · ✖ 0 descartados · [███████████·····························] cola 0.0% · cabeza 27.8% · 36 activos
18:17:01 ronda  12 · ✔ 6 guardados · ✖ 0 descartados · [████████████····························] cola 0.0% · cabeza 30.1% · 36 activos
18:17:11 ronda  13 · ✔ 6 guardados · ✖ 0 descartados · [█████████████···························] cola 0.0% · cabeza 33.1% · 36 activos
18:17:21 ronda  14 · ✔ 5 guardados · ✖ 1 descartados · [██████████████··························] cola 0.0% · cabeza 36.0% · 35 activos
18:17:31 ronda  15 · ✔ 6 guardados · ✖ 0 descartados · [████████████████························] cola 0.0% · cabeza 39.2% · 35 activos
18:17:42 ronda  16 · ✔ 6 guardados · ✖ 0 descartados · [·████████████████·······················] cola 2.6% · cabeza 41.5% · 35 activos
18:17:52 ronda  17 · ✔ 6 guardados · ✖ 0 descartados · [··████████████████······················] cola 5.1% · cabeza 44.8% · 35 activos
18:18:02 ronda  18 · ✔ 6 guardados · ✖ 0 descartados · [···███████████████······················] cola 8.3% · cabeza 45.9% · 35 activos
18:18:12 ronda  19 · ✔ 5 guardados · ✖ 1 descartados · [····████████████████····················] cola 10.7% · cabeza 50.0% · 34 activos
18:18:23 ronda  20 · ✔ 6 guardados · ✖ 0 descartados · [······███████████████···················] cola 14.9% · cabeza 52.6% · 35 activos
18:18:33 ronda  21 · ✔ 5 guardados · ✖ 1 descartados · [·······███████████████··················] cola 16.6% · cabeza 56.2% · 34 activos
18:18:43 ronda  22 · ✔ 6 guardados · ✖ 0 descartados · [········███████████████·················] cola 18.9% · cabeza 58.1% · 34 activos
18:18:53 ronda  23 · ✔ 4 guardados · ✖ 2 descartados · [·········████████████████···············] cola 21.7% · cabeza 61.3% · 32 activos
18:19:04 ronda  24 · ✔ 6 guardados · ✖ 0 descartados · [···········██████████████···············] cola 27.4% · cabeza 63.4% · 32 activos
18:19:14 ronda  25 · ✔ 6 guardados · ✖ 0 descartados · [···········███████████████··············] cola 27.4% · cabeza 66.1% · 33 activos
18:19:24 ronda  26 · ✔ 6 guardados · ✖ 0 descartados · [············████████████████············] cola 30.1% · cabeza 69.4% · 33 activos
18:19:35 ronda  27 · ✔ 6 guardados · ✖ 0 descartados · [·············████████████████···········] cola 31.9% · cabeza 72.0% · 34 activos
18:19:45 ronda  28 · ✔ 6 guardados · ✖ 0 descartados · [··············████████████████··········] cola 35.7% · cabeza 74.0% · 34 activos
18:19:55 ronda  29 · ✔ 6 guardados · ✖ 0 descartados · [···············████████████████·········] cola 37.7% · cabeza 77.0% · 36 activos
18:20:05 ronda  30 · ✔ 6 guardados · ✖ 0 descartados · [·················███████████████········] cola 41.6% · cabeza 79.9% · 36 activos
18:20:16 ronda  31 · ✔ 6 guardados · ✖ 0 descartados · [·················████████████████·······] cola 43.7% · cabeza 82.4% · 36 activos
18:20:26 ronda  32 · ✔ 6 guardados · ✖ 0 descartados · [···················███████████████······] cola 46.9% · cabeza 85.4% · 36 activos
18:20:36 ronda  33 · ✔ 6 guardados · ✖ 0 descartados · [····················███████████████·····] cola 49.0% · cabeza 87.7% · 36 activos
18:20:46 ronda  34 · ✔ 6 guardados · ✖ 0 descartados · [·····················████████████████···] cola 51.9% · cabeza 91.7% · 36 activos
18:20:57 ronda  35 · ✔ 5 guardados · ✖ 1 descartados · [······················███████████████···] cola 55.4% · cabeza 93.6% · 35 activos
18:21:07 ronda  36 · ✔ 6 guardados · ✖ 0 descartados · [·······················████████████████·] cola 57.6% · cabeza 96.4% · 35 activos
18:21:17 ronda  37 · ✔ 6 guardados · ✖ 0 descartados · [························████████████████] cola 60.2% · cabeza 99.3% · 35 activos
18:21:28 ronda  38 · ✔ 6 guardados · ✖ 0 descartados · [·························███████████████] cola 63.0% · cabeza 99.9% · 35 activos
18:21:38 ronda  39 · ✔ 6 guardados · ✖ 0 descartados · [··························██████████████] cola 65.7% · cabeza 100.0% · 35 activos
18:21:48 ronda  40 · ✔ 5 guardados · ✖ 1 descartados · [···························█████████████] cola 68.1% · cabeza 100.0% · 34 activos
18:21:59 ronda  41 · ✔ 6 guardados · ✖ 0 descartados · [····························████████████] cola 71.0% · cabeza 100.0% · 35 activos
18:22:09 ronda  42 · ✔ 6 guardados · ✖ 0 descartados · [······························██████████] cola 75.1% · cabeza 100.0% · 35 activos
18:22:19 ronda  43 · ✔ 6 guardados · ✖ 0 descartados · [·······························█████████] cola 76.4% · cabeza 100.0% · 35 activos
18:22:29 ronda  44 · ✔ 6 guardados · ✖ 0 descartados · [································████████] cola 79.3% · cabeza 100.0% · 35 activos
18:22:40 ronda  45 · ✔ 6 guardados · ✖ 0 descartados · [·································███████] cola 83.4% · cabeza 100.0% · 35 activos
18:22:50 ronda  46 · ✔ 5 guardados · ✖ 1 descartados · [··································██████] cola 85.3% · cabeza 100.0% · 35 activos
18:23:00 ronda  47 · ✔ 6 guardados · ✖ 0 descartados · [···································█████] cola 87.7% · cabeza 100.0% · 35 activos

■ La cola ha llegado al final del recorrido.

Resumen
  Pings guardados     273
  Pings descartados   9  (fuera del recorrido, RF-25)
  Erróneos enviados   9, de ellos guardados 0 (deberían ser 0)
  Errores de red/API  0

A las 18:25 el backend finalizará la procesión solo (aviso "Ha finalizado").

PS C:\Users\elena\dev\TFG> 