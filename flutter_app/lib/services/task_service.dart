import '../models/task.dart';
import 'api_client.dart';

class TaskService {
  TaskService._();
  static final TaskService instance = TaskService._();

  final _api = ApiClient.instance;

  Future<List<Task>> getTasks() async {
    final data = await _api.get('/api/tasks');
    return (data['tasks'] as List).map((t) => Task.fromJson(t as Map<String, dynamic>)).toList();
  }

  Future<Task> addTask(String title) async {
    final data = await _api.post('/api/tasks', {'title': title});
    return Task.fromJson(data['task'] as Map<String, dynamic>);
  }

  Future<void> toggleTask(String id) => _api.patch('/api/tasks/$id/toggle');

  Future<void> deleteTask(String id) => _api.delete('/api/tasks/$id');

  Future<int> completeAll() async {
    final data = await _api.post('/api/tasks/complete-all');
    return data['count'] as int;
  }

  Future<int> clearCompleted() async {
    final data = await _api.post('/api/tasks/clear-completed');
    return data['count'] as int;
  }
}
