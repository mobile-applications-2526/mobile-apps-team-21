import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/components/AuthContext';
import { fetchGroupMemberDetails, GroupMember } from '@/services/groupChatService';
import LoadingScreen from '@/components/LoadingScreen';

export default function GroupMembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const groupId = params.groupId as string;
  const groupName = params.groupName as string;

  useEffect(() => {
    loadMembers();
  }, [groupId, token]);

  const loadMembers = async () => {
    if (!groupId || !token) return;
    setLoading(true);
    try {
      const data = await fetchGroupMemberDetails(groupId, token);
      setMembers(data);
    } catch (e) {
      console.error('Failed to load members:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={[styles.memberCard, isDark && styles.memberCardDark]}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, isDark && styles.avatarDark]}>
          <Text style={styles.avatarText}>
            {item.firstName?.charAt(0)?.toUpperCase()}{item.lastName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, isDark && styles.textDark]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.memberEmail, isDark && styles.emailDark]}>
          {item.email}
        </Text>
      </View>
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>
            {groupName}
          </Text>
          <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.email}
        renderItem={renderMember}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.textDark]}>No members found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  containerDark: {
    backgroundColor: '#12181f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerDark: {
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2933',
  },
  headerTitleDark: {
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6a7282',
    marginTop: 2,
  },
  headerSubtitleDark: {
    color: '#c4c9d1',
  },
  listContent: {
    padding: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  memberCardDark: {
    backgroundColor: '#1f2933',
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDark: {
    backgroundColor: '#3d8b40',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2933',
  },
  textDark: {
    color: '#ffffff',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6a7282',
    marginTop: 2,
  },
  emailDark: {
    color: '#c4c9d1',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#6a7282',
  },
});
