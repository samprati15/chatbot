import '../models/message.dart';
import 'api_client.dart';

class ChatReply {
  final String reply;
  final String intent;
  final String? callTarget;

  ChatReply({required this.reply, required this.intent, this.callTarget});
}

class ChatService {
  ChatService._();
  static final ChatService instance = ChatService._();

  final _api = ApiClient.instance;

  Future<List<Message>> getMessages() async {
    final data = await _api.get('/api/messages');
    return (data['messages'] as List).map((m) => Message.fromJson(m as Map<String, dynamic>)).toList();
  }

  Future<void> clearMessages() => _api.delete('/api/messages');

  /// Sends the user's text to the backend. The server applies task/chat
  /// intents itself; a "call" intent comes back as a target name/number for
  /// this device to resolve via contacts + the native dialer.
  Future<ChatReply> send(String text) async {
    final data = await _api.post('/api/chat', {'text': text});
    return ChatReply(
      reply: data['reply'] as String,
      intent: data['intent'] as String,
      callTarget: data['target'] as String?,
    );
  }
}
