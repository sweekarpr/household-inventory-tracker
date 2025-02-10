import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, TextInput, Button, Snackbar, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddItemScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  const categories = ['Uncategorized', 'Food', 'Cleaning Supplies', 'Personal Care', 'Other'];

  const handleAddItem = async () => {
    if (!name || !quantity) {
      setSnackbarVisible(true);
      return;
    }

    const newItem = { id: Date.now().toString(), name, quantity, category };

    try {
      const storedItems = await AsyncStorage.getItem('inventory');
      const items = storedItems ? JSON.parse(storedItems) : [];
      const updatedItems = [...items, newItem];
      await AsyncStorage.setItem('inventory', JSON.stringify(updatedItems));
      router.back(); // Go back to Home Screen
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Item" />
      </Appbar.Header>

      <TextInput
        label="Item Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
        keyboardType="numeric"
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)}>
            Category: {category}
          </Button>
        }
      >
        {categories.map((cat) => (
          <Menu.Item
            key={cat}
            onPress={() => {
              setCategory(cat);
              setMenuVisible(false);
            }}
            title={cat}
          />
        ))}
      </Menu>

      <Button mode="contained" style={styles.addButton} onPress={handleAddItem}>
        Add Item
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        Please fill in all fields.
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { marginBottom: 10 },
  addButton: { marginTop: 20 },
});
