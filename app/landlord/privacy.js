import React, { useCallback } from 'react';
import { ScrollView, Text, StyleSheet, View, BackHandler, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {

  // Handle System Back Action
  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        router.back();
        return true; 
      };

      const backHandlerSubscription = BackHandler.addEventListener(
        'hardwareBackPress', 
        handleBackPress
      );

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
          title: 'Privacy Policy',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: July 26, 2024</Text>

        <Text style={styles.paragraph}>
          Welcome to Board-Ease. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.subheading}>A. Information You Provide to Us</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, such as when you create an account, create a property listing, communicate with other users, or contact support. This information may include:
        </Text>
        <Text style={styles.listItem}>• Account Information: Your name, email address, phone number, and password.</Text>
        <Text style={styles.listItem}>• Profile Information: Your profile picture, biography, and company details.</Text>
        <Text style={styles.listItem}>• Property Information: Listing details such as address, photos, rent price, description, amenities, and rules.</Text>
        <Text style={styles.listItem}>• Financial Information: Bank account or other payment details for processing payments.</Text>
        <Text style={styles.listItem}>• Communications: Messages and inquiries you send or receive through the app.</Text>

        <Text style={styles.subheading}>B. Information We Collect Automatically</Text>
        <Text style={styles.paragraph}>
          When you use the app, we may automatically collect certain information, including:
        </Text>
        <Text style={styles.listItem}>• Usage Data: Information about how you interact with our service, such as features used and pages viewed.</Text>
        <Text style={styles.listItem}>• Device Information: Information about your mobile device, including hardware model, operating system, and unique device identifiers.</Text>
        <Text style={styles.listItem}>• Location Information: We may collect your device's location if you grant us permission to do so, to help you find or list properties.</Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.listItem}>• Provide, maintain, and improve our services.</Text>
        <Text style={styles.listItem}>• Facilitate communication between landlords and tenants.</Text>
        <Text style={styles.listItem}>• Process transactions and send you related information, including payment confirmations.</Text>
        <Text style={styles.listItem}>• Respond to your comments, questions, and support requests.</Text>
        <Text style={styles.listItem}>• Monitor and analyze trends, usage, and activities in connection with our services.</Text>
        <Text style={styles.listItem}>• Ensure the security of our platform and prevent fraud.</Text>

        <Text style={styles.heading}>3. How We Share Your Information</Text>
        <Text style={styles.paragraph}>
          We may share your information in the following situations:
        </Text>
        <Text style={styles.listItem}>• With Other Users: Your public profile information and property listings are visible to other users. Your contact information may be shared with a tenant or landlord once a booking is confirmed.</Text>
        <Text style={styles.listItem}>• With Service Providers: We may share information with third-party vendors who perform services for us, such as payment processing and data analytics. These providers are obligated to protect your data.</Text>
        <Text style={styles.listItem}>• For Legal Reasons: We may disclose your information if required by law or if we believe that such action is necessary to comply with a legal obligation or protect the rights and safety of Board-Ease, our users, or the public.</Text>

        <Text style={styles.heading}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement reasonable security measures to protect your information from unauthorized access, use, or disclosure. However, no electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </Text>

        <Text style={styles.heading}>5. Your Rights and Choices</Text>
        <Text style={styles.paragraph}>
          You have rights regarding your personal information:
        </Text>
        <Text style={styles.listItem}>• Account Information: You can review and update your account information at any time by logging into your account and visiting your profile settings.</Text>
        <Text style={styles.listItem}>• Password: Both tenants and landlords can change their password at any time through the app's security settings.</Text>
        <Text style={styles.listItem}>• Location Information: You can disable location services through your device's settings.</Text>
        <Text style={styles.listItem}>• Deleting Your Account: You may delete your account by contacting us. Please note that some information may be retained in our records for legal or legitimate business purposes.</Text>

        <Text style={styles.heading}>6. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
        </Text>

        <Text style={styles.heading}>7. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at: support@boardease.com
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
