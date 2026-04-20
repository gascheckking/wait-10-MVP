// App.js
// Filnamn: Wait10_V4_Intelligence.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Share, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('150');
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [smartTip, setSmartTip] = useState('');

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
      const sHistory = await AsyncStorage.getItem('@history');
      if (sMoney) setTotalSaved(parseInt(sMoney));
      if (sStreak) setStreak(parseInt(sStreak));
      if (sWage) setHourlyWage(sWage);
      if (sHistory) setHistory(JSON.parse(sHistory));
    } catch (e) { console.log("Load error"); }
  };

  const saveData = async (money, newStreak, newHistory, newWage) => {
    try {
      await AsyncStorage.setItem('@total_saved', money.toString());
      await AsyncStorage.setItem('@streak', newStreak.toString());
      await AsyncStorage.setItem('@history', JSON.stringify(newHistory));
      await AsyncStorage.setItem('@hourly_wage', newWage || hourlyWage);
    } catch (e) { console.log("Save error"); }
  };

  // Intelligence Engine - Bryggan till Gränsfri
  const getSmartTip = (p) => {
    if (p > 1000) return "💡 Tips: Kolla priset i Tyskland/Danmark. Du kan spara ca 4h jobb på detta.";
    if (p > 500) return "💡 Tips: Köp begagnat på Marketplace för att spara 2h livstid.";
    return "💡 Tips: Varje sparad hundralapp är 45 min frihet.";
  };

  const calculate = () => {
    const p = parseFloat(price);
    const w = parseFloat(hourlyWage);
    if (p > 0 && w > 0) {
      const hrs = (p / w).toFixed(1);
      setResult({ hours: hrs, price: p });
      setSmartTip(getSmartTip(p));
      setSecondsLeft(600);
      setIsActive(true);
    }
  };

  const handleDecision = (bought) => {
    let newHistory = [...history];
    let newTotal = totalSaved;
    let newStreak = streak;

    if (!bought) {
      newTotal += result.price;
      newStreak += 1;
      newHistory.unshift({ id: Date.now(), hours: result.hours, price: result.price, status: 'SAVED' });
    } else {
      newStreak = 0;
      newHistory.unshift({ id: Date.now(), hours: result.hours, price: result.price, status: 'BOUGHT' });
    }

    newHistory = newHistory.slice(0, 5);
    setTotalSaved(newTotal);
    setStreak(newStreak);
    setHistory(newHistory);
    saveData(newTotal, newStreak, newHistory);
    setResult(null);
    setPrice('');
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* TOP NAV */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{streak} DAYS 🔥</Text>
          </View>
        </View>

        {/* HERO STATS */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>DIN TOTALA VINST</Text>
          <Text style={styles.heroValue}>{totalSaved} KR</Text>
        </View>

        {/* INPUT */}
        {!result && (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.mainInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#222"
              value={price}
              onChangeText={setPrice}
              autoFocus={true}
            />
            <Text style={styles.currencyLabel}>KRONOR</Text>
            <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
              <Text style={styles.calcBtnText}>RÄKNA LIVSTID</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RESULTS */}
        {result && (
          <View style={styles.resultArea}>
            <View style={styles.neonCard}>
              <Text style={styles.neonHours}>{result.hours}H</Text>
              <Text style={styles.neonSub}>AV DITT LIV</Text>
            </View>
            
            <Text style={styles.smartTipText}>{smartTip}</Text>

            <View style={styles.timerWrapper}>
              <Text style={styles.timerClock}>
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </Text>
              {secondsLeft === 0 ? (
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.saveAction} onPress={() => handleDecision(false)}>
                    <Text style={styles.actionText}>SKIPPA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyAction} onPress={() => handleDecision(true)}>
                    <Text style={styles.actionText}>KÖP</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.lockedText}>BESLUT LÅST TILLS TIDEN GÅTT UT</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>INSTÄLLNINGAR</Text>
            <Text style={styles.modalLabel}>DIN TIMLÖN (EFTER SKATT)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => {
              saveData(totalSaved, streak, history, hourlyWage);
              setShowSettings(false);
            }}>
              <Text style={styles.modalCloseText}>SPARA & STÄNG</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000' },
  container: { padding: 30, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  settingsIcon: { fontSize: 24 },
  streakBadge: { backgroundColor: '#111', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  streakText: { color: '#39FF14', fontWeight: 'bold', fontSize: 12 },
  hero: { alignItems: 'center', marginBottom: 50 },
  heroLabel: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroValue: { color: '#fff', fontSize: 42, fontWeight: '900' },
  inputArea: { alignItems: 'center' },
  mainInput: { color: '#fff', fontSize: 100, fontWeight: '900', textAlign: 'center' },
  currencyLabel: { color: '#39FF14', fontSize: 14, fontWeight: 'bold', marginTop: -10, marginBottom: 40 },
  calcBtn: { backgroundColor: '#39FF14', width: '100%', padding: 22, borderRadius: 20, alignItems: 'center' },
  calcBtnText: { fontWeight: '900', fontSize: 16 },
  resultArea: { width: '100%' },
  neonCard: { backgroundColor: '#39FF14', padding: 40, borderRadius: 40, alignItems: 'center', shadowColor: '#39FF14', shadowRadius: 20, shadowOpacity: 0.4 },
  neonHours: { fontSize: 90, fontWeight: '900', lineHeight: 90 },
  neonSub: { fontWeight: 'bold', fontSize: 16 },
  smartTipText: { color: '#39FF14', textAlign: 'center', marginTop: 20, fontSize: 13, fontWeight: '600', fontStyle: 'italic' },
  timerWrapper: { marginTop: 30, backgroundColor: '#111', padding: 30, borderRadius: 40, alignItems: 'center' },
  timerClock: { color: '#fff', fontSize: 40, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
  saveAction: { flex: 1, backgroundColor: '#39FF14', padding: 20, borderRadius: 20, alignItems: 'center' },
  buyAction: { flex: 1, backgroundColor: '#222', padding: 20, borderRadius: 20, alignItems: 'center' },
  actionText: { fontWeight: '900' },
  lockedText: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 15 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111', padding: 40, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 30 },
  modalLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { backgroundColor: '#000', color: '#fff', padding: 20, borderRadius: 15, fontSize: 20, marginBottom: 30 },
  modalClose: { backgroundColor: '#39FF14', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalCloseText: { fontWeight: '900' }
});
