import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import api from '../services/api';

export default function HomeScreen() {
  const navigation = useNavigation();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['home-data'],
    queryFn: async () => {
      const response = await api.get('/public/homepage');
      return response.data.data;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.title}>Discover Events</Text>
        </View>

        {/* Current Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 Live Now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data?.currentEvents?.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetail', { id: event._id })}
              >
                <View style={styles.eventBadge}>
                  <Text style={styles.badgeText}>Live</Text>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <Text style={styles.eventRegion}>{event.region}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Upcoming</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data?.upcomingEvents?.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetail', { id: event._id })}
              >
                <View style={[styles.eventBadge, styles.upcomingBadge]}>
                  <Text style={styles.badgeText}>
                    {format(new Date(event.startDate), 'MMM d')}
                  </Text>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <Text style={styles.eventRegion}>{event.region}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Influencers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Top Influencers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data?.topInfluencers?.map((influencer) => (
              <View key={influencer._id} style={styles.influencerCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {influencer.user?.name?.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.influencerName} numberOfLines={1}>
                  {influencer.user?.name}
                </Text>
                <Text style={styles.influencerStats}>
                  {influencer.totalFollowers?.toLocaleString()} followers
                </Text>
                <Text style={styles.influencerEvents}>
                  {influencer.completedEvents} events
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20 },
  greeting: { fontSize: 16, color: '#6b7280' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', paddingHorizontal: 20, marginBottom: 12 },
  eventCard: {
    width: 200, backgroundColor: 'white', borderRadius: 16,
    padding: 16, marginLeft: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  eventBadge: {
    backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12
  },
  upcomingBadge: { backgroundColor: '#0ea5e9' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  eventRegion: { fontSize: 14, color: '#6b7280' },
  influencerCard: {
    width: 120, backgroundColor: 'white', borderRadius: 16,
    padding: 16, marginLeft: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#0ea5e9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8
  },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  influencerName: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' },
  influencerStats: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  influencerEvents: { fontSize: 12, color: '#0ea5e9', marginTop: 2 }
});
