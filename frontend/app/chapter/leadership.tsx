import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/api';

type Leader = {
  id: number;
  name: string;
  email: string;
  role: string;
  image: string;
  business_name: string;
  business_category: string;
  contact: string;
};

const roleDisplayNames = {
  president: 'President',
  vice_president: 'Vice President',
  secretary: 'Secretary'
};

export default function LeaderScreen() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchLeadership();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await AsyncStorage.getItem('userRole');
    setUserRole(role || '');
  };

  const fetchLeadership = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Fetching leadership from:', `${API_CONFIG.BASE_URL}/api/leadership`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/leadership`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Leadership response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Leadership data received:', data);
        if (Array.isArray(data)) {
          setLeaders(data);
        } else {
          console.error('Leadership data is not an array:', data);
          setLeaders([]);
        }
      } else {
        console.error('Leadership API error:', response.status, response.statusText);
        setLeaders([]);
      }
    } catch (error) {
      console.error('Leadership fetch error:', error instanceof Error ? error.message : 'Unknown error');
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leaderId: number, leaderName: string) => {
    Alert.alert(
      'Delete Leader',
      `Are you sure you want to remove ${leaderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${leaderId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Leader deleted successfully');
                fetchLeadership();
              } else {
                const error = await response.json();
                Alert.alert('Error', error.message || 'Failed to delete');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B4DA2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {leaders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No leadership members found</Text>
        </View>
      ) : (
        leaders.map((leader, index) => (
        <View key={`${leader.id}-${index}`} style={styles.card}>
          <View style={styles.imageContainer}>
            {leader.image ? (
              <Image 
                source={{ uri: `${API_CONFIG.BASE_URL}${leader.image}` }} 
                style={styles.image} 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {leader.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.info}>
            <Text style={styles.role}>
              {roleDisplayNames[leader.role as keyof typeof roleDisplayNames] || leader.role}
            </Text>
            <Text style={styles.name}>{leader.name}</Text>
            <Text style={styles.business}>
              {leader.business_category || 'Business Category'}
            </Text>
            <Text style={styles.contact}>
              {leader.contact || 'Contact not provided'}
            </Text>
          </View>
          
          {(userRole === 'admin' || userRole === 'president') && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDelete(leader.id, leader.name)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0B4DA2',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0B4DA2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0B4DA2',
  },
  placeholderText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'center',
  },
  role: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B4DA2',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  business: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    marginTop: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
