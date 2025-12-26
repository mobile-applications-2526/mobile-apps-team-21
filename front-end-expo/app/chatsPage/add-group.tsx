import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/components/AuthContext';
import { createGroup } from '@/services/groupChatService';

export default function AddGroupScreen() {
  const router = useRouter();
  const { token, userEmail } = useAuth();
  
  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [groupName, setGroupName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (!userEmail) { 
        setLoading(false); 
        return; 
    }
    
    setLoading(true);
    setError('');
    
    try {
      const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
      await createGroup(groupName.trim(), emails, userEmail, token || undefined);
      router.back(); 
    } catch (e) {
      setError('Could not create group. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
       <Stack.Screen options={{ headerShown: false }} />
       
       <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>New Group</Text>
        <View style={{width: 32}} />
       </View>

       <View style={styles.form}>
         <Text style={[styles.label, isDark && styles.labelDark]}>Group name</Text>
         <TextInput 
           style={[styles.input, isDark && styles.inputDark]} 
           placeholder="e.g. Project Team"
           value={groupName}
           onChangeText={setGroupName}
           placeholderTextColor={isDark ? '#8894a0' : '#99a1ab'}
         />

         <Text style={[styles.label, isDark && styles.labelDark]}>Invite (emails, comma separated)</Text>
         <TextInput 
           style={[styles.input, isDark && styles.inputDark]} 
           placeholder="jan@test.com, piet@test.com"
           value={inviteEmails}
           onChangeText={setInviteEmails}
           placeholderTextColor={isDark ? '#8894a0' : '#99a1ab'}
           autoCapitalize="none"
           keyboardType="email-address"
         />

         {error ? <Text style={styles.errorText}>{error}</Text> : null}

         <TouchableOpacity 
           style={styles.createButton} 
           onPress={handleCreate}
           disabled={loading}
         >
           {loading ? (
             <ActivityIndicator color="#fff" />
           ) : (
             <Text style={styles.createButtonText}>Create Group</Text>
           )}
         </TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  containerDark: { backgroundColor: '#12181f' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  headerDark: {
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2933' },
  headerTitleDark: { color: '#ffffff' },
  
  backButton: { padding: 4 },
  form: { padding: 24 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#1f2933', marginBottom: 8, marginTop: 16 },
  labelDark: { color: '#ffffff' },
  
  input: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: '#1f2933', 
    borderWidth: 1,
    borderColor: '#e1e4e8'
  },
  inputDark: {
    backgroundColor: '#25323d',
    color: '#ffffff',
    borderColor: '#405060'
  },
  
  errorText: { color: '#d32f2f', marginTop: 16, fontWeight: '500' },
  
  createButton: { 
    backgroundColor: '#4caf50', 
    borderRadius: 14, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginTop: 32,
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});