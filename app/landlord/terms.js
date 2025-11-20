import React, { useCallback, useLayoutEffect } from 'react';
import { ScrollView, Text, StyleSheet, BackHandler, TouchableOpacity, Platform } from 'react-native';
import { Stack, router, useNavigation } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();

  // 1. Hide the Bottom Tab Bar when this screen is active
  useLayoutEffect(() => {
    // Attempt to hide the tab bar in the parent navigator
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      // Restore the tab bar when leaving
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined, 
      });
    };
  }, [navigation]);

  const handleBack = () => {
    router.replace('/landlord/privacy-security');
  };

  // 2. Handle System Back Action
  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        handleBack();
        return true; 
      };

      // Only add listener on Android
      let backHandlerSubscription;
      if (Platform.OS === 'android') {
        backHandlerSubscription = BackHandler.addEventListener(
          'hardwareBackPress', 
          handleBackPress
        );
      }

      return () => {
        if (backHandlerSubscription) {
          backHandlerSubscription.remove();
        }
      };
    }, []) 
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="#fff" 
                style={{ marginLeft: 10 }} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: July 26, 2024</Text>

        <Text style={styles.paragraph}>
          Please read these Terms of Service ("Terms") carefully before using the Board-Ease mobile application. By accessing or using the Service, you agree to be bound by these Terms.
        </Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account or accessing Board-Ease, you agree to comply with these Terms and all applicable laws and regulations. If you do not agree with any part of these Terms, you are prohibited from using this service.
        </Text>

        <Text style={styles.heading}>2. User Accounts</Text>
        <Text style={styles.subheading}>A. Registration</Text>
        <Text style={styles.paragraph}>
          To use certain features of the app, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
        </Text>
        
        <Text style={styles.heading}>3. Landlord Responsibilities</Text>
        <Text style={styles.listItem}>• You represent and warrant that you own or have the legal right to lease the properties you list.</Text>
        <Text style={styles.listItem}>• You agree to provide accurate descriptions, photos, and pricing for your listings.</Text>
        <Text style={styles.listItem}>• You must comply with all local housing laws, including fair housing regulations.</Text>

        <Text style={styles.heading}>4. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You agree not to engage in any of the following prohibited activities:
        </Text>
        <Text style={styles.listItem}>• Using the service for any illegal purpose.</Text>
        <Text style={styles.listItem}>• Harassing, abusing, or harming another person.</Text>
        <Text style={styles.listItem}>• Attempting to interfere with or compromise the system integrity or security.</Text>

        <Text style={styles.heading}>5. Payments and Fees</Text>
        <Text style={styles.paragraph}>
          Board-Ease may facilitate payments between landlords and tenants. We utilize third-party payment processors, and their terms and conditions apply to your transactions.
        </Text>

        <Text style={styles.heading}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall Board-Ease be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service.
        </Text>

        <Text style={styles.heading}>7. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at: legal@boardease.com
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 8,
    marginLeft: 16,
  },
});