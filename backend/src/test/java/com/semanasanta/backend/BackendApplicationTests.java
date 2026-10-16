package com.semanasanta.backend;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Prueba de integración: arranca la aplicación completa contra PostgreSQL
// (contenedor de compose.yaml, vía spring-boot-docker-compose), ejecuta las
// migraciones de Flyway y valida que las entidades JPA encajan con el
// esquema. Necesita Docker arrancado, por eso se excluye por defecto (ver
// tests.excluidos en pom.xml): mvnw test -Dtests.excluidos=ninguno
@Tag("integracion")
@SpringBootTest
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
