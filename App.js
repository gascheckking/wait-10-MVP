// App.js
// Filnamn: Wait10_V5_Final_MVP.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Share, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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
  const [isFounder, setIsFounder] = useState(false);

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
      const sFounder = await AsyncStorage.getItem('@is_founder');
      if (sMoney) setTotalSaved(parseInt(sMoney));
      if (sStreak) setStreak(parseInt(sStreak));
      if (sWage) setHourlyWage(sWage);
      if (sHistory) setHistory(JSON.parse(sHistory));
      if (sFounder) setIsFounder(true);
    } catch (e) { console.log("Load Error"); }
  };

  const saveData = async (money, newStreak, newHistory, founderStatus) => {
    try {
      await AsyncStorage.setItem('@total_saved', money.toString());
      await AsyncStorage.setItem('@streak', newStreak.toString());
      await AsyncStorage.setItem('@history', JSON.stringify(newHistory));
      if (founderStatus) await AsyncStorage.setItem('@is_founder', 'true');
    } catch (e) { console.log("Save Error"); }
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

  const handleDecision = (bought) => {
    let newHistory = [...history];
    let newTotal = totalSaved;
    let newStreak = streak;
    let founderEarned = isFounder;

    if (!bought) {
      newTotal += result.price;
      newStreak += 1;
      founderEarned = true; // Första sparade köpet ger Founder-status
      newHistory.unshift({ id: Date.now(), hours: result.hours, price: result.price, status: 'SAVED' });
    } else {
      newStreak = 0;
      newHistory.unshift({ id: Date.now(), hours: result.hours, price: result.price, status: 'BOUGHT' });
    }

    newHistory = newHistory.slice(0, 3);
    setTotalSaved(newTotal);
    setStreak(newStreak);
    setHistory(newHistory);
    setIsFounder(founderEarned);
    saveData(newTotal, newStreak, newHistory, founderEarned);
    setResult(null);
    setPrice('');
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* TOP STATUS BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
          {isFounder && (
            <View style={styles.founderTag}>
              <Text style={styles.founderLabel}>🔥 FOUNDER #2026</Text>
            </View>
          )}
          <View style={styles.iconBtn}>
            <Text style={styles.iconText}>📈</Text>
          </View>
        </View>

        {/* STATS OVERVIEW */}
        <View style={styles.statsRow}>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={styles.statNum}>{streak} DAGAR</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>VINST</Text>
            <Text style={styles.statNum}>{totalSaved} KR</Text>
          </View>
        </View>

        {/* INPUT MODE */}
        {!result && (
          <View style={styles.inputBody}>
            <Text style={styles.mainPrompt}>VAD KOSTAR DET?</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#1a1a1a"
              value={price}
              onChangeText={setPrice}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={calculate}>
              <Text style={styles.primaryBtnText}>ANALYSERA LIVSKOSTNAD</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SHARE CARD MODE */}
        {result && (
          <View style={styles.cardContainer}>
            <View style={styles.shareCard}>
              <Text style={styles.cardHeader}>LIVSKOSTNAD</Text>
              <Text style={styles.cardHours}>{result.hours}H</Text>
              <Text style={styles.cardSub}>AV DITT LIV</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.footerBrand}>WAIT 10 / APP</Text>
                <Text style={styles.footerLink}>github.com/wait10</Text>
              </View>
            </View>

            <View style={styles.timerSection}>
              <Text style={styles.timerDigital}>
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </Text>
              {secondsLeft === 0 ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
                    <Text style={styles.saveBtnText}>SKIPPA KÖP 💸</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => handleDecision(true)}>
                    <Text style={styles.buyBtnText}>KÖP ÄNDÅ</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.timerHint}>TÄNK EFTER. ÄR DET VÄRT TIDEN?</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} animationType="fade" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>PROFIL</Text>
            <Text style={styles.modalSub}>TIMLÖN EFTER SKATT</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSettings(false)}>
              <Text style={styles.closeBtnText}>SPARA ÄNDRINGAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 25, paddingTop: 60, alignItems: 'center' },
  topBar: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  iconBtn: { padding: 10, backgroundColor: '#111', borderRadius: 12 },
  iconText: { fontSize: 20 },
  founderTag: { backgroundColor: '#39FF14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  founderLabel: { color: '#000', fontSize: 10, fontWeight: '900' },
  statsRow: { flexDirection: 'row', width: '100%', gap: 15, marginBottom: 40 },
  statLine: { flex: 1, borderLeftWidth: 2, borderLeftColor: '#39FF14', paddingLeft: 15 },
  statLabel: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  statNum: { color: '#fff', fontSize: 20, fontWeight: '900' },
  inputBody: { width: '100%', alignItems: 'center' },
  mainPrompt: { color: '#39FF14', fontWeight: 'bold', fontSize: 12, letterSpacing: 2 },
  priceInput: { color: '#fff', fontSize: 100, fontWeight: '900', marginVertical: 20 },
  primaryBtn: { backgroundColor: '#39FF14', width: '100%', padding: 25, borderRadius: 24, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  cardContainer: { width: '100%' },
  shareCard: { backgroundColor: '#39FF14', width: '100%', borderRadius: 40, padding: 40, alignItems: 'center' },
  cardHeader: { color: '#000', fontWeight: 'bold', letterSpacing: 1 },
  cardHours: { color: '#000', fontSize: 90, fontWeight: '900', lineHeight: 100 },
  cardSub: { color: '#000', fontWeight: '800', fontSize: 16 },
  cardFooter: { marginTop: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', opacity: 0.5 },
  footerBrand: { color: '#000', fontSize: 8, fontWeight: 'bold' },
  footerLink: { color: '#000', fontSize: 8, fontWeight: 'bold' },
  timerSection: { marginTop: 20, backgroundColor: '#111', borderRadius: 40, padding: 30, alignItems: 'center' },
  timerDigital: { color: '#fff', fontSize: 42, fontWeight: '700' },
  timerHint: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  saveBtn: { flex: 1, backgroundColor: '#39FF14', padding: 20, borderRadius: 20, alignItems: 'center' },
  buyBtn: { flex: 1, backgroundColor: '#222', padding: 20, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900' },
  buyBtnText: { color: '#fff', fontWeight: '900' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#111', padding: 40, borderRadius: 40 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 20 },
  modalSub: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { backgroundColor: '#000', color: '#fff', padding: 20, borderRadius: 20, fontSize: 22, marginBottom: 30 },
  closeBtn: { backgroundColor: '#39FF14', padding: 20, borderRadius: 20, alignItems: 'center' },
  closeBtnText: { color: '#000', fontWeight: '900' }
});
