// App.js
// Filnamn: Karma_Botkyrka_Update.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [price, setPrice] = useState('');
  const [monthlyWage, setMonthlyWage] = useState('43000'); // Input för månadslön
  const [hourlyWage, setHourlyWage] = useState('196');
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Beräkna timlön baserat på Botkyrka-skatt (ca 24% effektiv skatt efter avdrag på denna lönivå)
  const calculateHourlyFromMonthly = (monthly) => {
    const taxRate = 0.24; // Effektiv skatt för 43k i Botkyrka (efter jobbskatteavdrag)
    const afterTax = monthly * (1 - taxRate);
    const hourly = (afterTax / 167).toFixed(0);
    return hourly;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sMoney = await AsyncStorage.getItem('@total_saved');
      const sWage = await AsyncStorage.getItem('@hourly_wage');
      if (sMoney) setTotalSaved(parseInt(sMoney));
      if (sWage) setHourlyWage(sWage);
    } catch (e) { console.log("Load Error"); }
  };

  const calculate = () => {
    const p = parseFloat(price);
    const w = parseFloat(hourlyWage);
    if (p > 0 && w > 0) {
      const totalHours = p / w;
      setResult({ 
        hours: totalHours.toFixed(1), 
        mins: Math.round(totalHours * 60), 
        price: p 
      });
      setSecondsLeft(60); 
      setIsActive(true);
    }
  };

  // ... (Samma useEffect för timer och handleDecision som tidigare)

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.circleBtn}>
            <Text style={{fontSize: 20}}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>KARMA</Text>
          <View style={styles.streakBadge}><Text style={styles.streakText}>{streak} 🔥</Text></View>
        </View>

        {!result ? (
          <View style={styles.inputArea}>
            <Text style={styles.label}>VAD KOSTAR DET?</Text>
            <TextInput
              style={styles.mainInput}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#111"
            />
            <TouchableOpacity style={styles.mainBtn} onPress={calculate}>
              <Text style={styles.mainBtnText}>RÄKNA LIVSTID</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultArea}>
             <Text style={styles.resVal}>{result.mins < 60 ? `${result.mins} MIN` : `${result.hours} H`}</Text>
             <Text style={styles.resSub}>AV DITT LIV I BOTKYRKA</Text>
             {/* Beslutsknappar här... */}
          </View>
        )}

      </ScrollView>

      {/* MODAL MED AUTOMATISK KALKYLATOR */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>DIN LÖNEPROFIL</Text>
            
            <Text style={styles.modalLabel}>MÅNADSLÖN INNAN SKATT (KR)</Text>
            <TextInput 
              style={styles.modalInput} 
              keyboardType="numeric" 
              value={monthlyWage} 
              onChangeText={(val) => {
                setMonthlyWage(val);
                setHourlyWage(calculateHourlyFromMonthly(val));
              }} 
            />
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>📍 Kommun: Botkyrka</Text>
              <Text style={styles.infoText}>💰 Beräknad timlön: {hourlyWage} kr/h</Text>
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={() => {
              AsyncStorage.setItem('@hourly_wage', hourlyWage);
              setShowSettings(false);
            }}>
              <Text style={styles.modalBtnText}>UPPDATERA PROFIL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000' },
  container: { padding: 30, paddingTop: 60, alignItems: 'center' },
  header: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  circleBtn: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  logo: { color: '#39FF14', fontWeight: '900', fontSize: 22, letterSpacing: 4 },
  streakBadge: { backgroundColor: '#111', padding: 10, borderRadius: 15 },
  streakText: { color: '#fff', fontWeight: 'bold' },
  inputArea: { width: '100%', alignItems: 'center' },
  label: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  mainInput: { color: '#fff', fontSize: 100, fontWeight: '900', marginVertical: 20 },
  mainBtn: { backgroundColor: '#39FF14', width: '100%', padding: 25, borderRadius: 30, alignItems: 'center' },
  mainBtnText: { fontWeight: '900', fontSize: 18 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 25 },
  modalCard: { backgroundColor: '#111', padding: 35, borderRadius: 40, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 25 },
  modalLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  modalInput: { backgroundColor: '#000', color: '#fff', padding: 20, borderRadius: 20, fontSize: 22, marginBottom: 20 },
  infoBox: { backgroundColor: '#050505', padding: 15, borderRadius: 15, marginBottom: 25, borderLeftWidth: 3, borderLeftColor: '#39FF14' },
  infoText: { color: '#888', fontSize: 13, marginBottom: 5 },
  modalBtn: { backgroundColor: '#39FF14', padding: 20, borderRadius: 20, alignItems: 'center' },
  modalBtnText: { fontWeight: '900' }
});
