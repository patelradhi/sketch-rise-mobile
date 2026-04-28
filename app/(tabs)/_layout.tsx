/**
 * Tab Navigator Layout
 *
 * NO AUTH GUARD — all tabs are public. Anyone can browse
 * Product, Pricing, Community without signing in.
 * Only "Start Building" on the Home tab requires sign-in.
 *
 * WHY Tabs from expo-router:
 * Expo Router's <Tabs> component reads every .tsx file in this
 * folder and creates one bottom tab for each. The tab bar
 * renders automatically at the bottom of every tab screen.
 */

import { Tabs } from 'expo-router';
// Tabs — the bottom tab navigator. Each child file = one tab.

import Ionicons from '@expo/vector-icons/Ionicons';
// Bundled icon library. No install needed. We use filled icons
// for active tabs and outline icons for inactive — standard
// iOS/Android convention.

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				// Hide default header — we build our own with NativeWind.
				headerShown: false,

				// Floating pill-style tab bar
				tabBarStyle: {
					backgroundColor: '#141200',      // --color-card (dark surface)
					borderTopWidth: 0,                // no top border line
					position: 'absolute',             // float above content
					bottom: 16,                       // 16px from screen bottom
					left: 20,                         // 20px from left edge
					right: 20,                        // 20px from right edge
					borderRadius: 24,                 // pill shape
					height: 64,
					paddingBottom: 0,                 // no extra bottom padding
					elevation: 8,                     // Android shadow
					shadowColor: '#000',              // iOS shadow
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.3,
					shadowRadius: 8,
				},

				// Gold for active tab, muted for inactive
				tabBarActiveTintColor: '#F59E0B',
				tabBarInactiveTintColor: 'rgba(245, 240, 232, 0.35)',

				// Tab label font
				tabBarLabelStyle: {
					fontFamily: 'sans-medium',
					fontSize: 10,
					marginTop: -4,
				},

				// Remove extra padding on items
				tabBarItemStyle: {
					paddingVertical: 8,
				},
			}}
		>
			{/* Home tab — the landing page (index.tsx) */}
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? 'home' : 'home-outline'}
							size={22}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="product"
				options={{
					title: 'Product',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? 'cube' : 'cube-outline'}
							size={22}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="pricing"
				options={{
					title: 'Pricing',
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? 'pricetag' : 'pricetag-outline'}
							size={22}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
