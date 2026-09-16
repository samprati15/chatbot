import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../theme/colors.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final _urlController = TextEditingController(text: ApiClient.instance.baseUrl);
  bool _saved = false;

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    await ApiClient.instance.setBaseUrl(_urlController.text);
    setState(() => _saved = true);
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) setState(() => _saved = false);
    });
  }

  Future<void> _logout() async {
    await AuthService.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Backend URL', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            const Text(
              'Where the Node backend is running. Android emulators reach the host machine at '
              '10.0.2.2, not localhost; a real device needs your computer\'s LAN IP.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _urlController,
              keyboardType: TextInputType.url,
              autocorrect: false,
              decoration: const InputDecoration(hintText: 'http://10.0.2.2:4000'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _save, child: Text(_saved ? 'Saved ✓' : 'Save')),
            const SizedBox(height: 32),
            const Divider(color: AppColors.border),
            const SizedBox(height: 16),
            const Text('About calling', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            const Text(
              "iOS and Android don't allow apps to silently place phone calls on your behalf — "
              'that\'s an OS-level protection. Saying "call Mom" looks up the contact and opens '
              'your dialer with the number ready; you tap Call to confirm.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 32),
            OutlinedButton(
              onPressed: _logout,
              style: OutlinedButton.styleFrom(foregroundColor: AppColors.danger),
              child: const Text('Log out'),
            ),
          ],
        ),
      ),
    );
  }
}
