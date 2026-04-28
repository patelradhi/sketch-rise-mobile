import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { inputFieldStyle, PLACEHOLDER_COLOR } from '@/constants/styles';

interface Props {
	visible: boolean;
	initialTitle: string;
	onCancel: () => void;
	onSave: (title: string) => Promise<void> | void;
}

export function RenameModal({ visible, initialTitle, onCancel, onSave }: Props) {
	const [value, setValue] = useState(initialTitle);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (visible) setValue(initialTitle);
	}, [visible, initialTitle]);

	const handleSave = async () => {
		const trimmed = value.trim();
		if (!trimmed || trimmed === initialTitle) {
			onCancel();
			return;
		}
		setSubmitting(true);
		try {
			await onSave(trimmed);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<Pressable className="flex-1 bg-black/70 items-center justify-center px-6" onPress={onCancel}>
				<Pressable className="w-full bg-card rounded-2xl p-5 border border-accent/20" onPress={() => {}}>
					<Text className="text-lg font-heading text-primary mb-3">Rename project</Text>
					<TextInput
						value={value}
						onChangeText={setValue}
						placeholder="Project name"
						placeholderTextColor={PLACEHOLDER_COLOR}
						className="input-field"
						style={inputFieldStyle}
						autoFocus
					/>
					<View className="flex-row gap-3 mt-2">
						<Pressable className="flex-1 btn-outline" onPress={onCancel} disabled={submitting}>
							<Text className="btn-outline-text">Cancel</Text>
						</Pressable>
						<Pressable
							className="flex-1 btn-primary"
							onPress={handleSave}
							disabled={submitting}
							style={submitting ? { opacity: 0.7 } : undefined}
						>
							<Text className="btn-primary-text">{submitting ? 'Saving…' : 'Save'}</Text>
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
