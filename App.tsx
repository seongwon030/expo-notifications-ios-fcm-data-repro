import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const summarize = (source: string, request: Notifications.NotificationRequest) => {
  const line = `[REPRO] ${source} triggerType=${(request.trigger as { type?: string } | null)?.type} ` +
    `content.data=${JSON.stringify(request.content.data)} ` +
    `trigger.payload=${JSON.stringify((request.trigger as { payload?: unknown } | null)?.payload)}`;
  console.log(line);
  return line;
};

export default function App() {
  const [lines, setLines] = useState<string[]>([]);
  const push = (line: string) => setLines((prev) => [...prev, line]);

  useEffect(() => {
    Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true, allowProvisional: true },
    }).then((p) => push(`[REPRO] permission status=${p.status} ios=${JSON.stringify(p.ios?.status)}`));

    Notifications.getLastNotificationResponseAsync().then((r) => {
      if (r) push(summarize('lastResponse', r.notification.request));
    });
    const received = Notifications.addNotificationReceivedListener((n) => push(summarize('received', n.request)));
    const response = Notifications.addNotificationResponseReceivedListener((r) =>
      push(summarize('response', r.notification.request)),
    );
    return () => {
      received.remove();
      response.remove();
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
      <Text style={{ fontWeight: 'bold' }}>expo-notifications 58.1.6 repro</Text>
      {lines.map((l, i) => (
        <Text key={i} style={{ marginTop: 12, fontSize: 12 }}>{l}</Text>
      ))}
    </ScrollView>
  );
}
