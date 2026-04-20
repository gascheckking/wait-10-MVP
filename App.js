// App.js
// Filnamn: Karma_Fast_Track_V8.js

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('196'); // Baserat på 43k i Botkyrka
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  // Snabbval för att slippa skriva
  const quickPicks = [
    { name: 'Celsius', price: 25, icon: '⚡️' },
    { name: 'Kaffe', price: 45, icon: '☕️' },
    { name: 'Snus/Cigg', price: 60, icon: '🚬' },
    { name: 'Lunch ute', price: 135, icon: '🍱' }
  ];

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const calculate = (val) => {
    const p = parseFloat(val || price);
    const w = parseFloat(hourlyWage);
    if (p > 0) {
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

  const handleDecision = (bought) => {
    if (!bought) {
      setTotalSaved(prev => prev + result.price);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    setResult(null);
    setPrice('');
    setIsActive(false);
  };

  // Enkel kamera-funktion för webben
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      Alert.alert("Kamerafel", "Kunde inte öppna kameran.");
      setCameraActive(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
            <Text style={{fontSize: 20}}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>KARMA</Text>
          <TouchableOpacity onPress={startCamera} style={styles.iconBtn}>
            <Text style={{fontSize: 20}}>📸</Text>
          </TouchableOpacity>
        </View>

        {!result ? (
          <View style={{width: '100%'}}>
            {/* QUICK PICKS - För de lata stunderna */}
            <Text style={styles.sectionLabel}>SNABBVAL</Text>
            <View style={styles.quickGrid}>
              {quickPicks.map((item) => (
                <TouchableOpacity 
                  key={item.name} 
                  style={styles.quickCard} 
                  onPress={() => calculate(item.price)}
                >
                  <Text style={{fontSize: 24}}>{item.icon}</Text>
                  <Text style={styles.quickName}>{item.name}</Text>
                  <Text style={styles.quickPrice}>{item.price} kr</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>ELLER SKRIV PRIS</Text>
              <TextInput
                style={styles.mainInput}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor="#222"
              />
              <TouchableOpacity style={styles.mainBtn} onPress={() => calculate()}>
                <Text style={styles.mainBtnText}>ANALYSERA LIVSKOSTNAD</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultSection}>
            <Text style={styles.resLabel}>DET KOSTAR DIG</Text>
            <Text style={styles.resValue}>
              {result.mins < 60 ? `${result.mins} MIN` : `${result.hours} H`}
            </Text>
            <Text style={styles.resSubText}>AV DITT ARBETSLIV</Text>

            <View style={styles.timerArea}>
              <Text style={styles.timerNum}>{secondsLeft}s</Text>
              
              {/* DIN IDÉ: Avböj direkt under timern */}
              <TouchableOpacity 
                style={styles.earlySaveBtn} 
                onPress={() => handleDecision(false)}
              >
                <Text style={styles.earlySaveText}>AVBÖJ KÖP & LÄGG PÅ SPAR</Text>
              </TouchableOpacity>

              {secondsLeft === 0 && (
                <TouchableOpacity style={styles.buyBtn} onPress={() => handleDecision(true)}>
                  <Text style={styles.buyText}>JAG KÖPTE ÄNDÅ (NOLLSTÄLL STREAK)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* KAMERA MODAL (SIMULERAD) */}
      <Modal visible={cameraActive} animationType="fade">
        <View style={styles.cameraOverlay}>
          <video ref={videoRef} autoPlay playsInline style={styles.videoPreview} />
          <View style={styles.cameraUI}>
            <Text style={styles.cameraHint}>Rikta mot prislappen</Text>
            <TouchableOpacity style={styles.captureBtn} onPress={() => {
              setPrice("24"); // Här skulle AI:n ha läst av bilden
              setCameraActive(false);
              calculate("24");
            }}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCameraActive(false)}>
              <Text style={{color: '#fff', marginTop: 20}}>AVBRYT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  innerContainer: { width: '100%', maxWidth: 400, padding: 25, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  iconBtn: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  logo: { color: '#39FF14', fontWeight: '900', fontSize: 20, letterSpacing: 4 },
  
  sectionLabel: { color: '#333', fontSize: 10, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  quickCard: { flex: 1, minWidth: '45%', backgroundColor: '#080808', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#111' },
  quickName: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  quickPrice: { color: '#39FF14', fontSize: 10, marginTop: 2 },

  inputSection: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#111', paddingTop: 30 },
  label: { color: '#39FF14', fontSize: 10, fontWeight: 'bold' },
  mainInput: { color: '#fff', fontSize: 60, fontWeight: '900', marginVertical: 10 },
  mainBtn: { backgroundColor: '#39FF14', width: '100%', padding: 20, borderRadius: 25, alignItems: 'center' },
  mainBtnText: { fontWeight: '900', fontSize: 14 },

  resultSection: { alignItems: 'center', marginTop: 40 },
  resLabel: { color: '#444', fontWeight: 'bold', fontSize: 12 },
  resValue: { color: '#fff', fontSize: 70, fontWeight: '900' },
  resSubText: { color: '#39FF14', fontWeight: 'bold', fontSize: 10 },
  
  timerArea: { marginTop: 40, width: '100%', alignItems: 'center' },
  timerNum: { color: '#fff', fontSize: 50, fontWeight: 'bold', marginBottom: 20 },
  earlySaveBtn: { backgroundColor: '#39FF14', width: '100%', padding: 22, borderRadius: 25, alignItems: 'center' },
  earlySaveText: { fontWeight: '900', fontSize: 16, color: '#000' },
  buyBtn: { marginTop: 20, padding: 10 },
  buyText: { color: '#222', fontSize: 11, fontWeight: 'bold' },

  cameraOverlay: { flex: 1, backgroundColor: '#000' },
  videoPreview: { flex: 1, width: '100%' },
  cameraUI: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  cameraHint: { color: '#39FF14', marginBottom: 20, fontWeight: 'bold' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' }
});
