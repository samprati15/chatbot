class Message {
  final String id;
  final String role; // "user" | "assistant"
  final String text;
  final int createdAt;

  Message({
    required this.id,
    required this.role,
    required this.text,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      role: json['role'] as String,
      text: json['text'] as String,
      createdAt: json['createdAt'] as int,
    );
  }

  factory Message.local({required String role, required String text}) {
    return Message(
      id: '${DateTime.now().microsecondsSinceEpoch}',
      role: role,
      text: text,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
  }
}
