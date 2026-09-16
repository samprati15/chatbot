class Task {
  final String id;
  final String title;
  final bool done;
  final int createdAt;

  Task({
    required this.id,
    required this.title,
    required this.done,
    required this.createdAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      done: json['done'] as bool,
      createdAt: json['createdAt'] as int,
    );
  }
}
