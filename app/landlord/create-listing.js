import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router'; 
import { Colors } from '../../constants/Colors';
import PropertyImageGrid from '../../components/PropertyImageGrid';
import { boardingHouses } from '../../data/mockData'; 
import { GlobalListingContext } from './_layout'; 
import { Ionicons } from '@expo/vector-icons';

export default function CreateListing() {
  const params = useLocalSearchParams(); 
  const navigation = useNavigation();
  const { listings, updateListing } = useContext(GlobalListingContext); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [heading, setHeading] = useState('Create Property Listing');
  const [submitText, setSubmitText] = useState('Create Listing');

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [description, setDescription] = useState('');
  const [virtualTour, setVirtualTour] = useState('');
  const [houseType, setHouseType] = useState('Single Room');
  const [distance, setDistance] = useState('');

  
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);

  
  const [available, setAvailable] = useState(true);
  const [availableFrom, setAvailableFrom] = useState('');

  const [amenities, setAmenities] = useState({
    wifi: false,
    airConditioning: false,
    parking: false,
    kitchen: false,
    laundry: false,
    security: false,
    furnished: false,
    waterIncluded: false,
    electricityIncluded: false,
    petsAllowed: false,
  });

  const [photos, setPhotos] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);

  
  const houseTypes = [
    'Single Room',
    'Shared Room',
    'Studio Unit',
    'Apartment',
    'Dormitory',
    'Boarding House'
  ];


  const resetForm = () => {
    console.log('Resetting form...');
    setTitle('');
    setAddress('');
    setRent('');
    setDescription('');
    setVirtualTour('');
    setHouseType('Single Room');
    setDistance('');
    setRules([]);
    setAvailable(true);
    setAvailableFrom('');
    setAmenities({
      wifi: false,
      airConditioning: false,
      parking: false,
      kitchen: false,
      laundry: false,
      security: false,
      furnished: false,
      waterIncluded: false,
      electricityIncluded: false,
      petsAllowed: false,
    });
    setPhotos([]);
    setFloorPlans([]);
    setIsEditing(false);
    setHeading('Create Property Listing');
    setSubmitText('Create Listing');
    
    
    router.setParams({});
  };

  
  useEffect(() => {
    console.log('Params changed:', params.id);
    
    if (params.id && params.id !== 'undefined') {
      const listingId = params.id;
      const existingListing = listings.find(b => String(b.id) === listingId); 

      if (existingListing) {
        console.log('Loading editing data for:', existingListing.name);
        setTitle(existingListing.name);
        setAddress(existingListing.location);
        setRent(String(existingListing.price)); 
        setDescription(existingListing.description || existingListing.details || '');
        setHouseType(existingListing.type || 'Single Room');
        setDistance(existingListing.distance || '');
        setRules(existingListing.rules || []);
        setAvailable(existingListing.available !== false);
        setAvailableFrom(existingListing.availableFrom || '');
        
        
        const amenitiesObj = {
          wifi: false,
          airConditioning: false,
          parking: false,
          kitchen: false,
          laundry: false,
          security: false,
          furnished: false,
          waterIncluded: false,
          electricityIncluded: false,
          petsAllowed: false,
        };
        
        if (existingListing.amenities && Array.isArray(existingListing.amenities)) {
          existingListing.amenities.forEach(amenity => {
            const key = amenity.toLowerCase().replace(/\s+/g, '');
            if (amenitiesObj.hasOwnProperty(key)) {
              amenitiesObj[key] = true;
            }
          });
        }
        
        setAmenities(amenitiesObj);
        setPhotos(existingListing.images || []);
        
        setIsEditing(true);
        setHeading('Edit Property Listing');
        setSubmitText('Update Listing');
      }
    } else {
     
      console.log('No ID param, resetting form');
      resetForm();
    }
  }, [params.id, listings]);

 
  useEffect(() => {
    
    if (!params.id) {
      resetForm();
    }
  }, []);

  const pickImage = async (setter, multiple = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setter((prev) => [...prev, uri]);
      }
    } catch (err) {
      console.warn('Image pick error', err);
    }
  };

  const removeAt = (arrSetter) => (index) => {
    arrSetter((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (key) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  
  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const openRulesModal = () => {
    setShowRulesModal(true);
  };

  const closeRulesModal = () => {
    setShowRulesModal(false);
    setNewRule('');
  };

  
  const getAmenitiesArray = () => {
    const amenitiesMap = {
      wifi: 'WiFi',
      airConditioning: 'Air Conditioning',
      parking: 'Parking',
      kitchen: 'Kitchen',
      laundry: 'Laundry',
      security: 'Security',
      furnished: 'Furnished',
      waterIncluded: 'Water Included',
      electricityIncluded: 'Electricity Included',
      petsAllowed: 'Pets Allowed',
    };

    return Object.entries(amenities)
      .filter(([key, value]) => value)
      .map(([key]) => amenitiesMap[key] || key);
  };

  const validateAndSubmit = () => {
    if (!title.trim()) return Alert.alert('Validation', 'Title is required');
    if (!address.trim()) return Alert.alert('Validation', 'Address is required');
    if (!rent.trim() || isNaN(Number(rent))) return Alert.alert('Validation', 'Rent must be a number');
    if (!description.trim()) return Alert.alert('Validation', 'Description is required');

    const amenitiesArray = getAmenitiesArray();

    const payload = {
      images: photos.length > 0 ? photos : ['https://via.placeholder.com/150/0000FF/808080?text=New+Listing'],
      description: description,
      location: address,
      price: Number(rent),
      name: title,
      type: houseType,
      distance: distance,
      amenities: amenitiesArray,
      rules: rules,
      available: available,
      availableFrom: availableFrom,
      virtualTour,
      floorPlans,
      rating: isEditing ? undefined : 4.5, 
      reviews: isEditing ? undefined : 0, 
      landlord: {
        name: 'Your Name', 
        phone: '09123456789', 
        verified: true,
        email: 'landlord@email.com'
      }
    };
    
    if (isEditing && params.id) {
      updateListing(params.id, payload);
      console.log(`Updating listing ${params.id}`);

      Alert.alert('Success', 'Listing updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            resetForm();
            router.replace('/landlord');
          }
        },
      ]);
    } else {
      updateListing(null, payload);
      console.log('Listing created');

      Alert.alert('Success', 'Listing created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            resetForm();
            router.replace('/landlord');
          }
        },
      ]);
    }
  };

  const handleCancel = () => {
    resetForm();
    router.back();
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>{heading}</Text>

        {isEditing && (
          <View style={styles.editIndicator}>
            <Text style={styles.editIndicatorText}>Editing</Text>
          </View>
        )}

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="e.g., Cozy 2BR near downtown" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} placeholder="Full address" value={address} onChangeText={setAddress} />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.label}>Monthly Rent (PHP)</Text>
            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={rent} onChangeText={setRent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Distance</Text>
            <TextInput style={styles.input} placeholder="e.g., 1.2 km from XU" value={distance} onChangeText={setDistance} />
          </View>
        </View>

        <Text style={styles.label}>House Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <View style={styles.typeContainer}>
            {houseTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  houseType === type && styles.typeButtonActive
                ]}
                onPress={() => setHouseType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  houseType === type && styles.typeButtonTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Describe the property, layout, nearby points of interest..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Virtual Tour Link (optional)</Text>
        <TextInput style={styles.input} placeholder="https://" value={virtualTour} onChangeText={setVirtualTour} autoCapitalize="none" />

       
        <Text style={styles.section}>Availability</Text>
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityRow}>
            <Text style={styles.availabilityText}>Currently Available</Text>
            <Switch value={available} onValueChange={setAvailable} />
          </View>
          {available && (
            <View style={styles.availabilityInput}>
              <Text style={styles.label}>Available From (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Immediately, March 2024"
                value={availableFrom}
                onChangeText={setAvailableFrom}
              />
            </View>
          )}
        </View>

        <Text style={styles.section}>Amenities</Text>
        <View style={styles.amenitiesBox}>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Wi-Fi</Text>
            <Switch value={amenities.wifi} onValueChange={() => toggleAmenity('wifi')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Air Conditioning</Text>
            <Switch value={amenities.airConditioning} onValueChange={() => toggleAmenity('airConditioning')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Parking</Text>
            <Switch value={amenities.parking} onValueChange={() => toggleAmenity('parking')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Kitchen</Text>
            <Switch value={amenities.kitchen} onValueChange={() => toggleAmenity('kitchen')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Laundry</Text>
            <Switch value={amenities.laundry} onValueChange={() => toggleAmenity('laundry')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>24/7 Security</Text>
            <Switch value={amenities.security} onValueChange={() => toggleAmenity('security')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Furnished</Text>
            <Switch value={amenities.furnished} onValueChange={() => toggleAmenity('furnished')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Water Included</Text>
            <Switch value={amenities.waterIncluded} onValueChange={() => toggleAmenity('waterIncluded')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Electricity Included</Text>
            <Switch value={amenities.electricityIncluded} onValueChange={() => toggleAmenity('electricityIncluded')} />
          </View>
          <View style={styles.amenitiesRow}>
            <Text style={styles.amenityText}>Pets Allowed</Text>
            <Switch value={amenities.petsAllowed} onValueChange={() => toggleAmenity('petsAllowed')} />
          </View>
        </View>

        
        <View style={styles.rulesSection}>
          <View style={styles.rulesHeader}>
            <Text style={styles.section}>House Rules</Text>
            <TouchableOpacity style={styles.addRuleButton} onPress={openRulesModal}>
              <Ionicons name="add-circle" size={20} color="#667eea" />
              <Text style={styles.addRuleText}>Add Rules</Text>
            </TouchableOpacity>
          </View>
          
          {rules.length > 0 ? (
            <View style={styles.rulesList}>
              {rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Ionicons name="information-circle" size={16} color="#667eea" />
                  <Text style={styles.ruleText}>{rule}</Text>
                  <TouchableOpacity onPress={() => removeRule(index)} style={styles.removeRuleButton}>
                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noRulesText}>No house rules added yet.</Text>
          )}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Photos</Text>
        <PropertyImageGrid
          images={photos}
          onAdd={() => pickImage(setPhotos)}
          onRemove={removeAt(setPhotos)}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Floor Plans (images)</Text>
        <PropertyImageGrid
          images={floorPlans}
          onAdd={() => pickImage(setFloorPlans)}
          onRemove={removeAt(setFloorPlans)}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={validateAndSubmit}>
          <Text style={styles.submitText}>{submitText}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>
            {isEditing ? 'Cancel Edit' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>

      
      <Modal
        visible={showRulesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRulesModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add House Rule</Text>
            
            <TextInput
              style={styles.ruleInput}
              placeholder="Enter a house rule (e.g., No smoking inside rooms)"
              value={newRule}
              onChangeText={setNewRule}
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={closeRulesModal}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addModalButton]}
                onPress={addRule}
                disabled={!newRule.trim()}
              >
                <Text style={styles.addModalButtonText}>Add Rule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f6f7fb',
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.primary,
  },
  editIndicator: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  editIndicatorText: {
    color: '#92400e',
    fontWeight: '600',
    fontSize: 14,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fbfcfe',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  section: {
    marginTop: 12,
    fontWeight: '700',
    color: '#333',
    fontSize: 16,
  },
  availabilityContainer: {
    backgroundColor: '#fbfbfc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    color: '#444',
    fontWeight: '600',
  },
  availabilityInput: {
    marginTop: 8,
  },
  amenitiesBox: {
    backgroundColor: '#fbfbfc',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  amenitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  amenityText: { color: '#444' },
  rulesSection: {
    marginTop: 12,
  },
  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addRuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  addRuleText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  rulesList: {
    backgroundColor: '#fbfbfc',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  ruleText: {
    flex: 1,
    color: '#444',
    fontSize: 14,
  },
  removeRuleButton: {
    padding: 4,
  },
  noRulesText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#fbfbfc',
    borderRadius: 10,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
    marginBottom: 40,
  },
  cancelText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ruleInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cancelModalButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  addModalButton: {
    backgroundColor: '#667eea',
  },
  addModalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});