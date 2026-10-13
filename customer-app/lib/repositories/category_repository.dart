import '../core/network/api_client.dart';
import '../models/category_model.dart';

class CategoryRepository {
  final ApiClient apiClient;

  CategoryRepository(this.apiClient);

  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await apiClient.dio.get('/categories');
      if (response.data['success'] == true) {
        final List list = response.data['data'] ?? [];
        return list.map((e) => CategoryModel.fromJson(e)).toList();
      }
      return _fallbackCategories();
    } catch (e) {
      return _fallbackCategories();
    }
  }

  List<CategoryModel> _fallbackCategories() {
    return [
      CategoryModel(
        id: 'cat-1',
        name: 'Loading & Unloading',
        slug: 'loading-unloading',
        description: 'Heavy cargo, warehouse dispatch and truck relocation workers.',
        icon: 'Package',
        isActive: true,
        minPrice: 500,
        maxPrice: 3500,
        hourlyRate: 250,
        fullDayRate: 2000,
        halfDayRate: 1100,
        overtimeMultiplier: 1.5,
        requiredSkills: ['Heavy Lifting (30kg+)', 'Truck Stacking'],
      ),
      CategoryModel(
        id: 'cat-2',
        name: 'Food & Catering Service',
        slug: 'food-service',
        description: 'Tiffin preparation, event buffet servers and kitchen assistants.',
        icon: 'Utensils',
        isActive: true,
        minPrice: 400,
        maxPrice: 2800,
        hourlyRate: 180,
        fullDayRate: 1500,
        halfDayRate: 850,
        overtimeMultiplier: 1.25,
        requiredSkills: ['Hygiene Certification', 'Table Service'],
        isFoodTiffin: true,
      ),
    ];
  }
}
