package com.semanasanta.backend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

// El campo "imagen" es un enlace a una imagen ya publicada: tiene que ser
// http(s) y caber en la columna (500). Antes una URL larga reventaba en la
// base de datos con un error que no tenía nada que ver.
class ValidacionImagenTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private Set<ConstraintViolation<PasoRequest>> validarPasoConImagen(String imagen) {
        return validator.validate(new PasoRequest("Cristo Yacente", null, null, imagen, 3L));
    }

    @Test
    void sinImagenEsValido() {
        assertThat(validarPasoConImagen(null)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://upload.wikimedia.org/wikipedia/commons/7/71/Cristo.jpg",
            "http://www.cofradia.es/escudo.png"
    })
    void unEnlaceHttpEsValido(String imagen) {
        assertThat(validarPasoConImagen(imagen)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"escudo.png", "ftp://servidor/escudo.png", "https://con espacios.png", ""})
    void unTextoQueNoEsUnEnlaceHttpSeRechaza(String imagen) {
        assertThat(validarPasoConImagen(imagen))
                .extracting(ConstraintViolation::getMessage)
                .contains("El enlace de la imagen debe empezar por http:// o https://");
    }

    @Test
    void unEnlaceDeMasDe500CaracteresSeRechaza() {
        String largo = "https://imagenes.ejemplo.es/" + "a".repeat(480) + ".jpg";

        assertThat(validarPasoConImagen(largo))
                .extracting(ConstraintViolation::getMessage)
                .contains("El enlace de la imagen es demasiado largo (máximo 500 caracteres)");
    }

    @Test
    void lasMismasReglasAplicanALaCofradia() {
        var errores = validator.validate(new CofradiaRequest("Vera Cruz", null, null, "escudo.png", 1L, true));

        assertThat(errores).extracting(ConstraintViolation::getPropertyPath).map(Object::toString).contains("imagen");
    }
}
