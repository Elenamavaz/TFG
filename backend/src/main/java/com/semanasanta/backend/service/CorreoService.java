package com.semanasanta.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// Correo de bienvenida al dar de alta un Miembro de Junta (ver
// MiembroJuntaCofradiaService.crear): es la única vía por la que esa persona
// llega a conocer la contraseña que le ha puesto el Administrador -no hay
// pantalla ni endpoint donde consultarla después, solo se guarda su hash.
@Service
public class CorreoService {

    private final JavaMailSender mailSender;

    public CorreoService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarBienvenidaMiembroJunta(String nombre, String email, String passwordEnClaro) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(email);
        mensaje.setSubject("Tu acceso a Semana Santa App");
        mensaje.setText("""
                Hola %s,

                Un administrador te ha dado de alta como miembro de la Junta de Cofradías en Semana Santa App. Estas son tus credenciales de acceso:

                Email: %s
                Contraseña: %s

                Por seguridad, te recomendamos cambiar la contraseña en cuanto inicies sesión.
                """.formatted(nombre, email, passwordEnClaro));
        mailSender.send(mensaje);
    }
}
