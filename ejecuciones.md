ejecutar memorio: pdflatex proyecto
bibtex proyecto
pdflatex proyecto
pdflatex proyecto

ejecutar react:
abrir el de andoid studio ejecuatr el proyecto y luego 
Después inicia Metro:

npm start


La imagen que compartes es una captura del servidor de PlantUML mostrando un **error de sintaxis**: reconoce la versión (1.2026.7beta11) pero falla en la línea 3 (`skinparam entity { ... }`) y asume por defecto que es un diagrama de secuencia. Ese `skinparam` con llaves en línea es lo que no le gusta. En cualquier caso, te lo paso todo a **Mermaid**, que se renderiza nativamente aquí y en GitHub/Notion/editores Markdown.

## 1. Diagrama de despliegue

\`\`\`mermaid
flowchart TB
    subgraph movil["Dispositivo Movil (device)"]
        app["React Native / Expo<br/>(environment)"]
    end

    subgraph railway["Railway (PaaS)"]
        api["API REST - Spring Boot<br/>+ Firebase Admin SDK"]
        postgres[("PostgreSQL")]
    end

    subgraph firebase["Firebase Server"]
        storage["Firebase Storage<br/>(File Storage)"]
        fcm["Cloud Messaging - FCM<br/>(Messaging Service)"]
    end

    subgraph maps["Google Maps Platform"]
        mapssdk["Maps SDK"]
        directions["Directions API"]
    end

    app -->|"HTTPS / REST + JWT"| api
    app -->|"HTTPS (Firebase SDK)"| storage
    app -->|"HTTPS (Firebase SDK)"| fcm
    app -->|"HTTPS (Google Maps SDK)"| maps
    api -->|"JDBC"| postgres
    api -->|"HTTPS (Admin SDK)"| fcm
\`\`\`

## 2. Diagrama entidad-relación

\`\`\`mermaid
erDiagram
    ciudades ||--o{ cofradias : agrupa
    ciudades ||--|| juntas_cofradias : gestionada_por
    cofradias ||--o{ eventos : organiza
    cofradias ||--o{ procesiones : organiza
    cofradias ||--o{ pasos : posee
    cofradias ||--o{ codigos_acceso : emite
    eventos ||--o{ procesiones : seguido_por
    procesiones ||--|| recorridos : tiene
    procesiones ||--|| posicion_actual : tiene
    recorridos ||--o{ puntos_ruta : compuesto_por
    usuarios }o--|| cofradias : pertenece_a
    usuarios }o--|| procesiones : sigue_en_vivo
    pasos ||--o{ pasos_procesiones : ""
    procesiones ||--o{ pasos_procesiones : ""
    usuarios ||--o{ notificaciones_entregadas : ""
    notificaciones ||--o{ notificaciones_entregadas : ""

    ciudades {
        BIGINT id PK
        VARCHAR nombre
        VARCHAR comunidad_autonoma
        TEXT descripcion
    }
    juntas_cofradias {
        BIGINT id PK
        VARCHAR nombre
        VARCHAR email
        VARCHAR telefono
        BIGINT ciudad_id FK "UNIQUE"
    }
    cofradias {
        BIGINT id PK
        VARCHAR nombre
        TEXT historia
        VARCHAR archivo_informacion
        TIMESTAMP fecha_creacion
        BIGINT ciudad_id FK
    }
    pasos {
        BIGINT id PK
        VARCHAR nombre
        TEXT descripcion
        VARCHAR imagen
        BIGINT cofradia_id FK
    }
    codigos_acceso {
        BIGINT id PK
        VARCHAR codigo "UNIQUE"
        ENUM estado
        BIGINT cofradia_id FK
    }
    eventos {
        BIGINT id PK
        VARCHAR nombre
        TEXT descripcion
        TIMESTAMP fecha
        ENUM estado
        BIGINT cofradia_id FK
    }
    procesiones {
        BIGINT id PK
        TIMESTAMP fecha_inicio
        TIMESTAMP fecha_fin
        ENUM estado
        BIGINT evento_id FK
        BIGINT cofradia_id FK
        BIGINT recorrido_id FK "UNIQUE"
    }
    posicion_actual {
        BIGINT procesion_id PK "FK"
        DOUBLE latitud
        DOUBLE longitud
        TIMESTAMP timestamp
        INTEGER cofrades_activos
    }
    recorridos {
        BIGINT id PK
        VARCHAR nombre
        DOUBLE distancia_total
        INTEGER tiempo_estimado
    }
    puntos_ruta {
        BIGINT id PK
        ENUM tipo
        DOUBLE latitud
        DOUBLE longitud
        VARCHAR direccion
        TIMESTAMP hora_prevista
        INTEGER orden
        BIGINT recorrido_id FK
    }
    usuarios {
        BIGINT id PK
        VARCHAR email "UNIQUE"
        VARCHAR password_hash
        ENUM rol
        TIMESTAMP fecha_ingreso
        BOOLEAN compartiendo_ubicacion
        DOUBLE latitud
        DOUBLE longitud
        TIMESTAMP timestamp_posicion
        BIGINT cofradia_id FK
        BIGINT procesion_en_vivo_id FK
    }
    notificaciones {
        BIGINT id PK
        ENUM tipo
        VARCHAR titulo
        TIMESTAMP fecha_creacion
        TIMESTAMP fecha_expiracion
        ENUM tipo_alerta
        ENUM prioridad
    }
    pasos_procesiones {
        BIGINT paso_id PK "FK"
        BIGINT procesion_id PK "FK"
    }
    notificaciones_entregadas {
        BIGINT usuario_id PK "FK"
        BIGINT notificacion_id PK "FK"
        BOOLEAN leida
        TIMESTAMP fecha_lectura
    }
\`\`\`

## 3. Diagrama de paquetes del backend

\`\`\`mermaid
flowchart TB
    controller["com.nombreApp.controller"]
    service["com.nombreApp.service"]
    repository["com.nombreApp.repository"]
    model["com.nombreApp.model"]
    dto["com.nombreApp.dto"]
    security["com.nombreApp.security"]
    config["com.nombreApp.config"]

    controller -.->|usa| service
    controller -.->|expone| dto
    controller -.->|protegido por| security
    service -.->|usa| repository
    service -.->|gestiona| model
    service -.->|mapea| dto
    repository -.->|persiste| model
    security -.->|autentica / autoriza| service
    config -.->|configura| security
    config -.->|Firebase Admin SDK| model
\`\`\`

---

Estos bloques se renderizan directamente aquí y en cualquier editor con soporte Mermaid. Un par de notas: en el ER de Mermaid las relaciones N:M se muestran a través de las tablas intermedias (`pasos_procesiones` y `notificaciones_entregadas`), tal como está en tu esquema real de PostgreSQL; y recuerda cambiar el prefijo `com.nombreApp` por el nombre real de tu paquete. ¿Quieres que ajuste algún campo, etiqueta o cardinalidad?