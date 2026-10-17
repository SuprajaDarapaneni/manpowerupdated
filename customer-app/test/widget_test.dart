import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/main.dart';

void main() {
  testWidgets('Customer app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ManPowerLinkCustomerApp()));
    expect(find.byType(ManPowerLinkCustomerApp), findsOneWidget);
  });
}
