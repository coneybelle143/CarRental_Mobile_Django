// app/landlord/payment-methods.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { Stack, router,} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const PAYMENT_METHODS_STORAGE_KEY = '@landlord_payment_methods';

export default function PaymentMethodsScreen() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);

  const loadPaymentMethods = async () => {
    try {
      const methodsJson = await AsyncStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
      if (methodsJson) {
        setPaymentMethods(JSON.parse(methodsJson));
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      Alert.alert('Error', 'Could not load payment methods.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPaymentMethods();
    }, [])
  );

  // Handle System Back Action
  useFocusEffect(
    useCallback(() => {
      
      const handleBackPress = () => {
        // This function is executed when the system "Back" action occurs.
        router.replace('/landlord/menu');
        
        return true; 
      };
      let backHandlerSubscription; // variable to hold the listener object

      if (Platform.OS === 'android') {
        // listener and capture the returned subscription object
        backHandlerSubscription = BackHandler.addEventListener(
          'hardwareBackPress', 
          handleBackPress
        );
      }
      //Removes the listener when the screen is no longer focused.  
      return () => {
        if (Platform.OS === 'android' && backHandlerSubscription) {
          backHandlerSubscription.remove();
        }
      };
    }, []) 
  );

  const handleAddPaymentMethod = () => {
  Alert.alert(
    'Add Payment Method',
    'Choose payment method type:',
    [
      {
        text: 'Credit/Debit Card',
        onPress: () => router.push({ pathname: '/landlord/add-payment-form', params: { type: 'credit_card' } })
      },
      {
        text: 'Bank Account',
        onPress: () => router.push({ pathname: '/landlord/add-payment-form', params: { type: 'bank_account' } })
      },
      {
        text: 'GCash',
        onPress: () => router.push({ pathname: '/landlord/add-payment-form', params: { type: 'gcash' } })
      },
      {
        text: 'PayMaya',
        onPress: () => router.push({ pathname: '/landlord/add-payment-form', params: { type: 'paymaya' } })
      },
      {
        text: 'PayPal',
        onPress: () => router.push({ pathname: '/landlord/add-payment-form', params: { type: 'paypal' } })
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]
  );
};

  const handleSetDefaultPayment = async (paymentId) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === paymentId
    }));
    try {
      await AsyncStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(updatedMethods));
      setPaymentMethods(updatedMethods);
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      Alert.alert('Error', 'Could not update default payment method.');
    }
  };

  const handleRemovePaymentMethod = (paymentId) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMethods = paymentMethods.filter(method => method.id !== paymentId);
              await AsyncStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(updatedMethods));
              setPaymentMethods(updatedMethods);
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              console.error('Failed to remove payment method:', error);
              Alert.alert('Error', 'Could not remove payment method.');
            }
          }
        }
      ]
    );
  };

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'credit_card':
        return 'card';
      case 'bank_account':
        return 'business';
      case 'paypal':
        return 'logo-paypal';
      case 'gcash':
        return 'wallet'; // Using a generic wallet icon
      case 'paymaya':
        return 'card-outline'; // Using a generic card icon
      default:
        return 'card';
    }
  };

  const getPaymentTitle = (method) => {
    if (method.type === 'credit_card') {
      return `${method.brand?.toUpperCase() || 'Card'} •••• ${method.last4}`;
    } else if (method.type === 'bank_account') {
      return `${method.bankName} •••• ${method.last4}`;
    } else if (method.type === 'paypal') {
      return 'PayPal';
    } else if (method.type === 'gcash') {
      return 'GCash';
    } else if (method.type === 'paymaya') {
      return 'PayMaya';
    }
    return 'Payment Method';
  };

  const getPaymentSubtitle = (method) => {
    if (method.type === 'credit_card') {
      return `Expires ${method.expiry} • ${method.cardholder}`;
    } else if (method.type === 'bank_account') {
      return `${method.accountType} Account`;
    } else if (method.type === 'paypal') {
      return method.email;
    } else if (method.type === 'gcash' || method.type === 'paymaya') {
      // Assuming phone number is stored for e-wallets
      const phone = method.phone || 'Not linked';
      return `Linked to ${phone}`;
    }
    return '';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Payment Methods',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/landlord/menu')}>
              <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Add Payment Method Card */}
        <TouchableOpacity 
          style={styles.addCard}
          onPress={handleAddPaymentMethod}
        >
          <View style={styles.addCardContent}>
            <View style={styles.addIcon}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </View>
            <View style={styles.addText}>
              <Text style={styles.addTitle}>Add Payment Method</Text>
              <Text style={styles.addDescription}>
                Add credit card, debit card, or bank account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </TouchableOpacity>

        {/* Current Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No payment methods</Text>
              <Text style={styles.emptyDescription}>
                Add a payment method to receive rent payments
              </Text>
            </View>
          ) : (
            <View style={styles.paymentList}>
              {paymentMethods.map((method, index) => (
                <View 
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    index === paymentMethods.length - 1 && { marginBottom: 0 }
                  ]}
                >
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentLeft}>
                      <View style={styles.paymentIcon}>
                        <Ionicons 
                          name={getPaymentIcon(method.type)} 
                          size={20} 
                          color={Colors.primary} 
                        />
                      </View>
                      <View style={styles.paymentInfo}>
                        <View style={styles.paymentTitleRow}>
                          <Text style={styles.paymentTitle}>
                            {getPaymentTitle(method)}
                          </Text>
                          {method.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.paymentSubtitle}>
                          {getPaymentSubtitle(method)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.paymentActions}>
                      {!method.isDefault && (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleSetDefaultPayment(method.id)}
                        >
                          <Ionicons name="star-outline" size={18} color="#666" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleRemovePaymentMethod(method.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {method.isDefault && (
                    <View style={styles.defaultNote}>
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text style={styles.defaultNoteText}>
                        This is your default payment method for receiving rent
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  addCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addText: {
    flex: 1,
    marginLeft: 12,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  addDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  paymentList: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  defaultNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  defaultNoteText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
});