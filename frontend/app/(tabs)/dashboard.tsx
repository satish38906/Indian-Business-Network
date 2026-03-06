import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { API_CONFIG, getApiUrl } from "../../constants/api";

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    presenter: "",
  });
  const [dashboardData, setDashboardData] = useState({
    referralsGiven: 0,
    referralsReceived: 0,
    businessClosed: 0,
  });

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      
      console.log("Token from AsyncStorage:", token ? "Found" : "Not found");
      console.log("UserId in AsyncStorage:", userId);

      if (!token) {
        console.error("User token missing");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}/member?t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Dashboard data:", JSON.stringify(data, null, 2));

      if (res.ok) {
        const newData = {
          referralsGiven: parseInt(data.referrals?.given_count || "0"),
          referralsReceived: parseInt(data.referrals?.received_count || "0"),
          businessClosed: parseFloat(data.referrals?.received_value || "0"),
        };
        console.log("Setting dashboard state:", newData);
        console.log("Closed value:", data.referrals?.closed_value);
        console.log("Received value:", data.referrals?.received_value);
        setDashboardData(newData);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        console.log("Dashboard API Error:", data.message);
      }
    } catch (error) {
      console.log("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
      fetchMeetings();
    }, [])
  );

  const fetchMeetings = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEETINGS}/1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.slice(0, 3));
      }
    } catch (error) {
      console.log("Failed to fetch meetings:", error);
    }
  };

  const createMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date) {
      Alert.alert("Error", "Title and date are required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEETINGS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapter_id: 1,
          title: meetingForm.title,
          meeting_date: `${meetingForm.date} ${meetingForm.time || '10:00'}`,
          location: meetingForm.location,
          description: `Presenter: ${meetingForm.presenter}`,
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Meeting created successfully");
        setShowMeetingModal(false);
        setMeetingForm({ title: "", date: "", time: "", location: "", presenter: "" });
        fetchMeetings();
      } else {
        Alert.alert("Error", "Failed to create meeting");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1F4E8C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDashboard(true)}
            colors={["#1F4E8C"]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.updateTime}>Updated: {lastUpdate}</Text>
          </View>
          <Ionicons name="person-circle" size={40} color="white" />
        </View>

        <View style={styles.topCard}>
          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => router.push("/chapter" as any)}
          >
            <View style={[styles.circle, { backgroundColor: "#FF9800" }]}>
              <MaterialIcons name="business" size={32} color="white" />
            </View>
            <Text style={styles.iconText}>Chapter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => router.push("/meeting" as any)}
          >
            <View style={[styles.circle, { backgroundColor: "#1BA94C" }]}>
              <Ionicons name="calendar" size={32} color="white" />
            </View>
            <Text style={styles.iconText}>Meeting</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Referrals Given</Text>
          <Text style={styles.statValue}>{dashboardData.referralsGiven}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Referrals Received</Text>
          <Text style={styles.statValue}>{dashboardData.referralsReceived}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Business Closed</Text>
          <Text style={styles.statValue}>₹{dashboardData.businessClosed.toLocaleString()}</Text>
        </View>

        <View style={styles.meetingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
            <TouchableOpacity onPress={() => setShowMeetingModal(true)}>
              <Ionicons name="add-circle" size={28} color="#1BA94C" />
            </TouchableOpacity>
          </View>

          {meetings.length === 0 ? (
            <Text style={styles.noMeetings}>No upcoming meetings</Text>
          ) : (
            meetings.map((meeting) => (
              <TouchableOpacity
                key={meeting.id}
                style={styles.meetingCard}
                onPress={() => router.push("/meeting" as any)}
              >
                <View style={styles.meetingIcon}>
                  <Ionicons name="calendar" size={24} color="#1BA94C" />
                </View>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <Text style={styles.meetingDate}>
                    {new Date(meeting.meeting_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.meetingLocation}>{meeting.location || "TBD"}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Modal visible={showMeetingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Meeting</Text>

              <TextInput
                style={styles.input}
                placeholder="Meeting Title"
                value={meetingForm.title}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, title: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={meetingForm.date}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, date: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Time (HH:MM)"
                value={meetingForm.time}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, time: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Location/Hotel"
                value={meetingForm.location}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, location: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Presenter Name"
                value={meetingForm.presenter}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, presenter: text })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowMeetingModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={createMeeting}>
                  <Text style={styles.submitText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  header: {
    backgroundColor: "#1F4E8C",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 15,
  },
  welcome: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
  updateTime: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  topCard: {
    marginTop: 5,
    marginHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 25,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconBox: {
    alignItems: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  statCard: {
    marginTop: 18,
    marginHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  statTitle: {
    fontSize: 16,
    color: "#667085",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  meetingsSection: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  noMeetings: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    paddingVertical: 20,
  },
  meetingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  meetingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  meetingDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  meetingLocation: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1BA94C",
    marginLeft: 8,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
}); 