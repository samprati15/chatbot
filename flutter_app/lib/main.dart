import 'package:flutter/material.dart';
import 'services/api_client.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient.instance.init();
  runApp(const AiAssistantApp());
}

class AiAssistantApp extends StatelessWidget {
  const AiAssistantApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Assistant',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: ApiClient.instance.isAuthenticated ? const HomeScreen() : const LoginScreen(),
    );
  }
}
