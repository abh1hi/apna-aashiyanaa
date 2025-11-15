# Migration: Fix variants.sku unique index

Problem
- Existing unique index on `variants.sku` causes E11000 duplicate key errors when SKU is null/empty or when products are created without variants.

Solution
- Remove inline `unique: true` from `variantSchema.sku`.
- Add a partial unique index at the model level so uniqueness is enforced only when a non-empty string SKU exists.

Steps
1) Drop old index (name may vary, commonly `variants.sku_1`). Verify by listing indexes first.

```
db.products.getIndexes()
db.products.dropIndex('variants.sku_1')
```

2) Ensure app is deployed with the updated Product model (which includes):

```
productSchema.index(
  { 'variants.sku': 1 },
  { unique: true, partialFilterExpression: { 'variants.sku': { $exists: true, $type: 'string', $ne: '' } } }
);
```

3) (Optional) Recreate the partial unique index manually if your environment does not auto-sync indexes:

```
db.products.createIndex(
  { 'variants.sku': 1 },
  { unique: true, partialFilterExpression: { 'variants.sku': { $exists: true, $type: 'string', $ne: '' } } }
);
```

Rollback
- If needed, you can recreate the original index:
```
db.products.createIndex({ 'variants.sku': 1 }, { unique: true })
```

Notes
- With this change, products can be created without variants. When variants are later added, ensure each provided SKU is a non-empty string and unique across all variants.
