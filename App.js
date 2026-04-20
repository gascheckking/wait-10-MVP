// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('150'); // Din timlön efter skatt
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Timer-motor
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const calculate = () => {
    const p = parseFloat(price);
    const w = parseFloat(hourlyWage);
    if (p > 0 && w > 0) {
      const hours = (p / w).toFixed(1);
      setResult(hours);
      setSecondsLeft(600); // Startar 10 minuters nedräkning
      setIsActive(true);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>WAIT 10</Text>
      <Text style={styles.tagline}>Gör tid till din valuta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Vad kostar prylen? (kr)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="t.ex. 6500"
          placeholderTextColor="#444"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Din timlön efter skatt (kr)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="t.ex. 150"
          placeholderTextColor="#444"
          value={hourlyWage}
          onChangeText={setHourlyWage}
        />

        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>RÄKNA UT LIVSKOSTNAD</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.hours}>{result} TIMMAR</Text>
          <Text style={styles.subResult}>...av ditt liv för det här köpet.</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>IMPULSKONTROLL AKTIVERAD</Text>
            <Text style={styles.timerDisplay}>{formatTime(secondsLeft)}</Text>
            <Text style={styles.timerHint}>Vänta tills tiden gått ut innan du betalar.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    padding: 25,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#39FF14',
    letterSpacing: 2,
  },
  tagline: {
    color: '#888',
    fontSize: 14,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  label: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#39FF14',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },
  resultCard: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  hours: {
    fontSize: 50,
    fontWeight: '900',
    color: '#FFF',
  },
  subResult: {
    color: '#888',
    marginBottom: 25,
  },
  timerContainer: {
    width: '100%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#39FF14',
  },
  timerLabel: {
    color: '#39FF14',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timerDisplay: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
    marginVertical: 5,
  },
  timerHint: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
  },
});
