package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla dispositivos_push (2026-08-23): un dispositivo del Ciudadano
// registrado para recibir notificaciones push de una ciudad -ver
// DispositivoPushService.registrar y PushNotificacionService. Sin usuario
// al que pertenecer (el Ciudadano nunca se autentica, RI-01): la única
// pertenencia real es "qué ciudad le interesa a este token", que puede
// cambiar (reregistro, ver actualizar()).
@Entity
@Table(name = "dispositivos_push")
public class DispositivoPush {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Token de Expo Push ("ExponentPushToken[...]"), no un token FCM/APNs en
    // crudo: el cliente usa expo-notifications, que abstrae la diferencia
    // entre Android/iOS -el backend solo habla con la API de Expo (exp.host),
    // nunca directamente con Firebase/APNs.
    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ciudad_id", nullable = false)
    private Ciudad ciudad;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizado", nullable = false)
    private LocalDateTime fechaActualizado;

    protected DispositivoPush() {
    }

    public DispositivoPush(String token, Ciudad ciudad) {
        this.token = token;
        this.ciudad = ciudad;
        this.fechaRegistro = LocalDateTime.now();
        this.fechaActualizado = this.fechaRegistro;
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public Ciudad getCiudad() {
        return ciudad;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public LocalDateTime getFechaActualizado() {
        return fechaActualizado;
    }

    // Reregistro (2026-08-23, ver DispositivoPushService.registrar): el
    // mismo token vuelve a registrarse -normalmente porque el Ciudadano
    // cambió de ciudad seleccionada- así que solo hace falta actualizar a
    // qué ciudad apunta ahora, no crear una fila nueva.
    public void actualizar(Ciudad ciudad) {
        this.ciudad = ciudad;
        this.fechaActualizado = LocalDateTime.now();
    }
}
