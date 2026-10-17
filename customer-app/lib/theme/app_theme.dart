import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryRed = Color(0xFFD71920);
  static const Color darkRed = Color(0xFFA80F18);
  static const Color primaryYellow = Color(0xFFFFC928);
  static const Color darkYellow = Color(0xFFE5A900);
  static const Color background = Color(0xFFFFFDF8);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color primaryText = Color(0xFF202124);
  static const Color secondaryText = Color(0xFF686868);
  static const Color stateSuccess = Color(0xFF16834A);
  static const Color stateError = Color(0xFFC62828);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'PlusJakartaSans',
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.light(
        primary: primaryRed,
        secondary: primaryYellow,
        surface: surfaceCard,
        error: stateError,
        onPrimary: Colors.white,
        onSecondary: primaryText,
        onSurface: primaryText,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryRed,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0x1A202124)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryRed,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: background,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0x26202124)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0x26202124)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryRed, width: 2),
        ),
        hintStyle: const TextStyle(color: secondaryText, fontSize: 13),
      ),
    );
  }
}
