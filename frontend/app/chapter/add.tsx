import { View, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function AddMember() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    business_name: "",
    image:"",
    contact_number: ""
  });

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem("userToken");

    const res = await fetch("http://10.123.181.47:5000/api/members/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Success", "Member Added");
    } else {
      Alert.alert("Error", data.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Name" onChangeText={(t)=>setForm({...form,name:t})}/>
      <TextInput placeholder="Email" onChangeText={(t)=>setForm({...form,email:t})}/>
      <TextInput placeholder="Password" secureTextEntry onChangeText={(t)=>setForm({...form,password:t})}/>
      <TextInput placeholder="Business Name" onChangeText={(t)=>setForm({...form,business_name:t})}/>
      <TextInput placeholder="Contact Number" onChangeText={(t)=>setForm({...form,contact_number:t})}/>
      
      <Button title="Add Member" onPress={handleAdd}/>
    </View>
  );
}
