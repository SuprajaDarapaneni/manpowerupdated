import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:mime/mime.dart';
import 'package:shelf/shelf.dart' as shelf;
import 'package:shelf/shelf_io.dart' as shelf_io;

/// Embedded High-Performance Local Asset Server for Flutter
/// Serves the Vite production build directly from Flutter's rootBundle
/// with zero filesystem overhead, perfect MIME mapping, and full CORS support.
class LocalAssetServer {
  HttpServer? _server;
  int port = 0;

  Future<int> start() async {
    if (_server != null) return port;

    final handler = const shelf.Pipeline()
        .addHandler(_handleRequest);

    // Bind to loopback IPv4 with dynamic available port (port 0)
    _server = await shelf_io.serve(handler, InternetAddress.loopbackIPv4, 0);
    port = _server!.port;
    debugPrint('LocalAssetServer started successfully on http://127.0.0.1:$port');
    return port;
  }

  Future<shelf.Response> _handleRequest(shelf.Request request) async {
    var path = request.url.path;
    if (path.isEmpty || path == '/') {
      path = 'index.html';
    }

    // Strip leading slashes if any
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    final assetKey = 'assets/web/$path';

    try {
      final byteData = await rootBundle.load(assetKey);
      final bytes = byteData.buffer.asUint8List();
      final mimeType = lookupMimeType(path) ?? _guessMimeType(path);

      return shelf.Response.ok(
        bytes,
        headers: {
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      );
    } catch (_) {
      // Fallback to index.html for Single Page Application client-side routing
      try {
        final byteData = await rootBundle.load('assets/web/index.html');
        return shelf.Response.ok(
          byteData.buffer.asUint8List(),
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        );
      } catch (fallbackError) {
        return shelf.Response.notFound('Asset not found: $path ($fallbackError)');
      }
    }
  }

  String _guessMimeType(String path) {
    if (path.endsWith('.js') || path.endsWith('.mjs')) return 'application/javascript; charset=utf-8';
    if (path.endsWith('.css')) return 'text/css; charset=utf-8';
    if (path.endsWith('.html')) return 'text/html; charset=utf-8';
    if (path.endsWith('.json')) return 'application/json; charset=utf-8';
    if (path.endsWith('.svg')) return 'image/svg+xml';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    if (path.endsWith('.webp')) return 'image/webp';
    if (path.endsWith('.woff2')) return 'font/woff2';
    if (path.endsWith('.woff')) return 'font/woff';
    if (path.endsWith('.ttf')) return 'font/ttf';
    return 'application/octet-stream';
  }

  Future<void> stop() async {
    await _server?.close(force: true);
    _server = null;
  }
}
