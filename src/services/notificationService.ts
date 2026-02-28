import { triggerHaptic } from '../lib/utils';

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      
      if (result === 'granted') {
        triggerHaptic(20); // Success haptic
        this.sendLocalNotification('Notifications Enabled', 'You will now receive budget alerts and reminders from Expenso.');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  public sendLocalNotification(title: string, body: string) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico', // Fallback to favicon
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      console.log('Notification permission not granted. In-app alert:', { title, body });
    }
  }

  public scheduleDailyReminder() {
    // In a real web app, this would be handled by a Service Worker.
    // For this implementation, we'll check if we should show a reminder on app load.
    const lastReminder = localStorage.getItem('expenso_last_reminder');
    const today = new Date().toDateString();

    if (lastReminder !== today) {
      const now = new Date();
      // If it's after 8 PM, show reminder
      if (now.getHours() >= 20) {
        this.sendLocalNotification('Daily Reminder', 'Time to log your expenses! Keep Expenso updated.');
        localStorage.setItem('expenso_last_reminder', today);
      }
    }
  }
}

export const notificationService = NotificationService.getInstance();
