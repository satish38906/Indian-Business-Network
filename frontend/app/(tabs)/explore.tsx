import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../../constants/api";

// Status colors mapping
const STATUS_COLORS: { [key: string]: string } = {
  given: "#FFA500",
  accepted: "#0B3D91",
  closed: "#28A745",
};

export default function ReferralTracking() {
  const [activeTab, setActiveTab] = useState("Given");
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    givenCount: 0,
    receivedCount: 0,
    totalBusiness: 0
  });
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadMemberId();
  }, []);

  useEffect(() => {
    if (memberId) {
      fetchReferrals();
    }
  }, [memberId]);

  const loadMemberId = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMBERS.MY_DATA}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const member = await response.json();
      setMemberId(member.id?.toString());
      console.log('Loaded member_id:', member.id);
    }
  };

  useEffect(() => {
    filterReferrals();
  }, [activeTab, allReferrals, memberId]);

  const filterReferrals = () => {
    if (!memberId || allReferrals.length === 0) {
      setReferrals([]);
      return;
    }

    console.log('Filtering referrals for memberId:', memberId);
    console.log('Total referrals:', allReferrals.length);
    console.log('Sample referral:', allReferrals[0]);

    let filtered = [];
    if (activeTab === "Given") {
      filtered = allReferrals.filter(r => r.from_member_id?.toString() === memberId);
    } else if (activeTab === "Received") {
      filtered = allReferrals.filter(r => r.to_member_id?.toString() === memberId);
    } else if (activeTab === "Closed Business") {
      filtered = allReferrals.filter(r => {
        const isClosed = r.status?.toLowerCase() === "closed";
        const isMember = r.from_member_id?.toString() === memberId || r.to_member_id?.toString() === memberId;
        return isClosed && isMember;
      });
    }
    
    console.log(`${activeTab} filtered count:`, filtered.length);
    setReferrals(filtered);
  };

  const fetchReferrals = async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFERRALS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch referrals");
        setAllReferrals([]);
        setReferrals([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Raw referrals data:', data.length, 'referrals');
      console.log('Sample referral:', data[0]);
      console.log('All referral statuses:', data.map(r => ({ id: r.id, status: r.status, amount: r.amount })));

      if (Array.isArray(data)) {
        setAllReferrals(data);
        
        const givenRefs = data.filter(r => r.from_member_id?.toString() === memberId);
        const receivedRefs = data.filter(r => r.to_member_id?.toString() === memberId);
        const totalReceivedValue = receivedRefs.reduce((sum, r) => sum + (parseFloat(r.amount || 0)), 0);
        const closedRefs = data.filter(r => {
          const isClosed = r.status?.toLowerCase() === "closed";
          const isMember = r.from_member_id?.toString() === memberId || r.to_member_id?.toString() === memberId;
          return isClosed && isMember;
        });
        const closedValue = closedRefs.reduce((sum, r) => {
          const amount = parseFloat(r.amount || 0);
          console.log('Adding amount:', amount, 'from referral:', r.id);
          return sum + amount;
        }, 0);
        const totalValue = closedValue > 0 ? closedValue : totalReceivedValue;
        
        console.log('Stats:', { given: givenRefs.length, received: receivedRefs.length, closed: closedRefs.length, closedValue, totalReceivedValue, totalValue });
        console.log('Closed referrals:', closedRefs);
        
        setStats({
          givenCount: givenRefs.length,
          receivedCount: receivedRefs.length,
          totalBusiness: totalValue
        });
      } else {
        setAllReferrals([]);
        setReferrals([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
      setError("Network error. Please try again.");
      setAllReferrals([]);
      setReferrals([]);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Referral Tracking</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Given", "Received", "Closed Business"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Statistics Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Given Referrals</Text>
          <Text style={styles.statValue}>{stats.givenCount} people gave business</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Received Referrals</Text>
          <Text style={styles.statValue}>{stats.receivedCount} people gave business</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Business</Text>
          <Text style={styles.statValue}>₹{stats.totalBusiness.toLocaleString()}</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#0B3D91" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReferrals}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView>
          {referrals.length === 0 ? (
            <Text style={styles.noData}>No referrals found.</Text>
          ) : (
            referrals.map((ref, index) => (
              <View key={ref.id || index} style={styles.card}>
                <Text style={styles.title}>
                  {activeTab === "Given" 
                    ? `To: ${ref.to_member_name || ref.to_name || "Unknown"}` 
                    : `From: ${ref.from_member_name || ref.from_name || "Unknown"}`}
                </Text>
                <Text style={styles.subtitle}>
                  {ref.business_name || ref.subject || "No subject"}
                </Text>

                <View style={styles.row}>
                  <Text>
                    Status:{" "}
                    <Text
                      style={{
                        color: STATUS_COLORS[ref.status?.toLowerCase()] || "#000",
                        fontWeight: "bold",
                      }}
                    >
                      {ref.status || "N/A"}
                    </Text>
                  </Text>
                  {ref.amount && (
                    <Text style={styles.amount}>₹{ref.amount}</Text>
                  )}
                </View>
                {ref.created_at && (
                  <Text style={styles.dateTime}>
                    {new Date(ref.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(ref.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B3D91",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  tabContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#0B3D91",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#0B3D91",
  },
  tabText: {
    color: "#0B3D91",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0B3D91",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amount: {
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
  dateTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0B3D91",
  },
});
