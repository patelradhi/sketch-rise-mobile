import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Linking, Modal, Pressable, Text, View } from 'react-native';

interface Props {
	visible: boolean;
	imageUrl: string;
	onClose: () => void;
}

async function openOrAlert(url: string, fallbackLabel: string) {
	const can = await Linking.canOpenURL(url);
	if (!can) {
		Alert.alert(`${fallbackLabel} is not available`, 'The app could not be opened on this device.');
		return;
	}
	await Linking.openURL(url);
}

export function ShareSheet({ visible, imageUrl, onClose }: Props) {
	const shareWhatsApp = async () => {
		const text = encodeURIComponent(`My 3D floor plan: ${imageUrl}`);
		await openOrAlert(`whatsapp://send?text=${text}`, 'WhatsApp');
		onClose();
	};

	const shareEmail = async () => {
		const subject = encodeURIComponent('My 3D floor plan');
		const body = encodeURIComponent(`Check out my 3D floor plan: ${imageUrl}`);
		await openOrAlert(`mailto:?subject=${subject}&body=${body}`, 'Email');
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable className="flex-1 bg-black/60" onPress={onClose} />
			<View className="bg-card rounded-t-3xl px-6 pt-5 pb-10 border-t border-border">
				<View className="self-center w-10 h-1 rounded-full bg-muted mb-5" />
				<Text className="text-lg font-heading text-primary mb-4">Share to</Text>

				<Pressable className="btn-primary-row mb-3" onPress={shareWhatsApp}>
					<Ionicons name="logo-whatsapp" size={20} color="#0a0900" />
					<Text className="btn-primary-text">WhatsApp</Text>
				</Pressable>

				<Pressable className="btn-secondary" onPress={shareEmail}>
					<Ionicons name="mail-outline" size={20} color="#f5f0e8" />
					<Text className="btn-secondary-text">Email</Text>
				</Pressable>
			</View>
		</Modal>
	);
}
