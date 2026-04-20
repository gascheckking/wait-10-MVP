// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('150');
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const loadData = async () => {
    try {
      const sMoney = await AsyncStorage.getItem('@total_saved');
      const sStreak = await AsyncStorage.getItem('@streak');
      const sWage = await AsyncStorage.getItem('@hourly_wage');
      if (sMoney) setTotalSaved(parseInt(sMoney));
      if (sStreak) setStreak(parseInt(sStreak));
      if (sWage) setHourlyWage(sWage);
    } catch (e) { console.log("Load Error"); }
  };

  const calculate = () => {
    const p = parseFloat(price);
    const w = parseFloat(hourlyWage);
    if (p > 0 && w > 0) {
      const hrs = (p / w).toFixed(1);
      setResult({ hours: hrs, price: p });
      setSecondsLeft(600); 
      setIsActive(true);
    }
  };

  const handleDecision = async (bought) => {
    let newTotal = totalSaved;
    let newStreak = streak;

    if (!bought) {
      newTotal += result.price;
      newStreak += 1;
    } else {
      newStreak = 0;
    }

    setTotalSaved(newTotal);
    setStreak(newStreak);
    await AsyncStorage.setItem('@total_saved', newTotal.toString());
    await AsyncStorage.setItem('@streak', newStreak.toString());
    setResult(null);
    setPrice('');
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconCircle}>
            <Text style={{fontSize: 20}}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>WAIT 10</Text>
          </View>
          <View style={styles.iconCircle}>
             <Text style={{fontSize: 18, color: '#39FF14', fontWeight: 'bold'}}>{streak}</Text>
          </View>
        </View>

        {/* STATS BAR */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SPARAD TID</Text>
            <Text style={styles.statValue}>{(totalSaved / parseFloat(hourlyWage)).toFixed(0)}H</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>VINST</Text>
            <Text style={styles.statValue}>{totalSaved} kr</Text>
          </View>
        </View>

        {/* CALC SECTION */}
        {!result ? (
          <View style={styles.calcArea}>
            <Text style={styles.inputHint}>VAD KOSTAR DET DU VILL HA?</Text>
            <TextInput
              style={styles.bigInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#222"
              value={price}
              onChangeText={setPrice}
              maxLength={7}
            />
            <TouchableOpacity 
              style={[styles.mainBtn, {opacity: price ? 1 : 0.5}]} 
              onPress={calculate}
              disabled={!price}
            >
              <Text style={styles.mainBtnText}>ANALUSERA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* RESULT & TIMER */
          <View style={styles.resultArea}>
            <View style={styles.hoursCircle}>
               <Text style={styles.hoursVal}>{result.hours}H</Text>
               <Text style={styles.hoursLabel}>AV DITT LIV</Text>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerTime}>
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </Text>
              {secondsLeft === 0 ? (
                <View style={styles.btnStack}>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
                    <Text style={styles.saveBtnText}>SKIPPA KÖPET 🔥</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => handleDecision(true)}>
                    <Text style={styles.buyBtnText}>Köp ändå</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.waitMsg}>TÄNK EFTER...</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Din profil</Text>
            <Text style={styles.modalLabel}>LÖN EFTER SKATT (KR/H)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={() => {
               AsyncStorage.setItem('@hourly_wage', hourlyWage);
               setShowSettings(false);
            }}>
              <Text style={styles.modalBtnText}>SPARA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 20, paddingTop: 50, alignItems: 'center' },
  header: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logoText: { color: '#39FF14', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  statsRow: { flexDirection: 'row', gap: 15, width: '100%', marginBottom: 40 },
  statCard: { flex: 1, backgroundColor: '#080808', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#111' },
  statLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  calcArea: { width: '100%', alignItems: 'center', marginTop: 20 },
  inputHint: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  bigInput: { color: '#fff', fontSize: 100, fontWeight: '900', marginVertical: 20, width: '100%', textAlign: 'center' },
  mainBtn: { backgroundColor: '#39FF14', width: '100%', padding: 22, borderRadius: 25, alignItems: 'center', shadowColor: '#39FF14', shadowRadius: 15, shadowOpacity: 0.3 },
  mainBtnText: { color: '#000', fontWeight: '900', fontSize: 18 },
  resultArea: { width: '100%', alignItems: 'center' },
  hoursCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, borderColor: '#39FF14', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  hoursVal: { color: '#fff', fontSize: 60, fontWeight: '900' },
  hoursLabel: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  timerContainer: { width: '100%', alignItems: 'center' },
  timerTime: { color: '#fff', fontSize: 50, fontWeight: '800', marginBottom: 20 },
  btnStack: { width: '100%', gap: 15 },
  saveBtn: { backgroundColor: '#39FF14', padding: 22, borderRadius: 25, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 18 },
  buyBtn: { padding: 20, alignItems: 'center' },
  buyBtnText: { color: '#444', fontWeight: 'bold' },
  waitMsg: { color: '#39FF14', fontWeight: 'bold', letterSpacing: 2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#111', padding: 40, borderRadius: 30, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 25 },
  modalLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { backgroundColor: '#000', color: '#fff', padding: 20, borderRadius: 15, fontSize: 20, marginBottom: 25 },
  modalBtn: { backgroundColor: '#39FF14', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalBtnText: { color: '#000', fontWeight: '900' }
});
