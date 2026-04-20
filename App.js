// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('150');
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Ladda sparad data när appen startar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedMoney = await AsyncStorage.getItem('@total_saved');
      const savedStreak = await AsyncStorage.getItem('@streak');
      const savedWage = await AsyncStorage.getItem('@hourly_wage');
      if (savedMoney) setTotalSaved(parseInt(savedMoney));
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedWage) setHourlyWage(savedWage);
    } catch (e) { console.log("Kunde inte ladda data"); }
  };

  const saveData = async (money, newStreak) => {
    try {
      await AsyncStorage.setItem('@total_saved', money.toString());
      await AsyncStorage.setItem('@streak', newStreak.toString());
      await AsyncStorage.setItem('@hourly_wage', hourlyWage);
    } catch (e) { console.log("Kunde inte spara data"); }
  };

  const calculate = () => {
    const p = parseFloat(price);
    if (p > 0) {
      const hours = (p / parseFloat(hourlyWage)).toFixed(1);
      setResult({ hours, price: p });
      setSecondsLeft(600); 
      setIsActive(true);
    }
  };

  const handleDecision = (bought) => {
    if (!bought) {
      const newTotal = totalSaved + result.price;
      const newStreak = streak + 1;
      setTotalSaved(newTotal);
      setStreak(newStreak);
      saveData(newTotal, newStreak);
      Alert.alert("Snyggt!", `Du sparade precis ${result.price} kr och ${result.hours} timmar! 🔥`);
    } else {
      setStreak(0);
      saveData(totalSaved, 0);
      Alert.alert("Okej", "Köpet loggat. Streaken nollställd.");
    }
    setResult(null);
    setIsActive(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SPARAT</Text>
          <Text style={styles.statValue}>{totalSaved} kr</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.statValue}>{streak} 🔥</Text>
        </View>
      </View>

      <Text style={styles.logo}>WAIT 10</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Pris i kr..."
          placeholderTextColor="#444"
          value={price}
          onChangeText={setPrice}
        />
        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>RÄKNA UT LIVSKOSTNAD</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.hours}>{result.hours} TIMMAR</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerDisplay}>{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</Text>
            
            {secondsLeft === 0 ? (
              <View style={styles.decisionButtons}>
                <TouchableOpacity 
                  style={[styles.decBtn, {backgroundColor: '#39FF14'}]} 
                  onPress={() => handleDecision(false)}>
                  <Text style={styles.decText}>SKIPPA KÖP 💸</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.decBtn, {backgroundColor: '#222'}]} 
                  onPress={() => handleDecision(true)}>
                  <Text style={[styles.decText, {color: '#fff'}]}>KÖP ÄNDÅ</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.waitText}>Tänk efter nu...</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#39FF14', fontSize: 20, fontWeight: '900' },
  logo: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#111', padding: 20, borderRadius: 20 },
  input: { backgroundColor: '#000', color: '#FFF', borderRadius: 12, padding: 15, fontSize: 18, marginBottom: 15, textAlign: 'center' },
  button: { backgroundColor: '#39FF14', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '900' },
  resultCard: { marginTop: 30, alignItems: 'center' },
  hours: { fontSize: 60, fontWeight: '900', color: '#FFF' },
  timerContainer: { width: '100%', backgroundColor: '#111', padding: 25, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  timerDisplay: { color: '#FFF', fontSize: 48, fontWeight: '700' },
  waitText: { color: '#39FF14', marginTop: 10, fontWeight: 'bold' },
  decisionButtons: { flexDirection: 'row', marginTop: 20, gap: 10 },
  decBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  decText: { fontWeight: '900', fontSize: 14 }
});
