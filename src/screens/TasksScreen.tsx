import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Task } from "../types";
import { addTask, deleteTask, getTasks, toggleTask } from "../services/tasks";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  const refresh = useCallback(() => {
    getTasks().then(setTasks);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAdd = useCallback(async () => {
    const title = input.trim();
    if (!title) return;
    setInput("");
    await addTask(title);
    refresh();
  }, [input, refresh]);

  const handleToggle = useCallback(
    async (id: string) => {
      await toggleTask(id);
      refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id);
      refresh();
    },
    [refresh]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tasks</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Add a task…"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={handleAdd} disabled={!input.trim()}>
          <Ionicons name="add" size={22} color={colors.accentText} />
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet. Add one above, or ask the assistant.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable style={styles.rowMain} onPress={() => handleToggle(item.id)}>
              <Ionicons
                name={item.done ? "checkbox" : "square-outline"}
                size={22}
                color={item.done ? colors.success : colors.textMuted}
              />
              <Text style={[styles.rowText, item.done && styles.rowTextDone]}>{item.title}</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700", paddingHorizontal: 16, marginBottom: 12 },
  inputRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: colors.accent,
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowMain: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  rowText: { color: colors.text, fontSize: 15, flexShrink: 1 },
  rowTextDone: { color: colors.textMuted, textDecorationLine: "line-through" },
});
