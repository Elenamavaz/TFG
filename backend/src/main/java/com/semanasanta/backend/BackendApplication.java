package com.semanasanta.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

// Excluye la autoconfiguración del usuario en memoria por defecto de Spring
// Security (la que genera la contraseña aleatoria en el log al arrancar):
// la autenticación de esta API es 100% JWT propio, no HTTP Basic/form login.
//
// @EnableScheduling (2026-09-30): para CambioEstadoAutomaticoService.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		// Las fechas se guardan sin zona (LocalDateTime) y son hora de España
		// -la que teclea la Junta-. Railway corre en UTC: sin esto,
		// LocalDateTime.now() iría 1-2 horas por detrás y los cambios de
		// estado automáticos (y la ventana de pings) llegarían tarde.
		TimeZone.setDefault(TimeZone.getTimeZone("Europe/Madrid"));
		SpringApplication.run(BackendApplication.class, args);
	}

}
