import 'package:flutter/material.dart';
import 'screens/generator_screen.dart';

void main() {
  runApp(const BloodMailApp());
}

class BloodMailApp extends StatelessWidget {
  const BloodMailApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BUCC Blood Mail Generator',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
        ),
      ),
      home: const GeneratorScreen(),
    );
  }
}
