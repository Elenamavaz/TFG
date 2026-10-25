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


He comparado el diagrama con las entidades del backend ([backend/src/main/java/com/semanasanta/backend/model/](backend/src/main/java/com/semanasanta/backend/model/)) y con las migraciones. No he cambiado nada. Esto es lo que tendrías que corregir.
Tienes razón: el modelo de dominio tiene que reflejar el análisis, es decir, los requisitos (RF/RI) y los casos de uso, no el código. He revisado el diagrama con ese criterio, comparándolo con [2_requisistos.tex](memoria/40_analisis/2_requisistos.tex) y con el texto de [4_modelo_de_dominio.tex](memoria/40_analisis/4_modelo_de_dominio.tex). No he cambiado nada.

