import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from "../../constants/api";

type Member = {
  id: number;
  name: string;
  email: string;
  business_name: string;
  business_category: string;
  contact: string;
  status: string;
  role?: string;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [contact, setContact] = useState("");
  const [chapterId, setChapterId] = useState("1");
  const [userRole, setUserRole] = useState("");

  const fetchMembers = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role || "");
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMBERS.BY_CHAPTER}/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch (err) {
      console.log("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!businessName || !businessCategory) {
      Alert.alert("Error", "Business name and category are required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMBERS.BY_CHAPTER}/${chapterId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ business_name: businessName, business_category: businessCategory, contact })
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Member added successfully");
        setModalVisible(false);
        setBusinessName("");
        setBusinessCategory("");
        setContact("");
        fetchMembers();
      } else {
        Alert.alert("Error", data.message || "Failed to add member");
      }
    } catch (err) {
      Alert.alert("Error", "Server error");
    }
  };

  const handleDelete = async (memberId: number, memberName: string) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to remove ${memberName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/members/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.ok) {
                Alert.alert('Success', 'Member deleted successfully');
                fetchMembers();
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

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0B4DA2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={32} color="#0B4DA2" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {members.map((member) => (
          <View key={member.id} style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.info}>
              <Text style={styles.role}>{member.role || 'Member'}</Text>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.category}>{member.business_category}</Text>
              <Text style={styles.contact}>{member.contact || 'Contact not provided'}</Text>
            </View>

            {(userRole === 'admin' || userRole === 'president') && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(member.id, member.name)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={businessName}
              onChangeText={setBusinessName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Business Category"
              value={businessCategory}
              onChangeText={setBusinessCategory}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Contact (optional)"
              value={contact}
              onChangeText={setContact}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={addMember}>
                <Text style={styles.submitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0B4DA2" },
  addButton: { padding: 8 },
  scrollContent: { alignItems: "center", paddingBottom: 20 },
  card: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  avatarContainer: { marginBottom: 16 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0B4DA2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0B4DA2"
  },
  avatarText: { color: "white", fontSize: 48, fontWeight: "bold" },
  info: { alignItems: "center" },
  role: { fontSize: 18, fontWeight: "bold", color: "#0B4DA2", marginBottom: 4 },
  name: { fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 4 },
  category: { fontSize: 16, color: "#666", fontStyle: "italic", marginBottom: 4 },
  contact: { fontSize: 14, color: "#555" },
  deleteButton: {
    marginTop: 16,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold"
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", padding: 24, borderRadius: 16, width: "85%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#0B4DA2" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: "#f0f0f0", marginRight: 8 },
  cancelText: { textAlign: "center", fontSize: 16, color: "#666" },
  submitButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: "#0B4DA2", marginLeft: 8 },
  submitText: { textAlign: "center", fontSize: 16, color: "white", fontWeight: "600" }
});
