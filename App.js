// App.js
// Filnamn: Karma_Interactive_Timer.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [price, setPrice] = useState('');
  const [monthlyWage, setMonthlyWage] = useState('43000');
  const [hourlyWage, setHourlyWage] = useState('196');
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const goalPrice = 5000; 
  const progress = Math.min((totalSaved / goalPrice) * 100, 100);

  const calculateHourlyFromMonthly = (monthly) => {
    const taxRate = 0.24; 
    const afterTax = monthly * (1 - taxRate);
    return (afterTax / 167).toFixed(0);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const loadData = async () => {
    try {
      const sMoney = await AsyncStorage.getItem('@total_saved');
      const sWage = await AsyncStorage.getItem('@hourly_wage');
      const sStreak = await AsyncStorage.getItem('@streak');
      if (sMoney) setTotalSaved(parseInt(sMoney));
      if (sWage) setHourlyWage(sWage);
      if (sStreak) setStreak(parseInt(sStreak));
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

  const handleDecision = async (bought) => {
    let newTotal = totalSaved;
    let newStreak = streak;

    if (!bought) {
      newTotal += result.price;
      newStreak += 1;
      Alert.alert("KARMA!", `Snyggt! Du lade precis ${result.price} kr till ditt sparmål.`);
    } else {
      newStreak = 0;
    }

    setTotalSaved(newTotal);
    setStreak(newStreak);
    await AsyncStorage.setItem('@total_saved', newTotal.toString());
    await AsyncStorage.setItem('@streak', newStreak.toString());
    
    setResult(null);
    setPrice('');
    setIsActive(false);
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.circleBtn}>
            <Text style={{fontSize: 18}}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>KARMA</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{streak} 🔥</Text>
          </View>
        </View>

        {/* GOAL CARD */}
        <View style={styles.goalCard}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>MOT WEEKENDRESA</Text>
            <Text style={styles.goalPercent}>{progress.toFixed(0)}%</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.savedSub}>{totalSaved} kr av {goalPrice} kr sparade</Text>
        </View>

        {!result ? (
          <View style={styles.inputSection}>
            <Text style={styles.label}>VAD KOSTAR IMPULSEN?</Text>
            <TextInput
              style={styles.mainInput}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#222"
            />
            <TouchableOpacity style={styles.mainBtn} onPress={calculate} disabled={!price}>
              <Text style={styles.mainBtnText}>ANALYSERA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultSection}>
            <Text style={styles.resLabel}>DET KOSTAR DIG</Text>
            <Text style={styles.resValue}>
              {result.mins < 60 ? `${result.mins} MIN` : `${result.hours} H`}
            </Text>
            <Text style={styles.resSubText}>AV DITT LIV I BOTKYRKA</Text>

            <View style={styles.timerArea}>
              <Text style={styles.timerNum}>{secondsLeft}s</Text>
              
              {/* NY LOGIK: Visa "Skippa"-knappen direkt under nedräkningen */}
              {secondsLeft > 0 ? (
                <View style={{alignItems: 'center', width: '100%'}}>
                  <Text style={styles.waitText}>LÅT IMPULSEN LÄGGA SIG...</Text>
                  <TouchableOpacity 
                    style={styles.earlySaveBtn} 
                    onPress={() => handleDecision(false)}
                  >
                    <Text style={styles.earlySaveText}>AVBÖJ KÖP & SPARA NU</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
                    <Text style={styles.saveText}>✅ SKIPPA KÖP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => handleDecision(true)}>
                    <Text style={styles.buyText}>😅 KÖP</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL FÖR INSTÄLLNINGAR */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>DIN PROFIL</Text>
            <Text style={styles.modalLabel}>MÅNADSLÖN (BOTKYRKA)</Text>
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
              <Text style={styles.infoText}>💰 Beräknad timlön: {hourlyWage} kr/h</Text>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalBtnText}>KLART</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  innerContainer: { width: '100%', maxWidth: 400, padding: 25, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  logo: { color: '#39FF14', fontWeight: '900', fontSize: 18, letterSpacing: 3 },
  streakBadge: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  streakText: { color: '#fff', fontWeight: 'bold' },
  
  goalCard: { backgroundColor: '#080808', padding: 20, borderRadius: 25, marginBottom: 30, borderWidth: 1, borderColor: '#111' },
  goalInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  goalTitle: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  goalPercent: { color: '#39FF14', fontWeight: 'bold' },
  barBg: { height: 6, backgroundColor: '#111', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#39FF14' },
  savedSub: { color: '#222', fontSize: 10, marginTop: 10, textAlign: 'center', fontWeight: 'bold' },

  inputSection: { alignItems: 'center', marginTop: 20 },
  label: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  mainInput: { color: '#fff', fontSize: 70, fontWeight: '900', marginVertical: 15 },
  mainBtn: { backgroundColor: '#39FF14', width: '100%', padding: 20, borderRadius: 25, alignItems: 'center' },
  mainBtnText: { fontWeight: '900', fontSize: 16 },

  resultSection: { alignItems: 'center' },
  resLabel: { color: '#444', fontWeight: 'bold', fontSize: 12 },
  resValue: { color: '#fff', fontSize: 60, fontWeight: '900', marginVertical: 10 },
  resSubText: { color: '#39FF14', fontWeight: 'bold', fontSize: 10, letterSpacing: 1 },
  
  timerArea: { marginTop: 30, width: '100%', alignItems: 'center' },
  timerNum: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  waitText: { color: '#444', fontWeight: 'bold', marginTop: 10, fontSize: 11, letterSpacing: 1 },
  
  // NY STIL FÖR TIDIG SPARKNAPP
  earlySaveBtn: { marginTop: 20, backgroundColor: '#111', padding: 15, borderRadius: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#39FF14' },
  earlySaveText: { color: '#39FF14', fontWeight: '900', fontSize: 14 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  saveBtn: { flex: 2, backgroundColor: '#39FF14', padding: 18, borderRadius: 20, alignItems: 'center' },
  saveText: { fontWeight: '900', color: '#000' },
  buyBtn: { flex: 1, backgroundColor: '#111', padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  buyText: { color: '#444', fontWeight: 'bold' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#111', padding: 30, borderRadius: 35 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 20 },
  modalLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  modalInput: { backgroundColor: '#000', color: '#fff', padding: 15, borderRadius: 15, fontSize: 20, marginBottom: 15 },
  infoBox: { backgroundColor: '#050505', padding: 12, borderRadius: 12, marginBottom: 20 },
  infoText: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  modalBtn: { backgroundColor: '#39FF14', padding: 18, borderRadius: 20, alignItems: 'center' },
  modalBtnText: { fontWeight: '900', color: '#000' }
});
