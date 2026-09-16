import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ai_assistant/screens/login_screen.dart';
import 'package:ai_assistant/theme/app_theme.dart';

void main() {
  testWidgets('LoginScreen shows the login form', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(theme: buildAppTheme(), home: const LoginScreen()));

    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Log in'), findsOneWidget);
    expect(find.text('Need an account? Sign up'), findsOneWidget);
  });

  testWidgets('Tapping sign up navigates to the signup screen', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(theme: buildAppTheme(), home: const LoginScreen()));

    await tester.tap(find.text('Need an account? Sign up'));
    await tester.pumpAndSettle();

    expect(find.text('Create account'), findsOneWidget);
    expect(find.text('Password (min 8 characters)'), findsOneWidget);
  });
}
