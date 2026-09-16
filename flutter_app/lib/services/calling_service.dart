import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:url_launcher/url_launcher.dart';

class CallingException implements Exception {
  final String message;
  CallingException(this.message);
  @override
  String toString() => message;
}

class ResolvedContact {
  final String name;
  final String phoneNumber;
  ResolvedContact(this.name, this.phoneNumber);
}

final _phoneLike = RegExp(r'^[+\d][\d\s().-]{4,}$');

class CallingService {
  CallingService._();
  static final CallingService instance = CallingService._();

  /// Resolves "call John" / "call +1 555 123 4567" into a name + number.
  /// A query that already looks like a phone number is used as-is — no
  /// contacts permission needed for that path.
  Future<ResolvedContact> resolveCallTarget(String query) async {
    final trimmed = query.trim();
    if (_phoneLike.hasMatch(trimmed)) {
      return ResolvedContact(trimmed, trimmed);
    }

    final granted = await FlutterContacts.requestPermission(readonly: true);
    if (!granted) {
      throw CallingException(
        "Contacts permission was denied, so I can't look up names. Try saying the phone number instead, or allow contacts access in your device settings.",
      );
    }

    final contacts = await FlutterContacts.getContacts(withProperties: true);
    final needle = trimmed.toLowerCase();
    for (final contact in contacts) {
      if (contact.displayName.toLowerCase().contains(needle) && contact.phones.isNotEmpty) {
        return ResolvedContact(contact.displayName, contact.phones.first.number);
      }
    }

    throw CallingException('I couldn\'t find a contact matching "$trimmed" with a phone number.');
  }

  /// Opens the device's native dialer pre-filled with the number.
  ///
  /// Neither iOS nor Android lets a third-party app place a phone call
  /// silently and autonomously — a deliberate OS-level restriction so apps
  /// can't dial (and bill) on someone's behalf without them touching
  /// anything. So "calling for you" means: find the number, open the
  /// dialer ready to go, and you tap Call.
  Future<void> openDialer(String phoneNumber) async {
    final uri = Uri(scheme: 'tel', path: phoneNumber);
    final ok = await launchUrl(uri);
    if (!ok) {
      throw CallingException("This device can't open the phone dialer.");
    }
  }
}
