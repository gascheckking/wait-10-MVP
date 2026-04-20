// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
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
    } catch (e) { console.log("Error loading"); }
  };

  const saveData = async (money, newStreak, newHistory) => {
    try {
      await AsyncStorage.setItem('@total_saved', money.toString());
      await AsyncStorage.setItem('@streak', newStreak.toString());
      await AsyncStorage.setItem('@history', JSON.stringify(newHistory));
      await AsyncStorage.setItem('@hourly_wage', hourlyWage);
    } catch (e) { console.log("Error saving"); }
  };

  const calculate = () => {
    const p = parseFloat(price);
    const w = parseFloat(hourlyWage);
    if (p > 0 && w > 0) {
      const hrs = (p / w).toFixed(1);
      setResult({ hours: hrs, price: p, item: price + " kr" });
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

    newHistory = newHistory.slice(0, 5); // Behåll bara de 5 senaste
    setTotalSaved(newTotal);
    setStreak(newStreak);
    setHistory(newHistory);
    saveData(newTotal, newStreak, newHistory);
    setResult(null);
    setPrice('');
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Jag har sparat ${totalSaved} kr och har en streak på ${streak} dagar i Wait 10! 🔥 Stoppa impulsköpen du med.`,
      });
    } catch (error) { console.log(error.message); }
  };

  return (
    <ScrollView style={styles.main} contentContainerStyle={styles.container}>
      {/* STATS BAR */}
      <View style={styles.header}>
        <View>
          <Text style={styles.statLabel}>TOTALT SPARAT</Text>
          <Text style={styles.statValue}>{totalSaved} KR</Text>
        </View>
        <TouchableOpacity onPress={onShare} style={styles.shareIcon}>
          <Text style={{fontSize: 24}}>📤</Text>
        </TouchableOpacity>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.statValue}>{streak} 🔥</Text>
        </View>
      </View>

      <Text style={styles.logo}>WAIT 10</Text>

      {/* INPUT SECTION */}
      {!result && (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>VAD KOSTAR DET?</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ange pris..."
            placeholderTextColor="#444"
            value={price}
            onChangeText={setPrice}
          />
          <TouchableOpacity style={styles.btn} onPress={calculate}>
            <Text style={styles.btnText}>ANALUSERA</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESULT & TIMER SECTION */}
      {result && (
        <View style={styles.resultView}>
          <View style={styles.shareCard}>
             <Text style={styles.shareTitle}>LIVSKOSTNAD</Text>
             <Text style={styles.shareHours}>{result.hours}H</Text>
             <Text style={styles.shareSub}>av ditt liv</Text>
          </View>

          <View style={styles.timerBox}>
            <Text style={styles.timerNum}>{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</Text>
            {secondsLeft === 0 ? (
              <View style={styles.row}>
                <TouchableOpacity style={[styles.choiceBtn, styles.saveBtn]} onPress={() => handleDecision(false)}>
                  <Text style={styles.choiceText}>SKIPPA KÖP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.choiceBtn, styles.buyBtn]} onPress={() => handleDecision(true)}>
                  <Text style={[styles.choiceText, {color: '#666'}]}>KÖP</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.waiting}>VÄNTAR PÅ KLARTECKN...</Text>
            )}
          </View>
        </View>
      )}

      {/* HISTORY LIST */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>SENASTE BESLUT</Text>
        {history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyText}>{item.price} kr</Text>
            <Text style={[styles.historyStatus, {color: item.status === 'SAVED' ? '#39FF14' : '#FF3B30'}]}>
              {item.status === 'SAVED' ? `+${item.hours}h SPARAT` : 'KÖPT'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000' },
  container: { padding: 25, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  shareIcon: { backgroundColor: '#111', padding: 10, borderRadius: 15 },
  logo: { fontSize: 36, fontWeight: '900', color: '#39FF14', textAlign: 'center', marginBottom: 30, letterSpacing: -1 },
  card: { backgroundColor: '#111', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#222' },
  inputLabel: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#000', color: '#fff', fontSize: 32, fontWeight: '700', textAlign: 'center', padding: 20, borderRadius: 16, marginBottom: 20 },
  btn: { backgroundColor: '#39FF14', padding: 20, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  resultView: { width: '100%', alignItems: 'center' },
  shareCard: { backgroundColor: '#39FF14', width: '100%', padding: 40, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  shareTitle: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  shareHours: { color: '#000', fontSize: 80, fontWeight: '900', lineHeight: 80 },
  shareSub: { color: '#000', fontSize: 16, fontWeight: '600' },
  timerBox: { backgroundColor: '#111', width: '100%', padding: 25, borderRadius: 30, alignItems: 'center' },
  timerNum: { color: '#fff', fontSize: 48, fontWeight: '800' },
  waiting: { color: '#39FF14', fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 20 },
  choiceBtn: { flex: 1, padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtn: { backgroundColor: '#39FF14' },
  buyBtn: { backgroundColor: '#222' },
  choiceText: { fontWeight: '900', fontSize: 14 },
  historySection: { marginTop: 40 },
  historyTitle: { color: '#444', fontSize: 12, fontWeight: 'bold', marginBottom: 15 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#111' },
  historyText: { color: '#fff', fontWeight: '600' },
  historyStatus: { fontWeight: 'bold', fontSize: 12 }
});
