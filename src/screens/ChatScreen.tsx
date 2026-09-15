import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Message } from "../types";
import { getJSON, setJSON } from "../services/storage";
import { parseIntent } from "../services/intent";
import { addTask, findOpenTaskByTitle, getTasks, toggleTask } from "../services/tasks";
import { askAssistant, LLMError } from "../services/llm";
import { loadSettings } from "../services/settings";
import { CallingError, openDialer, resolveCallTarget } from "../services/calling";

const MESSAGES_KEY = "chat_messages:v1";

function makeMessage(role: Message["role"], text: string): Message {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, text, createdAt: Date.now() };
}

const WELCOME = makeMessage(
  "assistant",
  "Hi! I can answer questions, manage your tasks, and place calls for you.\n\n" +
    "Try:\n" +
    '• "What\'s the capital of France?"\n' +
    '• "Remind me to buy milk"\n' +
    '• "List my tasks"\n' +
    '• "Call Mom"'
);

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    getJSON<Message[]>(MESSAGES_KEY, []).then((saved) => {
      if (saved.length) setMessages(saved);
    });
  }, []);

  const persist = useCallback((next: Message[]) => {
    setMessages(next);
    setJSON(MESSAGES_KEY, next);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    const userMsg = makeMessage("user", text);
    const withUser = [...messages, userMsg];
    persist(withUser);

    const intent = parseIntent(text);
    setBusy(true);
    try {
      switch (intent.type) {
        case "task_add": {
          const task = await addTask(intent.title);
          persist([...withUser, makeMessage("assistant", `Added to your tasks: "${task.title}".`)]);
          break;
        }
        case "task_list": {
          const tasks = await getTasks();
          const open = tasks.filter((t) => !t.done);
          const reply = open.length
            ? `Open tasks:\n${open.map((t) => `• ${t.title}`).join("\n")}`
            : "You have no open tasks. Nicely done.";
          persist([...withUser, makeMessage("assistant", reply)]);
          break;
        }
        case "task_done": {
          const task = await findOpenTaskByTitle(intent.title);
          if (!task) {
            persist([...withUser, makeMessage("assistant", `I couldn't find an open task matching "${intent.title}".`)]);
            break;
          }
          await toggleTask(task.id);
          persist([...withUser, makeMessage("assistant", `Marked "${task.title}" as done.`)]);
          break;
        }
        case "call": {
          try {
            const contact = await resolveCallTarget(intent.target);
            persist([
              ...withUser,
              makeMessage("assistant", `Found ${contact.name} (${contact.phoneNumber}). Opening the dialer — tap Call to confirm.`),
            ]);
            await openDialer(contact.phoneNumber);
          } catch (err) {
            const msg = err instanceof CallingError ? err.message : "I couldn't place that call.";
            persist([...withUser, makeMessage("assistant", msg)]);
          }
          break;
        }
        case "chat": {
          const settings = await loadSettings();
          try {
            const reply = await askAssistant([...withUser], settings.apiKey, settings.model);
            persist([...withUser, makeMessage("assistant", reply)]);
          } catch (err) {
            const msg = err instanceof LLMError ? err.message : "Something went wrong answering that.";
            persist([...withUser, makeMessage("assistant", msg)]);
          }
          break;
        }
      }
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [input, busy, messages, persist]);

  const clearChat = useCallback(() => {
    Alert.alert("Clear chat", "Remove all messages? Your tasks are kept.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => persist([WELCOME]) },
    ]);
  }, [persist]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant</Text>
        <Pressable onPress={clearChat} hitSlop={10}>
          <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question, add a task, or call someone…"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!busy}
        />
        <Pressable
          style={[styles.sendButton, (busy || !input.trim()) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={busy || !input.trim()}
        >
          <Ionicons name="arrow-up" size={20} color={colors.accentText} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  list: { padding: 16, gap: 10 },
  bubble: { maxWidth: "85%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: colors.accent, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: colors.surface, alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { opacity: 0.4 },
});
