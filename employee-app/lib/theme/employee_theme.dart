import 'package:flutter/material.dart';

class EmployeeAppTheme {
  // Brand colors
  static const Color primaryRed = Color(0xFFD71920);
  static const Color darkRed = Color(0xFFA80F18);
  static const Color primaryYellow = Color(0xFFFFC928);
  static const Color darkBg = Color(0xFF1E1F23);
  static const Color darkCard = Color(0xFF282A2F);
  static const Color scaffoldBg = Color(0xFFFFFDF8);
  
  static const Color textPrimary = Color(0xFF202124);
  static const Color textSecondary = Color(0xFF686868);
  static const Color successGreen = Color(0xFF16834A);
  static const Color warningOrange = Color(0xFFE65100);
  static const Color errorRed = Color(0xFFC62828);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'PlusJakartaSans',
      scaffoldBackgroundColor: scaffoldBg,
      colorScheme: const ColorScheme.light(
        primary: primaryRed,
        secondary: primaryYellow,
        surface: Colors.white,
        error: errorRed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBg,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryRed,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }
}
