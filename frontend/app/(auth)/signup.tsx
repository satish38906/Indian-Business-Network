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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      console.log('Attempting signup with:', { name, email: email.trim().toLowerCase() });
      
      const res = await fetch("http://10.123.181.47:5001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      console.log('Signup response:', data);

      if (res.ok) {
        Alert.alert("Success", `User created. Please login with: ${email.trim().toLowerCase()}`);
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Error", data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Server error. Please try again.");
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

      {/* Name */}
      <TextInput
        placeholder="Name"
        placeholderTextColor="#666"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
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

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>REGISTER</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <Text style={styles.loginText}>
        Have an account?{" "}
        <Text style={styles.loginLink} onPress={() => router.push("/(auth)/login")}>
          Login
        </Text>
      </Text>
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
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  loginText: {
    marginTop: 20,
    fontSize: 16,
    color: "#0D3B78",
  },

  loginLink: {
    fontWeight: "bold",
  },
});
