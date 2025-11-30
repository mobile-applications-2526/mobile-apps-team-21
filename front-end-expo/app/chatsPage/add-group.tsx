import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/components/AuthContext';
import { createGroup } from '@/services/groupChatService';

export default function AddGroupScreen() {
  const router = useRouter();
  const { token, userEmail } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Groepsnaam is verplicht');
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
      setError('Kon groep niet aanmaken. Controleer je verbinding.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
       <Stack.Screen options={{ headerShown: false }} />
       
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2933" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nieuwe Groep</Text>
        <View style={{width: 32}} />
       </View>

       <View style={styles.form}>
         <Text style={styles.label}>Naam van de groep</Text>
         <TextInput 
           style={styles.input} 
           placeholder="Bijv. Project Team"
           value={groupName}
           onChangeText={setGroupName}
           placeholderTextColor="#99a1ab"
         />

         <Text style={styles.label}>Uitnodigen (emails, komma gescheiden)</Text>
         <TextInput 
           style={styles.input} 
           placeholder="jan@test.com, piet@test.com"
           value={inviteEmails}
           onChangeText={setInviteEmails}
           placeholderTextColor="#99a1ab"
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
             <Text style={styles.createButtonText}>Groep Aanmaken</Text>
           )}
         </TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2933' },
  backButton: { padding: 4 },
  form: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1f2933', marginBottom: 8, marginTop: 16 },
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