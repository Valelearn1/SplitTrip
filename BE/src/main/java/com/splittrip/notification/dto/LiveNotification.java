package com.splittrip.notification.dto;

/** Ciò che arriva sulla coda personale: la notifica nuova e il numero aggiornato per la campanella. */
public record LiveNotification(NotificationResponse notification, long unreadCount) {}
