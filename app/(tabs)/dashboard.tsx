import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { listIncomingRoomInvites } from '@/lib/invites';
import { buildRoomRoute, listMyRooms } from '@/lib/rooms';

type DashboardMetrics = {
  incomingInvites: number;
  ownedRooms: number;
  totalRooms: number;
};

const YELLOW = '#FDE047';
const YELLOW_DIM = '#FDE68A';
const BLACK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE_2 = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#6B6B6B';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    incomingInvites: 0,
    ownedRooms: 0,
    totalRooms: 0,
  });
  const [latestRoomCode, setLatestRoomCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      const [rooms, invites] = await Promise.all([listMyRooms(), listIncomingRoomInvites()]);
      setMetrics({
        incomingInvites: invites.length,
        ownedRooms: rooms.filter((room) => room.is_owner).length,
        totalRooms: rooms.length,
      });
      setLatestRoomCode(rooms[0]?.room_code ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load dashboard right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  const firstName = useMemo(() => profile?.full_name?.split(' ')[0] ?? 'there', [profile?.full_name]);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {/* Accent stripe */}
          <View style={styles.heroStripe} />
          <View style={styles.heroInner}>
            <View style={styles.heroBadge}>
              <ThemedText style={styles.heroBadgeText}>DASHBOARD</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>
              Hey, {firstName} 👋
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Your rooms, invites, and activity — all in one place.
            </ThemedText>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard label="Rooms" value={metrics.totalRooms} icon="⬡" />
          <MetricCard label="Owned" value={metrics.ownedRooms} icon="◈" highlight />
          <MetricCard label="Invites" value={metrics.incomingInvites} icon="◎" />
        </View>

        {/* Divider label */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionLine} />
          <ThemedText style={styles.sectionLabelText}>QUICK ACTIONS</ThemedText>
          <View style={styles.sectionLine} />
        </View>

        {/* Actions */}
        <View style={styles.actionsGrid}>
          <ActionButton
            label="Rooms"
            icon="⬡"
            onPress={() => router.push('/(tabs)')}
            variant="primary"
          />
          <ActionButton
            label="Invites"
            icon="◎"
            onPress={() => router.push('/(tabs)/invites' as never)}
            variant="secondary"
          />
          <ActionButton
            label="Profile"
            icon="◈"
            onPress={() => router.push('/(tabs)/profile' as never)}
            variant="secondary"
          />
          {latestRoomCode ? (
            <ActionButton
              label="Rejoin"
              icon="↩"
              onPress={() => router.push(buildRoomRoute(latestRoomCode))}
              variant="ghost"
            />
          ) : null}
        </View>

        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, { backgroundColor: isLoading ? MUTED : YELLOW }]} />
          {isLoading ? (
            <ActivityIndicator color={YELLOW} size="small" style={{ marginLeft: 8 }} />
          ) : (
            <ThemedText style={styles.statusText}>
              {message ?? 'Synced — all systems go'}
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function MetricCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
      <ThemedText style={[styles.metricIcon, highlight && styles.metricIconHighlight]}>
        {icon}
      </ThemedText>
      <ThemedText style={[styles.metricValue, highlight && styles.metricValueHighlight]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.metricLabel, highlight && styles.metricLabelHighlight]}>
        {label}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  variant = 'secondary',
}: {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const bgMap = {
    primary: YELLOW,
    secondary: SURFACE_2,
    ghost: 'transparent',
  };
  const textColorMap = {
    primary: BLACK,
    secondary: '#E5E5E5',
    ghost: MUTED,
  };
  const borderMap = {
    primary: 'transparent',
    secondary: BORDER,
    ghost: BORDER,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: bgMap[variant],
          borderColor: borderMap[variant],
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <ThemedText style={[styles.actionIcon, { color: textColorMap[variant] }]}>
        {icon}
      </ThemedText>
      <ThemedText style={[styles.actionLabel, { color: textColorMap[variant] }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BLACK,
    flexGrow: 1,
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },

  // Hero
  hero: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  heroStripe: {
    backgroundColor: YELLOW,
    height: 4,
    width: '100%',
  },
  heroInner: {
    gap: 8,
    padding: 22,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F1A00',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3D3000',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroBadgeText: {
    color: YELLOW_DIM,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroTitle: {
    color: '#FAFAFA',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    alignItems: 'flex-start',
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 14,
  },
  metricCardHighlight: {
    backgroundColor: '#1A1500',
    borderColor: '#3D3000',
  },
  metricIcon: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 4,
  },
  metricIconHighlight: {
    color: YELLOW_DIM,
  },
  metricValue: {
    color: '#FAFAFA',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 34,
  },
  metricValueHighlight: {
    color: YELLOW,
  },
  metricLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricLabelHighlight: {
    color: '#A07A00',
  },

  // Section divider
  sectionLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginVertical: 2,
  },
  sectionLine: {
    backgroundColor: BORDER,
    flex: 1,
    height: 1,
  },
  sectionLabelText: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Actions
  actionsGrid: {
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Status
  statusBar: {
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '500',
  },
});
