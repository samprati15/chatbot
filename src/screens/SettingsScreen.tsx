import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { loadSettings, saveSettings } from "../services/settings";
import { DEFAULT_MODEL } from "../services/llm";

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setApiKey(s.apiKey);
      setModel(s.model);
    });
  }, []);

  const handleSave = useCallback(async () => {
    await saveSettings({ apiKey, model: model || DEFAULT_MODEL });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [apiKey, model]);

  const handleClearKey = useCallback(() => {
    Alert.alert("Remove API key", "This disables Q&A until you add a new key.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setApiKey("");
          await saveSettings({ apiKey: "", model });
        },
      },
    ]);
  }, [model]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Settings</Text>

      <Text style={styles.label}>Anthropic API key</Text>
      <Text style={styles.hint}>
        Stored only on this device (secure storage), used to answer your questions. Get one at
        console.anthropic.com.
      </Text>
      <TextInput
        style={styles.input}
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="sk-ant-…"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <Text style={styles.label}>Model</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder={DEFAULT_MODEL}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{saved ? "Saved ✓" : "Save"}</Text>
      </Pressable>

      <Pressable onPress={handleClearKey}>
        <Text style={styles.removeText}>Remove API key</Text>
      </Pressable>

      <View style={styles.about}>
        <Text style={styles.aboutTitle}>About calling</Text>
        <Text style={styles.hint}>
          iOS and Android don't allow apps to silently place phone calls on your behalf — that's an
          OS-level protection. Saying "call Mom" looks up the contact and opens your dialer with the
          number ready; you tap Call to confirm.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 8, paddingBottom: 48 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  label: { color: colors.text, fontSize: 14, fontWeight: "600", marginTop: 16 },
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: colors.accentText, fontWeight: "700", fontSize: 15 },
  removeText: { color: colors.danger, textAlign: "center", marginTop: 14, fontSize: 13 },
  about: { marginTop: 32, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 16 },
  aboutTitle: { color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 6 },
});
