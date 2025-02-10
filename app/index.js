import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList } from 'react-native';
import { Appbar, Button, Card, Text, IconButton, TextInput, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const router = useRouter();

  const categories = ['Food', 'Cleaning Supplies', 'Personal Care', 'Other', 'Uncategorized'];

  // Load items whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const loadItems = async () => {
        try {
          const storedItems = await AsyncStorage.getItem('inventory');
          if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            setItems(parsedItems);
            applyFilters(parsedItems);
          }
        } catch (error) {
          console.error('Error loading items:', error);
        }
      };
      loadItems();
    }, [])
  );

  const applyFilters = (data) => {
    let filteredData = data;

    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    if (searchQuery.trim()) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filteredData);
  };

  const handleDelete = async (id) => {
    try {
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
      setFilteredItems(updatedItems);
      await AsyncStorage.setItem('inventory', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header>
        <Appbar.Content title="Household Inventory" />
      </Appbar.Header>

      {/* Category Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <Chip
            key={category}
            style={styles.chip}
            icon={selectedCategories.includes(category) ? 'check' : 'filter'}
            selected={selectedCategories.includes(category)}
            onPress={() =>
              setSelectedCategories((prev) =>
                prev.includes(category)
                  ? prev.filter((c) => c !== category)
                  : [...prev, category]
              )
            }
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <TextInput
        label="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      {/* Item List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.name}
              subtitle={`Quantity: ${item.quantity} | Category: ${item.category}`}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => handleDelete(item.id)}
                />
              )}
            />
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No items found.</Text>}
      />

      {/* Add Item Button */}
      <Button
        mode="contained"
        style={styles.addButton}
        onPress={() => router.push('/add-item')}
      >
        Add Item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  chip: {
    height: 40, // Set a fixed height for consistency
    justifyContent: 'center', // Center the content
    marginHorizontal: 5, // Adjust spacing between chips
    borderRadius: 20, // Ensure chips have rounded corners
    backgroundColor: '#e0e0e0', // Optional: set a background color
  },
  searchBar: { marginBottom: 10 },
  card: { marginBottom: 10 },
  addButton: { marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
});
