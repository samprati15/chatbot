import 'api_client.dart';

class AuthResult {
  final String token;
  final String email;
  AuthResult(this.token, this.email);
}

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final _api = ApiClient.instance;

  bool get isLoggedIn => _api.isAuthenticated;

  Future<AuthResult> signup(String email, String password) async {
    final data = await _api.post('/api/auth/signup', {'email': email, 'password': password});
    final token = data['token'] as String;
    await _api.setToken(token);
    return AuthResult(token, data['user']['email'] as String);
  }

  Future<AuthResult> login(String email, String password) async {
    final data = await _api.post('/api/auth/login', {'email': email, 'password': password});
    final token = data['token'] as String;
    await _api.setToken(token);
    return AuthResult(token, data['user']['email'] as String);
  }

  Future<void> logout() async {
    await _api.setToken(null);
  }
}
