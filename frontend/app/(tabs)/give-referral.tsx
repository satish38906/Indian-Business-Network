import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from "../../constants/api";

type Member = {
  id: number;
  name: string;
  business_name: string;
  business_category: string;
};

export default function GiveReferral() {
  const router = useRouter();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [businessOpportunity, setBusinessOpportunity] = useState("");
  const [referralAmount, setReferralAmount] = useState("");

// ✅ Submit Referral
  const handleSubmit = async () => {
    if (!selectedMemberId || !businessOpportunity || !referralAmount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      console.log('Creating referral:', {
        to_member_id: selectedMemberId,
        business_opportunity: businessOpportunity,
        referral_amount: referralAmount
      });

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFERRALS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_member_id: parseInt(selectedMemberId),
          business_name: businessOpportunity,
          amount: parseFloat(referralAmount),
        }),
      });

      const data = await res.json();
      console.log('Referral response:', data);

      if (res.ok) {
        Alert.alert("Success", "Referral Submitted");
        setSelectedMemberId("");
        setBusinessOpportunity("");
        setReferralAmount("");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Submission failed");
      }
    } catch (error) {
      Alert.alert("Error", "Server error");
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Give Referral</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Member ID Input */}
        <Text style={styles.label}>Member ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Member ID"
          keyboardType="numeric"
          value={selectedMemberId}
          onChangeText={setSelectedMemberId}
        />

        {/* Business Opportunity */}
        <Text style={styles.label}>Business Opportunity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Opportunity"
          value={businessOpportunity}
          onChangeText={setBusinessOpportunity}
        />

        {/* Referral Amount */}
        <Text style={styles.label}>Referral Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Amount"
          keyboardType="numeric"
          value={referralAmount}
          onChangeText={setReferralAmount}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Ionicons
            name="send"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>SUBMIT REFERRAL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ================= Styles =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 60,
    backgroundColor: "#0B4DA2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  form: {
    padding: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B2D5B",
    marginBottom: 6,
    marginTop: 20,
  },

  input: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  button: {
    marginTop: 40,
    backgroundColor: "#0B4DA2",
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
