# Best Practices & Anti-Patterns

---

## 🚫 Common Anti-Patterns to Avoid

### ❌ DON'T:
1. **Fetch data in components** → Use services + stores
2. **Hardcode colors/spacing** → Use design tokens
3. **Create giant monolithic components** → Break into atoms/molecules
4. **Mutate state directly** → Use immutable updates
5. **Skip type definitions** → Always define interfaces
6. **Ignore errors** → Handle all error cases
7. **Use inline styles** → Use CSS Modules
8. **Mix business logic with UI** → Separate into services

### ✅ DO:
1. **Use dependency injection** → Pass services/stores as props/hooks
2. **Keep components focused** → Single responsibility
3. **Write self-documenting code** → Clear names, minimal comments
4. **Handle loading/error states** → Every async operation
5. **Validate all inputs** → Use Zod schemas
6. **Use semantic HTML** → Accessibility first
7. **Test business logic** → Unit tests for calculations
8. **Follow the architecture** → Atomic Design hierarchy

---

## 📝 Code Patterns

### Form Handling Pattern

```typescript
function IngredientForm() {
  const [formData, setFormData] = useState<CreateIngredientInput>({...});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createIngredient } = useIngredientStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = createIngredientSchema.parse(formData);
      await createIngredient(validated);
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(error.flatten().fieldErrors);
      }
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Custom Hook Pattern

```typescript
// src/hooks/useIngredients.ts
export function useIngredients() {
  const { ingredients, fetchIngredients, isLoading } = useIngredientStore();
  
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);
  
  return { ingredients, isLoading };
}
```

---

**Last Updated:** 2026-02-04
