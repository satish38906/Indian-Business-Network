import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, getApiUrl } from "../../constants/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Attempting login with:', { email: normalizedEmail, password: '***' });
      
      const API_URL = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log('Sending request to:', API_URL);
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      console.log('Request sent with body:', JSON.stringify({ email: normalizedEmail, password: password ? '***' : 'MISSING' }));
      console.log('Response received, status:', res.status);

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("FULL Login Response:", data);


      if (res.ok) {
        // ✅ Save Token
        await AsyncStorage.setItem("userToken", data.token);

        // ✅ Save User ID
        await AsyncStorage.setItem("userId", String(data.user.id));

        // ✅ Save User Name
        await AsyncStorage.setItem("userName", data.user.name);

        // ✅ Save User Role
        await AsyncStorage.setItem("userRole", data.user.role || "member");

        console.log("Login Success");
        console.log("Token saved:", await AsyncStorage.getItem("userToken"));
        console.log("UserId saved:", await AsyncStorage.getItem("userId"));

        Alert.alert("Success", "Login Successful");
        
        // ✅ Correct Expo Router Navigation
        router.replace("/dashboard");

      } else {
        console.log("Login failed with status:", res.status);
        console.log("Error message:", data.message);
        Alert.alert("Error", data.message || "Login failed");
      }

    } catch (error) {
      console.log("=== LOGIN ERROR ===");
      console.log("Login error:", error);
      console.log("Error type:", error instanceof Error ? error.name : 'Unknown');
      console.log("Error message:", error instanceof Error ? error.message : 'Unknown error');
      Alert.alert("Error", `Server error: ${error instanceof Error ? error.message : 'Unknown error'}. Check if backend is running on ${API_CONFIG.BASE_URL}`);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Logo */}
      <Image
        source={require("../../assets/images/logo.jpeg")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Indian Business Network</Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 15 }]}
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text style={styles.buttonText}>REGISTER</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <Text style={styles.forgot}>Forgot Password?</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6EDF2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0D3B78",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#0D3B78",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  forgot: {
    marginTop: 20,
    fontSize: 16,
    color: "#0D3B78",
  },
});
