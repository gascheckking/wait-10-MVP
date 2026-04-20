// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions, Animated, Share, Alert } from 'react-native';
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
  const [selectedDemo, setSelectedDemo] = useState(null);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    loadData();
    animateEntrance();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true })
      ]).start();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();
  };

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
      
      // Visa konfetti-känsla (alert för MVP)
      Alert.alert(
        "🎉 BRA BESLUT!",
        `Du sparade ${result.price} kr och din streak är nu ${newStreak} dagar!`,
        [{ text: "🔥 Fortsätt så!" }]
      );
    } else {
      newStreak = 0;
      Alert.alert(
        "😅 Ingen skam",
        "Nästa gång kanske du väntar lite längre?",
        [{ text: "👍" }]
      );
    }

    setTotalSaved(newTotal);
    setStreak(newStreak);
    await AsyncStorage.setItem('@total_saved', newTotal.toString());
    await AsyncStorage.setItem('@streak', newStreak.toString());
    setResult(null);
    setPrice('');
    setSelectedDemo(null);
  };

  const handleShare = async () => {
    if (!result) return;
    
    const shareMessage = `💀 ${result.hours} TIMMAR AV MITT LIV!\n\nEn ${selectedDemo || 'sak'} för ${result.price} kr kostar mig ${result.hours} timmars arbete. Värt det?\n\nLadda ner Wait 10 - kolla vad dina köp kostar!`;
    
    try {
      await Share.share({
        message: shareMessage,
        title: 'Wait 10 - Impulskontroll'
      });
    } catch (error) {
      console.log(error);
    }
  };

  const demoItems = [
    { name: "🎮 PS5", price: 6500, hours: (6500 / parseFloat(hourlyWage)).toFixed(1) },
    { name: "☕️ Kaffemaskin", price: 12000, hours: (12000 / parseFloat(hourlyWage)).toFixed(1) },
    { name: "👟 Nike Skor", price: 1500, hours: (1500 / parseFloat(hourlyWage)).toFixed(1) },
    { name: "📱 iPhone 16", price: 13000, hours: (13000 / parseFloat(hourlyWage)).toFixed(1) }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0 && secs === 0) return "KLAR!";
    if (mins === 0) return `${secs} sek`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStreakEmoji = () => {
    if (streak >= 30) return "👑";
    if (streak >= 7) return "🔥🔥";
    if (streak >= 3) return "🔥";
    if (streak > 0) return "🌱";
    return "💀";
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* HEADER - Minimalistisk */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconButton}>
            <Text style={styles.iconText}>⚡️</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.logoText}>WAIT 10</Text>
            <Text style={styles.tagline}>impulskontroll</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
            <Text style={styles.streakNumber}>{streak}</Text>
          </View>
        </View>

        {/* STATS - Mer framträdande */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{(totalSaved / parseFloat(hourlyWage)).toFixed(0)}</Text>
            <Text style={styles.statLabel}>timmar sparade</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totalSaved}</Text>
            <Text style={styles.statLabel}>kronor sparade</Text>
          </View>
        </Animated.View>

        {/* MAIN CALCULATION AREA */}
        {!result ? (
          <Animated.View style={[styles.calcArea, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.questionText}>Vad vill du köpa?</Text>
            
            <View style={styles.demoGrid}>
              {demoItems.map((item, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.demoChip}
                  onPress={() => {
                    setPrice(item.price.toString());
                    setSelectedDemo(item.name);
                  }}
                >
                  <Text style={styles.demoChipText}>{item.name}</Text>
                  <Text style={styles.demoChipPrice}>{item.price} kr</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#333"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setSelectedDemo(null);
                }}
                maxLength={7}
              />
              <Text style={styles.currencySymbol}>kr</Text>
            </View>

            <TouchableOpacity 
              style={[styles.calcButton, !price && styles.calcButtonDisabled]} 
              onPress={calculate}
              disabled={!price}
            >
              <Text style={styles.calcButtonText}>
                {price ? "💀 VISA TID 💀" : "skriv ett pris"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          /* RESULT SCREEN - Chockerande design */
          <Animated.View style={[styles.resultArea, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultItem}>{selectedDemo || "Din grej"}</Text>
              <Text style={styles.resultPrice}>{result.price} kr</Text>
            </View>

            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>KOSTAR DIG</Text>
              <Text style={styles.timeValue}>{result.hours}</Text>
              <Text style={styles.timeUnit}>TIMMAR AV DITT LIV</Text>
              <Text style={styles.timeComparison}>
                {parseFloat(result.hours) >= 40 ? "💀 En hel arbetsvecka 💀" : 
                 parseFloat(result.hours) >= 8 ? "😰 En hel arbetsdag" :
                 "🤔 Kanske inte så farligt?"}
              </Text>
            </View>

            {/* Timer */}
            <View style={styles.timerSection}>
              <Text style={styles.timerLabel}>
                {secondsLeft === 0 ? "BESLUTSTID!" : "VÄNTA"}
              </Text>
              <Text style={styles.timerValue}>{formatTime(secondsLeft)}</Text>
              
              {secondsLeft === 0 && (
                <View style={styles.decisionButtons}>
                  <TouchableOpacity style={styles.skipButton} onPress={() => handleDecision(false)}>
                    <Text style={styles.skipButtonText}>✅ SKIPPA</Text>
                    <Text style={styles.skipSubtext}>spara {result.price} kr</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyButton} onPress={() => handleDecision(true)}>
                    <Text style={styles.buyButtonText}>😅 KÖP</Text>
                    <Text style={styles.buySubtext}>0 kr sparat</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {secondsLeft > 0 && (
                <Text style={styles.waitHint}>andas... tänk efter...</Text>
              )}
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>📤 DELA CHOCKEN</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* SETTINGS MODAL - Förbättrad */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚡️ INSTÄLLNINGAR</Text>
            <Text style={styles.modalSubtitle}>Din timlön efter skatt</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
              placeholder="150"
              placeholderTextColor="#444"
            />
            <Text style={styles.modalHint}>Genomsnitt: 150 kr/h för ungdomar, 200+ för vuxna</Text>
            <TouchableOpacity style={styles.modalSaveButton} onPress={() => {
               AsyncStorage.setItem('@hourly_wage', hourlyWage);
               setShowSettings(false);
            }}>
              <Text style={styles.modalSaveText}>SPARA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCloseText}>Stäng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000000' },
  container: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  
  // Header
  header: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, paddingHorizontal: 5 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  iconText: { fontSize: 20 },
  logoText: { color: '#39FF14', fontSize: 20, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  tagline: { color: '#333', fontSize: 10, textAlign: 'center', marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: '#222' },
  streakEmoji: { fontSize: 14 },
  streakNumber: { color: '#39FF14', fontWeight: '900', fontSize: 16 },
  
  // Stats
  statsContainer: { flexDirection: 'row', backgroundColor: '#0a0a0a', borderRadius: 30, padding: 20, marginBottom: 40, borderWidth: 1, borderColor: '#1a1a1a', width: '100%' },
  statBlock: { flex: 1, alignItems: 'center' },
  statValue: { color: '#39FF14', fontSize: 32, fontWeight: '900' },
  statLabel: { color: '#555', fontSize: 11, marginTop: 5 },
  statDivider: { width: 1, backgroundColor: '#1a1a1a', marginHorizontal: 15 },
  
  // Calculator
  calcArea: { width: '100%', alignItems: 'center' },
  questionText: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 25, textAlign: 'center' },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 30 },
  demoChip: { backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  demoChipText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  demoChipPrice: { color: '#39FF14', fontSize: 12, marginTop: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#39FF14', paddingBottom: 10 },
  priceInput: { color: '#fff', fontSize: 80, fontWeight: '900', textAlign: 'center', width: 200, padding: 0 },
  currencySymbol: { color: '#39FF14', fontSize: 40, fontWeight: '900', marginLeft: 5 },
  calcButton: { backgroundColor: '#39FF14', width: '100%', padding: 22, borderRadius: 60, alignItems: 'center', shadowColor: '#39FF14', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 },
  calcButtonDisabled: { backgroundColor: '#1a1a1a', shadowOpacity: 0 },
  calcButtonText: { color: '#000', fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  
  // Result screen
  resultArea: { width: '100%', alignItems: 'center' },
  resultHeader: { alignItems: 'center', marginBottom: 30 },
  resultItem: { color: '#fff', fontSize: 18, opacity: 0.7 },
  resultPrice: { color: '#39FF14', fontSize: 28, fontWeight: '900', marginTop: 5 },
  timeDisplay: { alignItems: 'center', marginBottom: 40, padding: 30, backgroundColor: '#0a0a0a', borderRadius: 40, width: '100%', borderWidth: 1, borderColor: '#1a1a1a' },
  timeLabel: { color: '#555', fontSize: 12, letterSpacing: 2 },
  timeValue: { color: '#ff3333', fontSize: 80, fontWeight: '900', marginVertical: 10 },
  timeUnit: { color: '#fff', fontSize: 16, fontWeight: '600' },
  timeComparison: { color: '#555', fontSize: 14, marginTop: 15 },
  timerSection: { alignItems: 'center', marginBottom: 30, width: '100%' },
  timerLabel: { color: '#39FF14', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  timerValue: { color: '#fff', fontSize: 48, fontWeight: '800', fontFamily: 'monospace' },
  waitHint: { color: '#444', fontSize: 12, marginTop: 15 },
  decisionButtons: { flexDirection: 'row', gap: 15, width: '100%', marginTop: 20 },
  skipButton: { flex: 1, backgroundColor: '#39FF14', padding: 20, borderRadius: 30, alignItems: 'center' },
  skipButtonText: { color: '#000', fontWeight: '900', fontSize: 16 },
  skipSubtext: { color: '#000', fontSize: 12, marginTop: 4, opacity: 0.7 },
  buyButton: { flex: 1, backgroundColor: '#1a1a1a', padding: 20, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  buyButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buySubtext: { color: '#555', fontSize: 12, marginTop: 4 },
  shareButton: { marginTop: 20, padding: 15, borderRadius: 30, borderWidth: 1, borderColor: '#333', width: '100%', alignItems: 'center' },
  shareButtonText: { color: '#fff', fontSize: 14 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0a0a0a', borderRadius: 40, padding: 30, borderWidth: 1, borderColor: '#1a1a1a' },
  modalTitle: { color: '#39FF14', fontSize: 24, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  modalSubtitle: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 25 },
  modalInput: { backgroundColor: '#000', color: '#fff', padding: 18, borderRadius: 20, fontSize: 24, textAlign: 'center', marginBottom: 15, fontWeight: '700' },
  modalHint: { color: '#444', fontSize: 12, textAlign: 'center', marginBottom: 25 },
  modalSaveButton: { backgroundColor: '#39FF14', padding: 18, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  modalSaveText: { color: '#000', fontWeight: '900', fontSize: 18 },
  modalCloseButton: { padding: 15, alignItems: 'center' },
  modalCloseText: { color: '#666', fontSize: 14 }
});