import 'dart:convert';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

/// Talks to the Node/Express backend. Base URL and auth token are persisted
/// in secure storage so they survive app restarts.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  static const _baseUrlKey = 'api_base_url';

  String? _token;
  String? _baseUrl;

  /// Android emulators can't reach the host machine via "localhost" — they
  /// need the special 10.0.2.2 alias. iOS simulators and desktop can use
  /// localhost directly. This is just a starting suggestion; it's editable
  /// in Settings since a real device needs the host's LAN IP instead.
  static String get defaultBaseUrl {
    if (Platform.isAndroid) return 'http://10.0.2.2:4000';
    return 'http://localhost:4000';
  }

  Future<void> init() async {
    _token = await _storage.read(key: _tokenKey);
    _baseUrl = await _storage.read(key: _baseUrlKey) ?? defaultBaseUrl;
  }

  String get baseUrl => _baseUrl ?? defaultBaseUrl;
  bool get isAuthenticated => _token != null;

  Future<void> setBaseUrl(String url) async {
    _baseUrl = url.trim();
    await _storage.write(key: _baseUrlKey, value: _baseUrl);
  }

  Future<void> setToken(String? token) async {
    _token = token;
    if (token == null) {
      await _storage.delete(key: _tokenKey);
    } else {
      await _storage.write(key: _tokenKey, value: token);
    }
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<dynamic> _handle(http.Response res) async {
    if (res.statusCode == 204 || res.body.isEmpty) {
      if (res.statusCode >= 200 && res.statusCode < 300) return null;
      throw ApiException('Request failed (${res.statusCode})', res.statusCode);
    }
    final decoded = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) return decoded;
    final message = decoded is Map && decoded['error'] != null
        ? decoded['error'].toString()
        : (decoded is Map && decoded['reply'] != null ? decoded['reply'].toString() : 'Request failed (${res.statusCode})');
    throw ApiException(message, res.statusCode);
  }

  Future<dynamic> get(String path) async {
    final res = await http.get(_uri(path), headers: _headers).timeout(const Duration(seconds: 20));
    return _handle(res);
  }

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    final res = await http
        .post(_uri(path), headers: _headers, body: body != null ? jsonEncode(body) : null)
        .timeout(const Duration(seconds: 30));
    return _handle(res);
  }

  Future<dynamic> patch(String path, [Map<String, dynamic>? body]) async {
    final res = await http
        .patch(_uri(path), headers: _headers, body: body != null ? jsonEncode(body) : null)
        .timeout(const Duration(seconds: 20));
    return _handle(res);
  }

  Future<dynamic> delete(String path) async {
    final res = await http.delete(_uri(path), headers: _headers).timeout(const Duration(seconds: 20));
    return _handle(res);
  }
}
