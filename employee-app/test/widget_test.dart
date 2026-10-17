import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/main.dart';

void main() {
  testWidgets('Worker app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ManPowerLinkWorkerApp()));
    expect(find.byType(ManPowerLinkWorkerApp), findsOneWidget);
  });
}
