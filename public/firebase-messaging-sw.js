/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyBX-ZCnsJrt3wT_PCEQVxiKvHtmJpLmS8w",
    authDomain: "accounting-app-a4487.firebaseapp.com",
    projectId: "accounting-app-a4487",
    storageBucket: "accounting-app-a4487.firebasestorage.app",
    messagingSenderId: "587738545638",
    appId: "1:587738545638:web:846d403521ca85477faa27",
    measurementId: "G-931SZW835Y"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg' // Customize icon if needed
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
