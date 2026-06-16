import { Redirect } from 'expo-router';
import React from 'react';

import { useCurrentProfile } from '../stores/appStore';

export default function Index() {
  const profile = useCurrentProfile();

  if (!profile) return <Redirect href="/auth/welcome" />;
  if (!profile.onboardingComplete) return <Redirect href="/onboarding/step1-name" />;
  return <Redirect href="/(tabs)" />;
}
