package com.example.blood_mail_generator

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.bucc/clipboard"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "copyRichText" -> {
                    val plainText = call.argument<String>("plainText")
                    val htmlText = call.argument<String>("htmlText")
                    
                    if (plainText != null && htmlText != null) {
                        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newHtmlText("BUCC Mail", plainText, htmlText)
                        clipboard.setPrimaryClip(clip)
                        result.success(true)
                    } else {
                        result.error("INVALID_ARGS", "Missing text", null)
                    }
                }
                "sendHtmlEmail" -> {
                    val recipient = call.argument<String>("recipient")
                    val subject = call.argument<String>("subject")
                    val htmlBody = call.argument<String>("htmlBody")
                    val plainBody = call.argument<String>("plainBody")
                    
                    if (recipient != null && subject != null) {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/html"
                            putExtra(Intent.EXTRA_EMAIL, arrayOf(recipient))
                            putExtra(Intent.EXTRA_SUBJECT, subject)
                            // Leave the body intentionally blank! Gmail's intent receiver strips colors.
                            // The user MUST paste from the clipboard to get the colored HTML.
                            putExtra(Intent.EXTRA_TEXT, "")
                            putExtra(Intent.EXTRA_HTML_TEXT, "")
                            setPackage("com.google.android.gm")
                        }
                        
                        try {
                            startActivity(intent)
                            result.success(true)
                        } catch (e: Exception) {
                            result.error("NO_GMAIL", "Gmail app not installed", e.message)
                        }
                    } else {
                        result.error("INVALID_ARGS", "Missing arguments", null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }
}
