import 'package:flutter/material.dart';
import '../models/message.dart';
import '../services/calling_service.dart';
import '../services/chat_service.dart';
import '../theme/colors.dart';
import '../widgets/message_bubble.dart';

final _welcome = Message.local(
  role: 'assistant',
  text: 'Hi! I can answer questions, manage your tasks, and place calls for you.\n\n'
      'Try:\n'
      '• "What\'s the capital of France?"\n'
      '• "Remind me to buy milk"\n'
      '• "List my tasks"\n'
      '• "Complete all tasks"\n'
      '• "Call Mom"',
);

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<Message> _messages = [_welcome];
  bool _busy = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    try {
      final history = await ChatService.instance.getMessages();
      if (history.isNotEmpty && mounted) {
        setState(() => _messages
          ..clear()
          ..addAll(history));
      }
    } catch (_) {
      // Offline or fresh account — keep the welcome message.
    } finally {
      if (mounted) setState(() => _loading = false);
      _scrollToEnd();
    }
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _busy) return;
    _controller.clear();

    setState(() {
      _messages.add(Message.local(role: 'user', text: text));
      _busy = true;
    });
    _scrollToEnd();

    try {
      final result = await ChatService.instance.send(text);
      setState(() => _messages.add(Message.local(role: 'assistant', text: result.reply)));

      if (result.intent == 'call' && result.callTarget != null) {
        await _handleCall(result.callTarget!);
      }
    } catch (err) {
      setState(() => _messages.add(Message.local(role: 'assistant', text: 'Something went wrong: $err')));
    } finally {
      if (mounted) setState(() => _busy = false);
      _scrollToEnd();
    }
  }

  Future<void> _handleCall(String target) async {
    try {
      final contact = await CallingService.instance.resolveCallTarget(target);
      setState(() => _messages.add(Message.local(
            role: 'assistant',
            text: 'Found ${contact.name} (${contact.phoneNumber}). Opening the dialer — tap Call to confirm.',
          )));
      await CallingService.instance.openDialer(contact.phoneNumber);
    } catch (err) {
      setState(() => _messages.add(Message.local(role: 'assistant', text: err.toString())));
    }
  }

  Future<void> _clearChat() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Clear chat'),
        content: const Text('Remove all messages? Your tasks are kept.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Clear')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ChatService.instance.clearMessages();
    } catch (_) {
      // Best-effort — clear locally regardless.
    }
    setState(() => _messages
      ..clear()
      ..add(_welcome));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assistant'),
        actions: [
          IconButton(onPressed: _clearChat, icon: const Icon(Icons.delete_outline)),
        ],
      ),
      body: Column(
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2, color: AppColors.accent),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) => MessageBubble(message: _messages[index]),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      minLines: 1,
                      maxLines: 4,
                      enabled: !_busy,
                      decoration: const InputDecoration(hintText: 'Ask a question, add a task, or call someone…'),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  AnimatedBuilder(
                    animation: _controller,
                    builder: (context, _) => IconButton.filled(
                      onPressed: _busy || _controller.text.trim().isEmpty ? null : _send,
                      icon: _busy
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.accentText),
                            )
                          : const Icon(Icons.arrow_upward),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
