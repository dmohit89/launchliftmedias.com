import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const API_URL = '[localhost](http://localhost:5000)';

export default function LoginScreen() {
  const { socialLogin, isLoading } = useAuthStore();

  const handleSocialLogin = async (platform) => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      
      // Implement OAuth flow based on platform
      // This is a simplified example - full implementation would use platform-specific OAuth
      const result = await AuthSession.startAsync({
        authUrl: `${API_URL}/api/auth/${platform}?redirect_uri=${encodeURIComponent(redirectUri)}`,
      });

      if (result.type === 'success' && result.params.token) {
        await socialLogin(result.params.token);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <LinearGradient colors={['#0ea5e9', '#d946ef']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="sparkles" size={40} color="white" />
            </View>
            <Text style={styles.logoText}>InfluenceHub</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in with your social media account to continue
          </Text>

          {/* Social Login Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleSocialLogin('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="white" />
              <Text style={styles.buttonText}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialLogin('google')}
            >
              <Ionicons name="logo-google" size={24} color="white" />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.instagramButton]}
              onPress={() => handleSocialLogin('instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="white" />
              <Text style={styles.buttonText}>Continue with Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.twitterButton]}
              onPress={() => handleSocialLogin('twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color="white" />
              <Text style={styles.buttonText}>Continue with Twitter</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoIcon: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  logoText: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 40 },
  buttons: { gap: 12 },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, gap: 12
  },
  facebookButton: { backgroundColor: '#1877F2' },
  googleButton: { backgroundColor: '#EA4335' },
  instagramButton: { backgroundColor: '#E4405F' },
  twitterButton: { backgroundColor: '#1DA1F2' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  terms: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', marginTop: 24 }
});
