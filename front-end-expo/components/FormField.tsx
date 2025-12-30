import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme, TextInputProps, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  containerStyle?: ViewStyle;
  testID?: string;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  containerStyle,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const placeholderColor = isDark ? '#666' : '#999';

  return (
    <View style={[styles.group, containerStyle]}>
      <Text style={[styles.label, isDark && styles.textDark]} numberOfLines={1}>{label}</Text>
      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 6,
    color: '#1f2933',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  textDark: {
    color: '#ffffff'
  },
  inputDark: {
    backgroundColor: '#2d3748',
    color: '#ffffff'
  }
});

export default FormField;