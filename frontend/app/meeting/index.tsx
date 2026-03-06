import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/api';
import { useRouter } from 'expo-router';

type Meeting = {
  id: number;
  title: string;
  meeting_date: string;
  location: string;
  description?: string;
  presenter_name?: string;
};

type Member = {
  id: number;
  name: string;
  business_name: string;
  business_category: string;
};

type Attendance = {
  member_name: string;
  business_name: string;
  status: string;
};

export default function MeetingSchedule() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [userRole, setUserRole] = useState('');
  const [form, setForm] = useState({
    title: '',
    meeting_date: '',
    time: '',
    location: '',
    presenter_id: '',
    description: ''
  });

  useEffect(() => {
    loadData();
    if (Platform.OS === 'web') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
          e.preventDefault();
          setModalVisible(true);
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  const loadData = async () => {
    const role = await AsyncStorage.getItem('userRole');
    setUserRole(role || '');
    await Promise.all([fetchMeetings(), fetchMembers()]);
  };

  const fetchMeetings = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/meetings?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.filter((m: Meeting) => new Date(m.meeting_date) >= new Date()));
      }
    } catch (error) {
      console.error('Fetch meetings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Fetch members error:', error);
    }
  };

  const fetchAttendance = async (meetingId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/meetings/${meetingId}/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
      }
    } catch (error) {
      console.error('Fetch attendance error:', error);
    }
  };

  const createMeeting = async () => {
    if (!form.title || !form.meeting_date || !form.time || !form.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.meeting_date)) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format (e.g., 2026-02-18)');
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(form.time)) {
      Alert.alert('Error', 'Time must be in HH:MM format (e.g., 07:30)');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      let chapterId = await AsyncStorage.getItem('chapterId');
      
      if (!chapterId) {
        chapterId = '1';
        await AsyncStorage.setItem('chapterId', '1');
      }
      
      const meetingDateTime = `${form.meeting_date}T${form.time}:00`;
      
      console.log('Creating meeting:', { chapter_id: chapterId, title: form.title, meeting_date: meetingDateTime });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_id: parseInt(chapterId),
          title: form.title,
          meeting_date: meetingDateTime,
          location: form.location,
          description: `${form.description}${form.presenter_id ? ` | Presenter: ${members.find(m => m.id.toString() === form.presenter_id)?.name}` : ''}`
        })
      });

      const data = await response.json();
      console.log('Create meeting response:', data);

      if (response.ok) {
        Alert.alert('Success', 'Meeting created');
        setModalVisible(false);
        setForm({ title: '', meeting_date: '', time: '', location: '', presenter_id: '', description: '' });
        fetchMeetings();
      } else {
        Alert.alert('Error', data.message || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Create meeting error:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  const deleteMeeting = async (meetingId: number, meetingTitle: string) => {
    Alert.alert(
      'Delete Meeting',
      `Are you sure you want to delete "${meetingTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.ok) {
                Alert.alert('Success', 'Meeting deleted successfully');
                fetchMeetings();
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

  const viewDetails = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    await fetchAttendance(meeting.id);
    setDetailsModalVisible(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B4DA2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Meetings</Text>
        {(userRole === 'admin' || userRole === 'president') && (
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add {Platform.OS === 'web' && '(Ctrl+M)'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeetings(); }} />}
      >
        {meetings.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming meetings</Text>
        ) : (
          meetings.map((meeting) => (
            <View key={meeting.id} style={styles.card}>
              <TouchableOpacity style={styles.cardContent} onPress={() => viewDetails(meeting)}>
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Text style={styles.icon}>📅</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.date}>{formatDate(meeting.meeting_date)} • {formatTime(meeting.meeting_date)}</Text>
                    <Text style={styles.title}>{meeting.title}</Text>
                    <Text style={styles.venue}>{meeting.location}</Text>
                    {meeting.description && meeting.description.includes('Presenter:') && (
                      <Text style={styles.presenter}>{meeting.description.split('|')[1]?.trim()}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              {(userRole === 'admin' || userRole === 'president') && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteMeeting(meeting.id, meeting.title)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Meeting</Text>
            <TextInput style={styles.input} placeholder="Title *" value={form.title} onChangeText={(text) => setForm({ ...form, title: text })} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD) *" value={form.meeting_date} onChangeText={(text) => setForm({ ...form, meeting_date: text })} />
            <TextInput style={styles.input} placeholder="Time (HH:MM) *" value={form.time} onChangeText={(text) => setForm({ ...form, time: text })} />
            <TextInput style={styles.input} placeholder="Location/Hotel *" value={form.location} onChangeText={(text) => setForm({ ...form, location: text })} />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Presenter (optional):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[styles.memberChip, form.presenter_id === member.id.toString() && styles.memberChipSelected]}
                    onPress={() => setForm({ ...form, presenter_id: member.id.toString() })}
                  >
                    <Text style={[styles.memberChipText, form.presenter_id === member.id.toString() && styles.memberChipTextSelected]}>
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={form.description} onChangeText={(text) => setForm({ ...form, description: text })} multiline numberOfLines={3} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); setForm({ title: '', meeting_date: '', time: '', location: '', presenter_id: '', description: '' }); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={createMeeting}>
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMeeting?.title}</Text>
            <Text style={styles.detailText}>📅 {selectedMeeting && formatDate(selectedMeeting.meeting_date)} • {selectedMeeting && formatTime(selectedMeeting.meeting_date)}</Text>
            <Text style={styles.detailText}>📍 {selectedMeeting?.location}</Text>
            {selectedMeeting?.description && !selectedMeeting.description.includes('Presenter:') && (
              <Text style={styles.detailText}>{selectedMeeting.description}</Text>
            )}
            {selectedMeeting?.description && selectedMeeting.description.includes('Presenter:') && (
              <Text style={styles.detailText}>🎤 {selectedMeeting.description.split('|')[1]?.trim()}</Text>
            )}
            <Text style={styles.sectionTitle}>Members ({attendance.length})</Text>
            <ScrollView style={styles.membersList}>
              {attendance.length === 0 ? (
                <Text style={styles.emptyText}>No attendance recorded</Text>
              ) : (
                attendance.map((att, idx) => (
                  <View key={idx} style={styles.memberItem}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{att.member_name?.charAt(0) || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberItemName}>{att.member_name}</Text>
                      <Text style={styles.memberItemBusiness}>{att.business_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, att.status === 'present' && styles.statusPresent, att.status === 'late' && styles.statusLate, att.status === 'absent' && styles.statusAbsent]}>
                      <Text style={styles.statusText}>{att.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#0B4DA2' },
  addButton: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardContent: { flex: 1 },
  row: { flexDirection: 'row' },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#0B4DA2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 24 },
  date: { fontSize: 14, color: '#666', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0B4DA2', marginBottom: 4 },
  venue: { fontSize: 14, color: '#333' },
  presenter: { fontSize: 13, color: '#10B981', marginTop: 4, fontWeight: '600' },
  deleteButton: { marginTop: 12, backgroundColor: '#FF3B30', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'center' },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0B4DA2', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  pickerContainer: { marginBottom: 12 },
  pickerLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  memberChip: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  memberChipSelected: { backgroundColor: '#0B4DA2' },
  memberChipText: { fontSize: 14, color: '#333' },
  memberChipTextSelected: { color: '#fff', fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelButton: { flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  cancelButtonText: { color: '#333', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#0B4DA2', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  detailText: { fontSize: 15, color: '#333', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0B4DA2', marginTop: 16, marginBottom: 12 },
  membersList: { maxHeight: 200 },
  memberItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0B4DA2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  memberItemName: { fontSize: 15, fontWeight: '600', color: '#333' },
  memberItemBusiness: { fontSize: 13, color: '#666' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusPresent: { backgroundColor: '#10B981' },
  statusLate: { backgroundColor: '#F59E0B' },
  statusAbsent: { backgroundColor: '#EF4444' },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  closeButton: { backgroundColor: '#0B4DA2', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});
