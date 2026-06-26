import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter/services.dart' show rootBundle, MethodChannel;
import 'dart:convert';

class GeneratorScreen extends StatefulWidget {
  const GeneratorScreen({super.key});

  @override
  State<GeneratorScreen> createState() => _GeneratorScreenState();
}

class _GeneratorScreenState extends State<GeneratorScreen> {
  late final WebViewController _controller;
  static const platform = MethodChannel('com.bucc/clipboard');

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..addJavaScriptChannel(
        'FlutterChannel',
        onMessageReceived: (JavaScriptMessage message) async {
          try {
            final data = jsonDecode(message.message);
            if (data['action'] == 'openGmail') {
              await platform.invokeMethod('sendHtmlEmail', {
                'recipient': 'gb-bucc@googlegroups.com',
                'subject': data['subject'] ?? '[GB-BUCC] Emergency',
                'htmlBody': '',
                'plainBody': '',
              });
            }
          } catch (e) {
            debugPrint('Error handling JS message: $e');
          }
        },
      );
      
    _loadHtmlFromAssets();
  }

  Future<void> _loadHtmlFromAssets() async {
    final String htmlContent = await rootBundle.loadString('assets/web/index.html');
    final String cssContent = await rootBundle.loadString('assets/web/style.css');
    final String jsContent = await rootBundle.loadString('assets/web/script.js');

    // Inject CSS and JS directly into the HTML to avoid path resolution issues in webview
    final String injectedHtml = htmlContent
        .replaceAll('<link rel="stylesheet" href="style.css">', '<style>$cssContent</style>')
        .replaceAll('<script src="script.js"></script>', '<script>$jsContent</script>');

    await _controller.loadHtmlString(injectedHtml);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BUCC Blood Mail Generator'),
        backgroundColor: Colors.red[800],
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
