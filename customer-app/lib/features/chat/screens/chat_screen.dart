import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  final String bookingId;
  final String orderNumber;

  const ChatScreen({
    super.key,
    required this.bookingId,
    required this.orderNumber,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'Ramesh Kumar (Worker)',
      'text': 'Hello Sir, I have arrived at Dock 4 gate. Waiting for site entry badge.',
      'time': '10:02 AM',
      'isMe': 'false',
    },
    {
      'sender': 'You',
      'text': 'Gate supervisor has been informed. Please enter and meet Suresh at container bay.',
      'time': '10:05 AM',
      'isMe': 'true',
    },
  ];

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    setState(() {
      _messages.add({
        'sender': 'You',
        'text': _messageController.text.trim(),
        'time': '10:08 AM',
        'isMe': 'true',
      });
      _messageController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.orderNumber, style: const TextStyle(fontSize: 16)),
            const Text(
              'Booking Chat · Ramesh Kumar',
              style: TextStyle(fontSize: 11, color: Colors.white70),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Security Notice Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppTheme.primaryYellow.withOpacity(0.15),
            child: const Row(
              children: [
                Icon(Icons.shield_outlined, size: 16, color: AppTheme.primaryRed),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Chat is monitored for worker safety and verification.',
                    style: TextStyle(fontSize: 11, color: AppTheme.primaryText),
                  ),
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (ctx, index) {
                final msg = _messages[index];
                final isMe = msg['isMe'] == 'true';
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isMe ? AppTheme.primaryRed : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: isMe ? null : Border.all(color: Colors.black12),
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['text']!,
                          style: TextStyle(
                            fontSize: 13,
                            color: isMe ? Colors.white : AppTheme.primaryText,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['time']!,
                          style: TextStyle(
                            fontSize: 10,
                            color: isMe ? Colors.white70 : AppTheme.secondaryText,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.white,
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: const InputDecoration(
                        hintText: 'Type instructions or directions...',
                        border: InputBorder.none,
                        filled: false,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: AppTheme.primaryRed),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
