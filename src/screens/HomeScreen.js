
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async data => {
    await AsyncStorage.setItem('transactions', JSON.stringify(data));
  };

  const loadData = async () => {
    const json = await AsyncStorage.getItem('transactions');
    setTransactions(json != null ? JSON.parse(json) : []);
  };

  const handleAdd = () => {
    const newTransaction = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    saveData(updated);
    setTitle('');
    setAmount('');
    setModalVisible(false);
  };

  const handleDelete = id => {
    const filtered = transactions.filter(t => t.id !== id);
    setTransactions(filtered);
    saveData(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const balance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>Balance: ₹{balance.toLocaleString()}</Text>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}>
            <Animated.View
              entering={FadeInRight}
              exiting={FadeOutLeft}
              style={styles.transactionItem}>
              <Text>{item.title}</Text>
              <Text style={{ color: item.amount > 0 ? 'green' : 'red' }}>₹{item.amount}</Text>
            </Animated.View>
          </Swipeable>
        )}
      />

      {modalVisible && (
        <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={styles.modal}>
          <TextInput
            placeholder="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add Transaction</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {balance >= 10000 && (
        <LottieView
          // source={require('../../assets/confetti.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  balance: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  transactionItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteBtn: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#6200ee',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: 'white', fontSize: 24 },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  lottie: { width: 150, height: 150, position: 'absolute', top: 0, right: 0 },
});
