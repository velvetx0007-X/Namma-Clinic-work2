/* eslint-disable no-restricted-globals */

// This service worker handles background push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'New update from Namma Clinic',
        icon: data.icon || '/logo192.png',
        badge: '/badge.png', // Small icon for notification bar
        data: {
            url: data.data?.url || '/dashboard',
            relatedId: data.data?.relatedId,
            onModel: data.data?.onModel
        },
        actions: [
            { action: 'open', title: 'View Details' },
            { action: 'close', title: 'Dismiss' }
        ],
        vibrate: [100, 50, 100],
        tag: data.tag || 'namma-clinic-notification',
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Namma Clinic', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    // Handle opening the app
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(event.notification.data.url);
            }
        })
    );
});
