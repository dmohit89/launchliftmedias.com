import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/influencers/profile');
      return response.data.data;
    }
  });

  const syncMutation = useMutation({
    mutationFn: () => api.post('/influencers/sync-social'),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      Alert.alert('Success', 'Social media stats synced!');
    },
    onError: () => Alert.alert('Error', 'Failed to sync')
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  const platformIcons = {
    facebook: 'logo-facebook',
    instagram: 'logo-instagram',
    twitter: 'logo-twitter',
    youtube: 'logo-youtube',
    tiktok: 'musical-notes'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile?.totalFollowers?.toLocaleString() || 0}
            </Text>
            <Text style={styles.statLabel}>Total Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.completedEvents || 0}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Accounts</Text>
            <TouchableOpacity onPress={() => syncMutation.mutate()}>
              <Text style={styles.syncButton}>Sync All</Text>
            </TouchableOpacity>
          </View>
          
          {profile?.socialMedia?.map((social, index) => (
            <View key={index} style={styles.socialItem}>
              <View style={styles.socialLeft}>
                <Ionicons
                  name={platformIcons[social.platform] || 'globe-outline'}
                  size={24}
                  color="#6b7280"
                />
                <View>
                  <Text style={styles.socialPlatform}>{social.platform}</Text>
                  <Text style={styles.socialUsername}>@{social.username}</Text>
                </View>
              </View>
              <View style={styles.socialRight}>
                <Text style={styles.socialFollowers}>
                  {(social.followers + social.friends).toLocaleString()}
                </Text>
                <Text style={styles.socialLabel}>followers</Text>
              </View>
            </View>
          ))}

          {(!profile?.socialMedia || profile.socialMedia.length === 0) && (
            <Text style={styles.emptyText}>No social accounts connected</Text>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categories}>
            {profile?.categories?.map((cat) => (
              <View key={cat._id} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: 'white' },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#0ea5e9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  avatarText: { color: 'white', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  verifiedText: { color: '#0ea5e9', fontSize: 14, fontWeight: '500' },
  statsContainer: {
    flexDirection: 'row', backgroundColor: 'white', marginTop: 8,
    paddingVertical: 20, justifyContent: 'space-around'
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e5e7eb' },
  section: { backgroundColor: 'white', marginTop: 8, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  syncButton: { color: '#0ea5e9', fontWeight: '500' },
  socialItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  socialLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  socialPlatform: { fontSize: 14, fontWeight: '500', color: '#111827', textTransform: 'capitalize' },
  socialUsername: { fontSize: 12, color: '#6b7280' },
  socialRight: { alignItems: 'flex-end' },
  socialFollowers: { fontSize: 16, fontWeight: '600', color: '#111827' },
  socialLabel: { fontSize: 12, color: '#6b7280' },
  emptyText: { color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  categoryTag: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { color: '#4b5563', fontSize: 14 },
  bioText: { color: '#4b5563', lineHeight: 22, marginTop: 8 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 20, padding: 16, backgroundColor: 'white', borderRadius: 12
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '500' }
});
