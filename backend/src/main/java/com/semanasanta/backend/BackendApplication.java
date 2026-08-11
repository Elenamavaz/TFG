package com.semanasanta.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// Excluye la autoconfiguración del usuario en memoria por defecto de Spring
// Security (la que genera la contraseña aleatoria en el log al arrancar):
// la autenticación de esta API es 100% JWT propio, no HTTP Basic/form login.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
