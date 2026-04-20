// App.js
// Filnamn: Karma_Graveyard_V10.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage] = useState('196'); // Botkyrka 43k-baserad
  const [lifeSavedMins, setLifeSavedMins] = useState(0);
  const [lifeLostMins, setLifeLostMins] = useState(0);
  const [graveyard, setGraveyard] = useState([]); // Här hamnar "döda" minuter
  const [result, setResult] = useState(null);

  const handleDecision = (bought) => {
    const mins = result.mins;
    if (!bought) {
      setLifeSavedMins(prev => prev + mins);
    } else {
      setLifeLostMins(prev => prev + mins);
      setGraveyard([{ id: Date.now().toString(), item: price, mins }, ...graveyard]);
    }
    setResult(null);
    setPrice('');
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>KARMA</Text>

        {/* VÅGEN - VISUELL BALANS */}
        <View style={styles.balanceContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>FRIHET (SPARAT)</Text>
            <Text style={styles.statValueGreen}>{Math.round(lifeSavedMins / 60)}h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SLAVERI (FÖRLORAT)</Text>
            <Text style={styles.statValueRed}>{Math.round(lifeLostMins / 60)}h</Text>
          </View>
        </View>

        {!result ? (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.mainInput}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              placeholder="0 kr"
              placeholderTextColor="#222"
            />
            <TouchableOpacity style={styles.actionBtn} onPress={() => {
                const p = parseFloat(price);
                setResult({ mins: Math.round((p / hourlyWage) * 60), price: p });
            }}>
              <Text style={styles.btnText}>KOLLA LIVSKOSTNAD</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.decisionArea}>
            <Text style={styles.resText}>DETTA ÄR {result.mins} MINUTER AV DITT LIV.</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
              <Text style={styles.saveBtnText}>GE MIG MIN TID TILLBAKA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loseBtn} onPress={() => handleDecision(true)}>
              <Text style={styles.loseBtnText}>BEGRAV TIDEN (KÖP)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* GRAVEYARD LIST */}
        {graveyard.length > 0 && (
          <View style={styles.graveSection}>
            <Text style={styles.graveTitle}>GRAVEYARD (DÖD TID)</Text>
            {graveyard.map(g => (
              <Text key={g.id} style={styles.graveItem}>💀 {g.item} kr — {g.mins} minuter bortkastade</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000' },
  container: { padding: 25, paddingTop: 60, alignItems: 'center' },
  logo: { color: '#39FF14', fontWeight: '900', fontSize: 24, letterSpacing: 5, marginBottom: 40 },
  balanceContainer: { flexDirection: 'row', width: '100%', gap: 15, marginBottom: 40 },
  statBox: { flex: 1, backgroundColor: '#080808', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#111' },
  statLabel: { color: '#444', fontSize: 8, fontWeight: 'bold', marginBottom: 5 },
  statValueGreen: { color: '#39FF14', fontSize: 30, fontWeight: '900' },
  statValueRed: { color: '#FF3131', fontSize: 30, fontWeight: '900' },
  inputArea: { width: '100%', alignItems: 'center' },
  mainInput: { color: '#fff', fontSize: 80, fontWeight: '900' },
  actionBtn: { backgroundColor: '#39FF14', width: '100%', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  btnText: { fontWeight: '900', fontSize: 16 },
  decisionArea: { width: '100%', alignItems: 'center' },
  resText: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  saveBtn: { backgroundColor: '#39FF14', width: '100%', padding: 25, borderRadius: 25, marginBottom: 15 },
  saveBtnText: { textAlign: 'center', fontWeight: '900', fontSize: 18 },
  loseBtn: { padding: 10 },
  loseBtnText: { color: '#444', fontWeight: 'bold', textDecorationLine: 'underline' },
  graveSection: { width: '100%', marginTop: 50, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 },
  graveTitle: { color: '#FF3131', fontSize: 12, fontWeight: 'bold', marginBottom: 15 },
  graveItem: { color: '#444', fontSize: 12, marginBottom: 8, fontStyle: 'italic' }
});
