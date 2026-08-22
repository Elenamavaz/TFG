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